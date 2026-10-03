// Checkout orchestration: cart -> Portaus customer -> Portaus draft order -> Stripe PaymentIntent.
//
// checkoutPerso() and checkoutResto() are what the cart page calls (through
// /api/portaus/checkout/perso and /api/portaus/checkout/resto). Each one:
//   1. resolves the cart items against cms_saq.portaus_wines (bottles, not cases)
//   2. finds the customer (resto: SAQ number; perso: SAQ number, then email) or creates it
//   3. creates the order as "Brouillon - web"
//   4. opens a Stripe PaymentIntent for the agency fee + its taxes. The order stays
//      DRAFT_EXTERNAL until the webhook notes the payment on it and moves it to TO_PROCESS.
//
// Anything that stops the checkout is thrown as CheckoutError with an HTTP status and a JSON
// body the cart already knows how to display.

import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import Stripe from 'stripe';
import {
    createPersoCustomer,
    createRestoCustomer,
    findPersoByEmail,
    findPersoBySaqNumber,
    findRestoBySaqNumber,
    getCustomer,
    summarizeCustomer,
    type AddressInput,
    type ContactInput,
    type CustomerSummary
} from './customers';
import { OrderValidationError, PortausError } from './errors';
import { DELIVERY_TYPE } from './reference';
import { createDraftWebOrder, type CalculateResponse, type OrderLineInput, type SalesOrder } from './salesOrders';

export const ORGANIZATION_ID = 2;

export class CheckoutError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: Record<string, unknown> & { error: string; message: string }
    ) {
        super(body.message);
        this.name = 'CheckoutError';
    }
}

/** Turns a PortausError / OrderValidationError / anything into a CheckoutError. */
export function toCheckoutError(e: unknown, context: string): CheckoutError {
    if (e instanceof CheckoutError) return e;
    if (e instanceof OrderValidationError) {
        return new CheckoutError(409, { error: 'InsufficientQuantity', message: e.message, lines: e.lines });
    }
    if (e instanceof PortausError) {
        console.error(`${context}: Portaus error`, e.status, e.path, e.body);
        return new CheckoutError(502, { error: 'PortausError', message: e.detail, status: e.status, detail: e.body });
    }
    console.error(`${context} failed`, e);
    return new CheckoutError(500, { error: 'CheckoutFailed', message: (e as Error)?.message ?? String(e) });
}

// ---------- cart lines --------------------------------------------------------------------------

export type CartItemInput = {
    /**
     * cms_saq.portaus_wines.portaus_id — the Portaus product id, which the cart already stores as
     * item.id. Deliberately not called `id`: the cart used to send a batch id here, and both are
     * plain integers, so a stale client would otherwise order a different wine.
     */
    portaus_id: number | string;
    /** number of cases, exactly as the cart counts them */
    caseQuantity: number | string;
};

function toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

type WineRow = {
    portaus_id: number;
    puid: string;
    name: string;
    uvc: number;
    available_bottles: number;
};

/**
 * Cart items -> Portaus order lines, out of cms_saq.portaus_wines. The cart counts cases, Portaus
 * wants the product puid and a quantity in bottles.
 *
 * Stock is checked here against the synced `available_bottles` so a short cart gets a useful
 * answer without a round trip. Portaus re-checks it at calculate time, which stays the authority:
 * this table is only as fresh as the last sync.
 */
export async function resolveCartLines(supabase: SupabaseClient, items: CartItemInput[]): Promise<OrderLineInput[]> {
    const wanted = (items ?? []).filter((i) => toInt(i?.caseQuantity) > 0);
    if (!wanted.length) throw new CheckoutError(400, { error: 'EmptyCart', message: 'No items to order' });

    if (wanted.some((i) => toInt(i.portaus_id) <= 0)) {
        throw new CheckoutError(400, {
            error: 'StaleCart',
            message: 'Every cart item needs a portaus_id; reload the page and rebuild the cart'
        });
    }

    const ids = [...new Set(wanted.map((i) => toInt(i.portaus_id)))];
    const { data, error } = await supabase
        .schema('cms_saq')
        .from('portaus_wines')
        .select('portaus_id, puid, name, uvc, available_bottles')
        .in('portaus_id', ids)
        .eq('organization_id', ORGANIZATION_ID);

    if (error) {
        console.error('resolveCartLines: portaus_wines lookup failed', error);
        throw new CheckoutError(500, { error: 'LookupFailed', message: 'Could not resolve cart items' });
    }

    const wines = new Map((data ?? []).map((w: any) => [Number(w.portaus_id), w as WineRow]));
    const unknown = ids.filter((id) => !wines.has(id));
    if (unknown.length) {
        throw new CheckoutError(409, {
            error: 'UnknownWines',
            message: 'Some wines are no longer available to order',
            portausIds: unknown
        });
    }

    // Two cart rows can point at the same wine; Portaus wants one line per product.
    const byPuid = new Map<string, { wine: WineRow; cases: number }>();
    for (const item of wanted) {
        const wine = wines.get(toInt(item.portaus_id))!;
        const existing = byPuid.get(wine.puid);
        if (existing) existing.cases += toInt(item.caseQuantity);
        else byPuid.set(wine.puid, { wine, cases: toInt(item.caseQuantity) });
    }

    const short = [...byPuid.values()]
        .map(({ wine, cases }) => ({ wine, cases, bottles: cases * (wine.uvc > 0 ? wine.uvc : 1) }))
        .filter(({ wine, bottles }) => bottles > wine.available_bottles)
        .map(({ wine, cases, bottles }) => ({
            portausId: wine.portaus_id,
            puid: wine.puid,
            name: wine.name,
            requestedCases: cases,
            requested: bottles,
            quantityLeft: wine.available_bottles,
            casesLeft: Math.floor(wine.available_bottles / (wine.uvc > 0 ? wine.uvc : 1))
        }));

    if (short.length) {
        throw new CheckoutError(409, {
            error: 'InsufficientQuantity',
            message: 'Some wines are no longer available in the requested quantity',
            lines: short
        });
    }

    return [...byPuid.values()].map(({ wine, cases }) => ({
        puid: wine.puid,
        qty: cases * (wine.uvc > 0 ? wine.uvc : 1)
    }));
}

// ---------- payment -----------------------------------------------------------------------------

export type AgencyFeePayment = { clientSecret: string; paymentIntentId: string; amountCents: number };

/**
 * Opens the PaymentIntent for the billable part of the order (agency fee + its taxes) in OUR
 * Stripe account, tagged with the Portaus order so the webhook can find it. The order itself is
 * left untouched (DRAFT_EXTERNAL). Returns null when Stripe is not configured or nothing is billable.
 */
export async function createAgencyFeeIntent(
    order: SalesOrder,
    calculation: CalculateResponse,
    customer: CustomerSummary
): Promise<AgencyFeePayment | null> {
    const stripeKey = env['STRIPE_SK'] ?? env['STRIPE_SK_TEST'];
    const amountCents = Math.round(Number(calculation.totalBillable) * 100);
    if (!stripeKey || amountCents <= 0) return null;

    const stripe = new Stripe(stripeKey);
    const intent = await stripe.paymentIntents.create(
        {
            amount: amountCents,
            currency: 'cad',
            automatic_payment_methods: { enabled: true },
            receipt_email: customer.email ?? undefined,
            description: `Commande ${order.soNumber} — frais d'agence`,
            metadata: {
                portausSalesOrderId: String(order.id),
                portausSoNumber: order.soNumber,
                portausCustomerId: String(customer.id),
                customerType: customer.type,
                organizationId: String(ORGANIZATION_ID)
            }
        },
        // One intent per order even if the request is retried.
        { idempotencyKey: `portaus-order-${order.id}` }
    );

    return { clientSecret: intent.client_secret!, paymentIntentId: intent.id, amountCents };
}

// ---------- shared input shapes -----------------------------------------------------------------

export type WireContact = { first_name?: string; last_name?: string; email?: string; phone?: string | null };
export type WireAddress = { street?: string; city?: string; postal_code?: string };

function contactInput(c: WireContact | null | undefined, label: string): ContactInput {
    if (!c?.first_name?.trim() || !c?.last_name?.trim() || !c?.email?.trim()) {
        throw new CheckoutError(400, {
            error: 'MissingContact',
            message: `${label} needs first_name, last_name and email`
        });
    }
    return { firstName: c.first_name, lastName: c.last_name, email: c.email, phone: c.phone ?? null };
}

function addressInput(a: WireAddress | null | undefined, label: string): AddressInput {
    if (!a?.street?.trim() || !a?.city?.trim() || !a?.postal_code?.trim()) {
        throw new CheckoutError(400, {
            error: 'MissingAddress',
            message: `${label} needs street, city and postal_code`
        });
    }
    return { street: a.street, city: a.city, postalCode: a.postal_code };
}

function normalizeSaq(v: unknown): string | null {
    const s = String(v ?? '')
        .replace(/\s+/g, '')
        .trim();
    return s || null;
}

export type CheckoutResult = {
    customerId: number;
    customerCreated: boolean;
    salesOrderId: number;
    /** SO number as shown in Portaus, e.g. SO0000024727 */
    salesOrderNumber: string;
    orderStatus: string | null;
    total: number;
    totalBillable: number;
    totalUnbillable: number;
    taxes: CalculateResponse['taxes'];
    /** null when Stripe is not configured; the order then stays DRAFT_EXTERNAL */
    clientSecret: string | null;
    paymentIntentId: string | null;
    /** what Stripe charges now, in dollars */
    amountBillable: number;
};

function requireBillingIds(customer: CustomerSummary) {
    if (!customer.billingContactId || !customer.billingAddressId) {
        throw new CheckoutError(409, {
            error: 'IncompleteCustomer',
            message: 'Customer has no billing contact or address in Portaus',
            customer
        });
    }
    return { billingContactId: customer.billingContactId, billingAddressId: customer.billingAddressId };
}

async function finishCheckout(
    customer: CustomerSummary,
    customerCreated: boolean,
    order: SalesOrder,
    calculation: CalculateResponse
): Promise<CheckoutResult> {
    let payment: AgencyFeePayment | null;
    try {
        payment = await createAgencyFeeIntent(order, calculation, customer);
    } catch (e) {
        // The order exists in Portaus (as "Brouillon - web") but no payment can be taken: bad or
        // expired Stripe key, Stripe outage… Say so precisely instead of a generic failure.
        console.error(`checkout: PaymentIntent for order ${order.soNumber} (${order.id}) failed`, e);
        throw new CheckoutError(502, {
            error: 'PaymentUnavailable',
            message: 'Order created but the online payment could not be set up',
            salesOrderId: order.id,
            salesOrderNumber: order.soNumber,
            detail: (e as Error)?.message ?? String(e)
        });
    }
    return {
        customerId: customer.id,
        customerCreated,
        salesOrderId: order.id,
        salesOrderNumber: order.soNumber,
        orderStatus: order.status?.code ?? null,
        total: calculation.total,
        totalBillable: calculation.totalBillable,
        totalUnbillable: calculation.totalUnbillable,
        taxes: calculation.taxes,
        clientSecret: payment?.clientSecret ?? null,
        paymentIntentId: payment?.paymentIntentId ?? null,
        amountBillable: payment ? payment.amountCents / 100 : calculation.totalBillable
    };
}

// ---------- perso -------------------------------------------------------------------------------

export type PersoCheckoutInput = {
    items: CartItemInput[];
    /** SAQ branch for pickup: cms_saq.saq_branches.id (same id in Portaus) */
    saq_branch_id: number | string;
    saq_number?: string | null;
    billing_contact: WireContact;
    billing_address: WireAddress;
    reference?: string | null;
    notes?: string | null;
};

/**
 * Perso (individual) checkout. The customer is matched by SAQ number when given, otherwise by
 * email; a new one is created when nothing matches. Pickup is always at an SAQ branch.
 */
export async function checkoutPerso(supabase: SupabaseClient, input: PersoCheckoutInput): Promise<CheckoutResult> {
    const contact = contactInput(input.billing_contact, 'billing_contact');
    const address = addressInput(input.billing_address, 'billing_address');
    const saqBranchId = toInt(input.saq_branch_id);
    if (!saqBranchId)
        throw new CheckoutError(400, { error: 'MissingBranch', message: 'A perso order needs a saq_branch_id' });
    const saqNumber = normalizeSaq(input.saq_number);

    const lines = await resolveCartLines(supabase, input.items);

    try {
        let detail =
            (saqNumber ? await findPersoBySaqNumber(saqNumber) : null) ?? (await findPersoByEmail(contact.email));
        let created = false;
        if (!detail) {
            const id = await createPersoCustomer({
                contact,
                billingAddress: address,
                saqNumber,
                saqLocationId: saqBranchId
            });
            detail = await getCustomer(id);
            created = true;
        }
        const customer = summarizeCustomer(detail);
        const { billingContactId, billingAddressId } = requireBillingIds(customer);

        const { order, calculation } = await createDraftWebOrder({
            customerId: customer.id,
            billingContactId,
            billingAddressId,
            shippingContactId: billingContactId,
            shippingAddressId: billingAddressId,
            deliveryTypeId: DELIVERY_TYPE.SAQ_BRANCH,
            saqLocationId: saqBranchId,
            lines,
            reference: input.reference ?? null,
            notes: input.notes ?? null
        });

        return await finishCheckout(customer, created, order, calculation);
    } catch (e) {
        throw toCheckoutError(e, 'checkoutPerso');
    }
}

// ---------- resto -------------------------------------------------------------------------------

export type RestoCheckoutInput = {
    items: CartItemInput[];
    /** 8-digit SAQ customer number; identifies the resto */
    saq_number: string;
    /** establishment name; required only when the resto does not exist yet */
    company_name?: string | null;
    /** cart select: 0 = delivery to the establishment, 3 = SAQ branch pickup */
    resto_delivery_type: number | string;
    /** required when resto_delivery_type is 3 */
    saq_branch_id?: number | string | null;
    billing_contact: WireContact;
    billing_address: WireAddress;
    shipping_contact?: WireContact | null;
    shipping_address?: WireAddress | null;
    reference?: string | null;
    notes?: string | null;
};

/** The cart's "Pour la cueillette" select: 0 = establishment delivery, 3 = SAQ branch. */
function restoDeliveryTypeId(v: unknown): number {
    const n = toInt(v);
    if (n === 3) return DELIVERY_TYPE.SAQ_BRANCH;
    if (n === 0) return DELIVERY_TYPE.RESTO_BEFORE_16H;
    return n > 0 ? n : DELIVERY_TYPE.RESTO_BEFORE_16H;
}

/**
 * Resto (licensee) checkout. The resto is matched by SAQ number; when unknown it is created
 * with the company name, the billing contact / address and, if given, a separate shipping
 * contact / address. The agency fee is charged online exactly like a perso order.
 */
export async function checkoutResto(supabase: SupabaseClient, input: RestoCheckoutInput): Promise<CheckoutResult> {
    const saqNumber = normalizeSaq(input.saq_number);
    if (!saqNumber)
        throw new CheckoutError(400, { error: 'MissingSaqNumber', message: 'A resto is identified by its SAQ number' });

    const billingContact = contactInput(input.billing_contact, 'billing_contact');
    const billingAddress = addressInput(input.billing_address, 'billing_address');
    const shippingContact = input.shipping_contact ? contactInput(input.shipping_contact, 'shipping_contact') : null;
    const shippingAddress = input.shipping_address ? addressInput(input.shipping_address, 'shipping_address') : null;

    const deliveryTypeId = restoDeliveryTypeId(input.resto_delivery_type);
    const saqBranchId = toInt(input.saq_branch_id) || null;
    if (deliveryTypeId === DELIVERY_TYPE.SAQ_BRANCH && !saqBranchId) {
        throw new CheckoutError(400, { error: 'MissingBranch', message: 'Branch delivery needs a saq_branch_id' });
    }

    const lines = await resolveCartLines(supabase, input.items);

    try {
        let detail = await findRestoBySaqNumber(saqNumber);
        let created = false;
        if (!detail) {
            const companyName = input.company_name?.trim();
            if (!companyName) {
                throw new CheckoutError(400, {
                    error: 'MissingCompany',
                    message: 'This SAQ number is not known yet; company_name is required to create the resto'
                });
            }
            const id = await createRestoCustomer({
                company: { name: companyName, email: billingContact.email, phone: billingContact.phone ?? null },
                saqNumber,
                billingContact,
                shippingContact,
                billingAddress,
                shippingAddress,
                deliveryTypeId,
                saqLocationId: saqBranchId
            });
            detail = await getCustomer(id);
            created = true;
        }
        const customer = summarizeCustomer(detail);
        const { billingContactId, billingAddressId } = requireBillingIds(customer);

        const { order, calculation } = await createDraftWebOrder({
            customerId: customer.id,
            billingContactId,
            billingAddressId,
            shippingContactId: customer.shippingContactId ?? billingContactId,
            shippingAddressId: customer.shippingAddressId ?? billingAddressId,
            deliveryTypeId,
            saqLocationId: deliveryTypeId === DELIVERY_TYPE.SAQ_BRANCH ? saqBranchId : null,
            lines,
            reference: input.reference ?? null,
            notes: input.notes ?? null
        });

        return await finishCheckout(customer, created, order, calculation);
    } catch (e) {
        throw toCheckoutError(e, 'checkoutResto');
    }
}

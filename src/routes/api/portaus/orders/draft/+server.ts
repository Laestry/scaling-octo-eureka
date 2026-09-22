// POST /api/portaus/orders/draft
//
// Creates the order in Portaus as "Brouillon - web" (DRAFT_EXTERNAL) for an EXISTING customer,
// and when Stripe is configured opens a PaymentIntent for the billable part (agency fee + its
// taxes) and moves the order to WAITING_PAYMENT. The cart does not call this directly: it goes
// through /api/portaus/checkout/{perso,resto}, which also find or create the customer. This
// route is the lower-level building block, useful for the admin panel and for testing.
//
// Body:
//   { customer_id: number,
//     items: [{ id: <cms_saq.alcohol_batches.id>, caseQuantity: number }],
//     delivery?: { resto_delivery_type?: 0 | 3, saq_branch_id?: number },
//     billing_contact_id?, billing_address_id?, shipping_contact_id?, shipping_address_id?,
//     reference?, notes?, create_payment_intent?: boolean (default true) }
//
// Contact / address ids default to the customer's own (perso: the contact and its billing
// address; resto: the default billing / shipping contacts and addresses).

import { json, type RequestHandler } from '@sveltejs/kit';
import {
    CheckoutError,
    DELIVERY_TYPE,
    createAgencyFeeIntent,
    createDraftWebOrder,
    getCustomer,
    resolveCartLines,
    summarizeCustomer,
    toCheckoutError
} from '$lib/server/portausAdmin';

function toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    const customerId = toInt(body?.customer_id);
    if (!customerId) return json({ error: 'MissingCustomer', message: 'customer_id is required' }, { status: 400 });

    try {
        // ---- 1. batches -> puids, cases -> bottles --------------------------------------------
        const lines = await resolveCartLines(locals.supabase, body.items ?? []);

        // ---- 2. customer defaults --------------------------------------------------------------
        const customer = summarizeCustomer(await getCustomer(customerId));
        const billingContactId = toInt(body.billing_contact_id) || customer.billingContactId;
        const billingAddressId = toInt(body.billing_address_id) || customer.billingAddressId;
        if (!billingContactId || !billingAddressId) {
            return json(
                {
                    error: 'IncompleteCustomer',
                    message: 'Customer has no billing contact or address in Portaus',
                    customer
                },
                { status: 409 }
            );
        }

        // ---- 3. delivery -----------------------------------------------------------------------
        const saqBranchId = toInt(body.delivery?.saq_branch_id) || null;
        let deliveryTypeId: number;
        if (customer.type === 'perso') {
            deliveryTypeId = DELIVERY_TYPE.SAQ_BRANCH;
            if (!saqBranchId && !customer.saqLocationId) {
                return json(
                    { error: 'MissingBranch', message: 'A perso order needs a saq_branch_id' },
                    { status: 400 }
                );
            }
        } else {
            const t = toInt(body.delivery?.resto_delivery_type);
            deliveryTypeId =
                t === 3
                    ? DELIVERY_TYPE.SAQ_BRANCH
                    : t > 0
                      ? t
                      : (customer.deliveryTypeId ?? DELIVERY_TYPE.RESTO_BEFORE_16H);
        }
        const saqLocationId =
            deliveryTypeId === DELIVERY_TYPE.SAQ_BRANCH ? (saqBranchId ?? customer.saqLocationId) : null;

        // ---- 4. Portaus draft ------------------------------------------------------------------
        const { order, calculation } = await createDraftWebOrder({
            customerId,
            billingContactId,
            billingAddressId,
            shippingContactId: toInt(body.shipping_contact_id) || customer.shippingContactId || billingContactId,
            shippingAddressId: toInt(body.shipping_address_id) || customer.shippingAddressId || billingAddressId,
            deliveryTypeId,
            saqLocationId,
            lines,
            reference: body.reference ?? null,
            notes: body.notes ?? null
        });

        // ---- 5. Stripe PaymentIntent for the billable part --------------------------------------
        const payment =
            body.create_payment_intent === false ? null : await createAgencyFeeIntent(order, calculation, customer);

        return json(
            {
                salesOrderId: order.id,
                soNumber: order.soNumber,
                status: payment ? 'WAITING_PAYMENT' : (order.status?.code ?? null),
                total: calculation.total,
                totalBillable: calculation.totalBillable,
                totalUnbillable: calculation.totalUnbillable,
                taxes: calculation.taxes,
                deliveryTypeId,
                saqLocationId,
                payment: payment
                    ? {
                          clientSecret: payment.clientSecret,
                          paymentIntentId: payment.paymentIntentId,
                          amount: payment.amountCents
                      }
                    : null
            },
            { status: 201 }
        );
    } catch (e) {
        const err = e instanceof CheckoutError ? e : toCheckoutError(e, 'orders/draft');
        return json(err.body, { status: err.status });
    }
};

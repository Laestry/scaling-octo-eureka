// POST /api/portaus/createPersoOrder — the cart's checkout (perso orders only)
//
// The official Portaus API only takes orders from individuals, so this is the site's only order
// path. Two calls, both on the integration API ($lib/server/portausApi):
//
//   1. POST /api/v1/sales-orders/calculate -> prices, taxes, totals, signature
//   2. POST /api/v1/payments/intents       -> Portaus sales order ("Brouillon") + Stripe PaymentIntent
//
// Step 2 takes step 1's response back verbatim. Editing any amount in between breaks the
// signature, so the totals are never built here and never accepted from the browser.
//
// The browser then confirms the PaymentIntent with Stripe (/pay). Stripe notifies Portaus directly
// (its own webhook endpoint), and Portaus invoices the payment and moves the order forward: this
// site writes nothing more in Portaus.
//
// Body: { items: [{ portaus_id, caseQuantity }], customer: {...} }

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { PORTAUS_COMPANY_ID, calculateSalesOrder, createPaymentIntent } from '$lib/server/portausApi';

const ORGANIZATION_ID = 2;

type IncomingItem = {
    /** cms_saq.portaus_wines.portaus_id — the Portaus product id the cart stores as item.id */
    portaus_id: number | string;
    /** number of cases, exactly as the cart counts them */
    caseQuantity: number | string;
};

type IncomingCustomer = {
    /** cms_saq.saq_branches.id of the pickup branch (same id in Portaus) */
    saq_branch_id?: number | string | null;
    billing_address: { street: string; city: string; postal_code: string };
    billing_contact: { first_name: string; last_name: string; email: string; phone: string };
};

function toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    let payload: { items?: IncomingItem[]; customer?: IncomingCustomer };
    try {
        payload = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    const items = (payload.items ?? []).filter((i) => toInt(i.caseQuantity) > 0 && toInt(i.portaus_id) > 0);
    const customer = payload.customer;

    if (!items.length) return json({ error: 'EmptyCart', message: 'No items to order' }, { status: 400 });
    if (!customer?.billing_contact || !customer?.billing_address) {
        return json(
            { error: 'MissingCustomer', message: 'billing_contact and billing_address are required' },
            { status: 400 }
        );
    }
    const branchId = toInt(customer.saq_branch_id);
    if (!branchId) return json({ error: 'MissingBranch', message: 'Choose an SAQ branch' }, { status: 400 });

    // ---- 1. wines -> puids ---------------------------------------------------------------------
    const ids = [...new Set(items.map((i) => toInt(i.portaus_id)))];
    const { data: wines, error: wineError } = await locals.supabase
        .schema('cms_saq')
        .from('portaus_wines')
        .select('portaus_id, puid, uvc, name')
        .in('portaus_id', ids)
        .eq('organization_id', ORGANIZATION_ID);

    if (wineError) {
        console.error('createPersoOrder: wine lookup failed', wineError);
        return json({ error: 'LookupFailed', message: 'Could not resolve cart items' }, { status: 500 });
    }

    const byId = new Map((wines ?? []).map((w: any) => [Number(w.portaus_id), w]));
    const missing = ids.filter((id) => !byId.get(id)?.puid);
    if (missing.length) {
        return json(
            { error: 'UnknownWines', message: 'Some cart items are no longer offered', portausIds: missing },
            { status: 409 }
        );
    }

    // qty is in BOTTLES, not cases: a uvc-12 product at qty 1 costs one bottle.
    const lineMap = new Map<string, { puid: string; qty: number; name: string; portausId: number }>();
    for (const item of items) {
        const wine: any = byId.get(toInt(item.portaus_id));
        const uvc = toInt(wine.uvc) > 0 ? toInt(wine.uvc) : 1;
        const bottles = toInt(item.caseQuantity) * uvc;
        const line = lineMap.get(wine.puid);
        if (line) line.qty += bottles;
        else lineMap.set(wine.puid, { puid: wine.puid, qty: bottles, name: wine.name, portausId: wine.portaus_id });
    }
    const lines = [...lineMap.values()];

    // ---- 2. calculate -------------------------------------------------------------------------
    const calc = await calculateSalesOrder(lines);
    if (!calc.ok || !calc.body?.signature) {
        console.error('createPersoOrder: calculate failed', calc.status, calc.body);
        return json(
            { error: 'CalculateFailed', message: 'Could not price this order', detail: calc.body },
            { status: 502 }
        );
    }

    // Stock problems come back as HTTP 200 with per-line validations, and the failing line priced
    // at 0 under a still-valid signature: never fall through to the intent on a validation.
    // Response lines keep request order. A puid Portaus does not know gives the same validation
    // with an empty product object.
    const unavailable = (calc.body.lines ?? [])
        .map((line: any, i: number) => ({ line, meta: lines[i] }))
        .filter(({ line }: any) => (line.validations ?? []).length > 0)
        .map(({ line, meta }: any) => ({
            reason: line.product?.id ? 'InsufficientQuantity' : 'UnknownProduct',
            portausId: meta?.portausId ?? null,
            puid: meta?.puid ?? line.product?.puid ?? null,
            name: meta?.name ?? line.product?.name ?? null,
            requested: line.qty,
            quantityLeft: line.quantityLeft ?? 0,
            messages: (line.validations ?? []).map((v: any) => v.message ?? String(v))
        }));

    if (unavailable.length) {
        return json(
            {
                error: 'InsufficientQuantity',
                message: 'Some wines are no longer available in the requested quantity',
                lines: unavailable
            },
            { status: 409 }
        );
    }

    // ---- 3. pickup branch ---------------------------------------------------------------------
    const { data: branch, error: branchError } = await locals.supabase
        .schema('cms_saq')
        .from('saq_branches')
        .select('id, number, city, phone, address')
        .eq('id', branchId)
        .single();

    if (branchError || !branch) {
        return json({ error: 'MissingBranch', message: 'Selected SAQ branch was not found', branchId }, { status: 400 });
    }

    // ---- 4. payment intent --------------------------------------------------------------------
    // Perso orders are picked up at the SAQ branch: no shipping address, and billing must not be
    // quietly reused as one.
    const intentBody = {
        ...calc.body, // lines, prices, taxes, totals and signature, untouched
        customer: {
            firstName: customer.billing_contact.first_name,
            lastName: customer.billing_contact.last_name,
            email: customer.billing_contact.email,
            phone: customer.billing_contact.phone,
            billingAddress: {
                street: customer.billing_address.street,
                city: customer.billing_address.city,
                postalCode: customer.billing_address.postal_code
            }
        },
        deliveryBranch: {
            id: branch.id,
            number: branch.number,
            city: branch.city,
            phone: branch.phone,
            addressLine: branch.address
        },
        portausCompanyId: PORTAUS_COMPANY_ID
    };

    const intent = await createPaymentIntent(intentBody);
    if (!intent.ok) {
        console.error('createPersoOrder: payment intent failed', intent.status, intent.body);
        return json(
            { error: 'IntentFailed', message: 'Could not create the order', detail: intent.body },
            { status: 502 }
        );
    }

    const intentPayment = intent.body?.detail?.intentPayment;
    const clientSecret = intentPayment?.client_secret ?? null;
    if (!clientSecret) {
        console.error('createPersoOrder: intent returned no client_secret', intent.body);
        return json(
            { error: 'IntentFailed', message: 'Order was created without a payment intent', detail: intent.body },
            { status: 502 }
        );
    }

    return json({
        clientSecret,
        // What Stripe actually charges — the agency fee. `total` is what the whole order is
        // worth; the balance is billed by the SAQ, not by us.
        amountBillable: Number(intent.body.amount ?? calc.body.totalBillable) || 0,
        total: Number(calc.body.total) || 0,
        salesOrderId: intent.body?.detail?.salesOrders?.[0]?.id ?? null,
        salesOrderNumber: intentPayment?.metadata?.sales_order_number ?? null
    });
};

// src/routes/api/portaus/createPersoOrder/+server.ts
//
// Replaces /api/submit-order. That route posted the cart to enos.is and got back a
// hosted-checkout URL; Portaus now wants the two-step sequence itself:
//
//   1. POST /api/latest/sales-orders/calculate/  -> prices, taxes, totals, bcrypt signature
//   2. POST /api/v1/payments/intents/            -> Portaus sales order + Stripe PaymentIntent
//
// Step 2 takes step 1's response back verbatim. Editing any amount in between breaks the
// signature, so the totals are never built here and never accepted from the browser.

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { PORTAUS_BASE, PORTAUS_API_KEY, PORTAUS_JWT_SECRET } from '$env/static/private';
import crypto from 'node:crypto';

const CALCULATE_PATH = '/api/latest/sales-orders/calculate/';
const PAYMENT_INTENTS_PATH = '/api/v1/payments/intents/';

// Portaus's own inventory record reports portausCompanyId 1 for the "Importation privée"
// inventory, which is the only one this shop sells out of.
const PORTAUS_COMPANY_ID = 1;

const ORGANIZATION_ID = 2;

type IncomingItem = {
    /** cms_saq.alcohol_batches.id — what the cart already stores as selected_batch_id */
    id: number | string;
    /** number of cases, exactly as the cart counts them */
    caseQuantity: number | string;
};

type IncomingCustomer = {
    saq_store_id?: number | string | null;
    saq_number?: string | null;
    resto_delivery_type?: number | null;
    billing_address: { street: string; city: string; postal_code: string };
    billing_contact: { first_name: string; last_name: string; email: string; phone: string };
    /** resto orders only — falls back to the billing address when absent */
    shipping_address?: { street: string; city: string; postal_code: string } | null;
};

/**
 * Portaus expects `apikey: <HS256 JWT>` with the API key under the claim `API_KEY`.
 * Signed here with node:crypto rather than jsonwebtoken — same output, no untyped dependency.
 */
function apiKeyToken(): string {
    const b64url = (input: string) => Buffer.from(input, 'utf8').toString('base64url');
    const now = Math.floor(Date.now() / 1000);

    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const claims = b64url(JSON.stringify({ API_KEY: PORTAUS_API_KEY.trim(), iat: now, exp: now + 3600 }));
    const signingInput = `${header}.${claims}`;
    const signature = crypto.createHmac('sha256', PORTAUS_JWT_SECRET).update(signingInput).digest('base64url');

    return `${signingInput}.${signature}`;
}

async function portaus(path: string, body: unknown) {
    const res = await fetch(`${PORTAUS_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Accept-Language': 'fr-CA',
            'Content-Type': 'application/json',
            apikey: apiKeyToken()
        },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    let parsed: any = null;
    try {
        parsed = JSON.parse(text);
    } catch {
        /* keep the raw text below */
    }
    return { ok: res.ok, status: res.status, body: parsed ?? text };
}

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

    const items = (payload.items ?? []).filter((i) => toInt(i.caseQuantity) > 0);
    const customer = payload.customer;

    if (!items.length) return json({ error: 'EmptyCart', message: 'No items to order' }, { status: 400 });
    if (!customer?.billing_contact || !customer?.billing_address) {
        return json(
            { error: 'MissingCustomer', message: 'billing_contact and billing_address are required' },
            { status: 400 }
        );
    }

    // ---- 1. batch ids -> Portaus product puids ------------------------------------------------
    // The cart speaks in batches, the new API only knows products. alcohol.uuid IS the Portaus
    // puid and alcohol.id IS the Portaus product id, so one join gets us there.
    const batchIds = items.map((i) => toInt(i.id));

    const { data: batches, error: batchError } = await locals.supabase
        .schema('cms_saq')
        .from('alcohol_batches')
        .select('id, alcohol_id, vintage, alcohol!inner(id, uuid, uvc, name)')
        .in('id', batchIds)
        .eq('organization_id', ORGANIZATION_ID)
        .eq('is_archived', false);

    if (batchError) {
        console.error('createPersoOrder: batch lookup failed', batchError);
        return json({ error: 'LookupFailed', message: 'Could not resolve cart items' }, { status: 500 });
    }

    const byBatchId = new Map((batches ?? []).map((b: any) => [Number(b.id), b]));

    const missing = batchIds.filter((id) => !byBatchId.has(id));
    if (missing.length) {
        return json(
            { error: 'InvalidBatches', message: 'Some cart items no longer exist', batchIds: missing },
            { status: 409 }
        );
    }

    // A product with no puid cannot be sold through this API at all — there is no other
    // identifier calculate accepts. Fail loudly rather than silently dropping the line.
    const withoutPuid = (batches ?? []).filter((b: any) => !b.alcohol?.uuid);
    if (withoutPuid.length) {
        console.error(
            'createPersoOrder: products missing puid',
            withoutPuid.map((b: any) => b.alcohol_id)
        );
        return json(
            {
                error: 'ProductNotSellable',
                message: 'Some wines are not available for online order',
                products: withoutPuid.map((b: any) => ({ batchId: b.id, name: b.alcohol?.name ?? null }))
            },
            { status: 409 }
        );
    }

    // qty is in BOTTLES, not cases. Verified against the live API: a uvc-12 product at qty 1
    // costs one bottle's price, and the subtotal scales linearly with qty.
    //
    // Two cart rows can be different batches of the same wine, which collapse to one puid.
    // Merge them, but remember which cart rows fed each line so validation errors can name them.
    const lineMap = new Map<string, { puid: string; qty: number; name: string; batchIds: number[] }>();

    for (const item of items) {
        const batch: any = byBatchId.get(toInt(item.id));
        const uvc = toInt(batch.alcohol.uvc) > 0 ? toInt(batch.alcohol.uvc) : 1;
        const bottles = toInt(item.caseQuantity) * uvc;
        const puid: string = batch.alcohol.uuid;

        const existing = lineMap.get(puid);
        if (existing) {
            existing.qty += bottles;
            existing.batchIds.push(toInt(item.id));
        } else {
            lineMap.set(puid, { puid, qty: bottles, name: batch.alcohol.name, batchIds: [toInt(item.id)] });
        }
    }

    const lines = [...lineMap.values()];

    // ---- 2. calculate -------------------------------------------------------------------------
    const calc = await portaus(CALCULATE_PATH, {
        customer: { id: null },
        lines: lines.map((l) => ({ product: { puid: l.puid }, qty: l.qty }))
    });

    if (!calc.ok || !calc.body?.signature) {
        console.error('createPersoOrder: calculate failed', calc.status, calc.body);
        return json(
            { error: 'CalculateFailed', message: 'Could not price this order', detail: calc.body },
            { status: 502 }
        );
    }

    // Stock problems come back as HTTP 200 with per-line validations, so res.ok is not enough.
    // Response lines keep request order, which is what lets us map them back to cart rows.
    //
    // A puid Portaus does not know produces the same "Insufficient quantity" validation as a
    // genuine stock shortage, but with an empty product object. Worth telling apart: one means
    // "come back later", the other means our catalogue is out of sync and nobody should wait.
    const unavailable = (calc.body.lines ?? [])
        .map((line: any, i: number) => ({ line, meta: lines[i] }))
        .filter(({ line }: any) => (line.validations ?? []).length > 0)
        .map(({ line, meta }: any) => ({
            reason: line.product?.id ? 'InsufficientQuantity' : 'UnknownProduct',
            batchIds: meta?.batchIds ?? [],
            puid: meta?.puid ?? line.product?.puid ?? null,
            name: meta?.name ?? line.product?.name ?? null,
            requested: line.qty,
            quantityLeft: line.quantityLeft ?? 0,
            messages: (line.validations ?? []).map((v: any) => v.message ?? String(v))
        }));

    if (unavailable.length) {
        const unknown = unavailable.filter((l: any) => l.reason === 'UnknownProduct');
        if (unknown.length) {
            console.error(
                'createPersoOrder: puids Portaus does not recognise',
                unknown.map((l: any) => l.puid)
            );
        }

        // Note the totals and signature come back valid even when a line fails, with the failing
        // line priced at 0 — so never fall through to the intent call on a validation error.
        return json(
            {
                error: 'InsufficientQuantity',
                message: 'Some wines are no longer available in the requested quantity',
                lines: unavailable
            },
            { status: 409 }
        );
    }

    // ---- 3. delivery branch -------------------------------------------------------------------
    // saq_branches already carries exactly the shape Portaus wants; only `address` is renamed.
    let deliveryBranch: Record<string, unknown> | undefined;
    const branchId = toInt(customer.saq_store_id);

    if (branchId) {
        const { data: branch, error: branchError } = await locals.supabase
            .schema('cms_saq')
            .from('saq_branches')
            .select('id, number, city, phone, address')
            .eq('id', branchId)
            .single();

        if (branchError || !branch) {
            return json(
                { error: 'InvalidBranch', message: 'Selected SAQ branch was not found', branchId },
                { status: 400 }
            );
        }

        deliveryBranch = {
            id: branch.id,
            number: branch.number,
            city: branch.city,
            phone: branch.phone,
            addressLine: branch.address
        };
    }

    // ---- 4. payment intent --------------------------------------------------------------------
    const billing = {
        street: customer.billing_address.street,
        city: customer.billing_address.city,
        postalCode: customer.billing_address.postal_code
    };
    // Perso orders are collected in person at an SAQ branch — deliveryBranch is the destination,
    // so there is no delivery address to send and billing must not be quietly reused as one.
    // Only resto orders, which pick a delivery type, carry a shipping address.
    const isRestoOrder = customer.resto_delivery_type != null;
    const shippingSource = customer.shipping_address ?? customer.billing_address;
    const shipping = isRestoOrder
        ? {
              street: shippingSource.street,
              city: shippingSource.city,
              postalCode: shippingSource.postal_code
          }
        : undefined;

    const intentBody = {
        ...calc.body, // lines, prices, taxes, totals and signature, untouched
        customer: {
            firstName: customer.billing_contact.first_name,
            lastName: customer.billing_contact.last_name,
            email: customer.billing_contact.email,
            phone: customer.billing_contact.phone,
            billingAddress: billing,
            ...(shipping ? { shippingAddress: shipping } : {})
        },
        ...(deliveryBranch ? { deliveryBranch } : {}),
        portausCompanyId: PORTAUS_COMPANY_ID
    };

    const intent = await portaus(PAYMENT_INTENTS_PATH, intentBody);

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
        amountBillable: intent.body.amount ?? calc.body.totalBillable,
        total: calc.body.total,
        totalBillable: calc.body.totalBillable,
        totalUnbillable: calc.body.totalUnbillable,
        taxes: calc.body.taxes,
        salesOrderId: intent.body?.detail?.salesOrders?.[0]?.id ?? null,
        salesOrderNumber: intentPayment?.metadata?.sales_order_number ?? null
    });
};

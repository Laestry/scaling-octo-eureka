// Portaus's public ordering API: authenticated with the API key, never with a login.
//
// This is the other half of how Portaus can be reached. `portausAdmin/` signs in with
// PORTAUS_LOGIN / PORTAUS_PASSWORD and drives the same endpoints the Portaus web app uses.
// Here there is no session at all: every call carries an `apikey` header holding an HS256 JWT
// that wraps PORTAUS_API_KEY, and Portaus exposes a small, self-contained ordering surface.
//
//   1. POST /api/latest/sales-orders/calculate/  -> prices, taxes, totals, and a signature
//   2. POST /api/v1/payments/intents/            -> Portaus sales order + Stripe PaymentIntent
//
// Step 2 takes step 1's response back verbatim. The signature covers the amounts, so nothing in
// between may touch them: totals are never built here and never accepted from the browser.
//
// Two consequences worth keeping in mind:
//   - No customer record is created or looked up. The buyer's details ride along on the intent,
//     so none of the customer search / create code in portausAdmin is involved.
//   - The PaymentIntent is opened in PORTAUS's Stripe account, not ours. The browser therefore
//     needs Portaus's publishable key to confirm it, and our own Stripe webhook never sees it.

import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CheckoutError, resolveCartWines, type CartItemInput } from './portausAdmin/checkout';

const CALCULATE_PATH = '/api/latest/sales-orders/calculate/';
const PAYMENT_INTENTS_PATH = '/api/v1/payments/intents/';

/**
 * Portaus's own inventory record reports portausCompanyId 1 for the "Importation privée"
 * inventory, which is the only one this shop sells out of.
 */
const PORTAUS_COMPANY_ID = 1;

/** Portaus expects `apikey: <HS256 JWT>` with the API key under the claim `API_KEY`. */
function apiKeyToken(): string {
    const apiKey = env['PORTAUS_API_KEY'];
    const secret = env['PORTAUS_JWT_SECRET'];
    if (!apiKey || !secret) throw new Error('PORTAUS_API_KEY / PORTAUS_JWT_SECRET are not set');

    const b64url = (input: string) => Buffer.from(input, 'utf8').toString('base64url');
    const now = Math.floor(Date.now() / 1000);

    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const claims = b64url(JSON.stringify({ API_KEY: apiKey.trim(), iat: now, exp: now + 3600 }));
    const signingInput = `${header}.${claims}`;
    const signature = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url');

    return `${signingInput}.${signature}`;
}

async function portausPublic(path: string, body: unknown) {
    const base = env['PORTAUS_BASE']?.trim().replace(/\/+$/, '');
    if (!base) throw new Error('PORTAUS_BASE is not set');

    const res = await fetch(`${base}${path}`, {
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

export type PublicOrderLine = { puid: string; qty: number; name: string; uvc: number; portausId: number };

/**
 * Prices the lines. `customer: { id: null }` is what makes this path self-contained: Portaus
 * quotes a walk-up buyer rather than an account, so no customer has to exist first.
 */
async function calculate(lines: PublicOrderLine[]) {
    const calc = await portausPublic(CALCULATE_PATH, {
        customer: { id: null },
        lines: lines.map((l) => ({ product: { puid: l.puid }, qty: l.qty }))
    });

    if (!calc.ok || !calc.body?.signature) {
        console.error('portausPublic: calculate failed', calc.status, calc.body);
        throw new CheckoutError(502, {
            error: 'CalculateFailed',
            message: 'Could not price this order',
            detail: calc.body
        });
    }

    // Stock problems come back as HTTP 200 with per-line validations, so res.ok is not enough.
    // Response lines keep request order, which is what maps them back to the cart rows.
    //
    // A puid Portaus does not know produces the same "Insufficient quantity" validation as a
    // genuine shortage, but with an empty product object. Worth telling apart: one means "come
    // back later", the other means our catalogue is out of sync and nobody should wait.
    const unavailable = (calc.body.lines ?? [])
        .map((line: any, i: number) => ({ line, meta: lines[i] }))
        .filter(({ line }: any) => (line.validations ?? []).length > 0)
        .map(({ line, meta }: any) => {
            const uvc = meta?.uvc > 0 ? meta.uvc : 1;
            const quantityLeft = line.quantityLeft ?? 0;
            return {
                reason: line.product?.id ? 'InsufficientQuantity' : 'UnknownProduct',
                portausId: meta?.portausId ?? line.product?.id ?? null,
                puid: meta?.puid ?? line.product?.puid ?? null,
                name: meta?.name ?? line.product?.name ?? null,
                requested: line.qty,
                quantityLeft,
                casesLeft: Math.floor(quantityLeft / uvc),
                messages: (line.validations ?? []).map((v: any) => v.message ?? String(v))
            };
        });

    if (unavailable.length) {
        const unknown = unavailable.filter((l: any) => l.reason === 'UnknownProduct');
        if (unknown.length) {
            console.error(
                'portausPublic: puids Portaus does not recognise',
                unknown.map((l: any) => l.puid)
            );
        }
        // Totals and signature come back valid even when a line fails, with the failing line
        // priced at 0, so never fall through to the intent call on a validation error.
        throw new CheckoutError(409, {
            error: 'InsufficientQuantity',
            message: 'Some wines are no longer available in the requested quantity',
            lines: unavailable
        });
    }

    return calc.body;
}

export type PublicContact = { first_name: string; last_name: string; email: string; phone?: string | null };
export type PublicAddress = { street: string; city: string; postal_code: string };

export type PersoCheckoutInput = {
    items: CartItemInput[];
    /** SAQ branch for pickup: cms_saq.saq_branches.id */
    saq_branch_id: number | string;
    billing_contact: PublicContact;
    billing_address: PublicAddress;
};

export type PublicCheckoutResult = {
    clientSecret: string;
    /** what Stripe charges now: the agency fee and its taxes */
    amountBillable: number;
    total: number;
    totalBillable: number;
    totalUnbillable: number;
    taxes: unknown;
    salesOrderId: number | null;
    salesOrderNumber: string | null;
    /**
     * Which Stripe account holds the intent. Portaus opens it in its own account, so the browser
     * cannot confirm it with our publishable key; /pay reads this to pick the right one.
     */
    stripeAccount: 'portaus';
};

function toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/**
 * Perso checkout over the public API only.
 *
 * Supabase is still read for the cart lines and the pickup branch, but nothing here signs in to
 * Portaus: the only two Portaus calls are calculate and payments/intents, both with the API key.
 */
export async function checkoutPersoPublic(
    supabase: SupabaseClient,
    input: PersoCheckoutInput
): Promise<PublicCheckoutResult> {
    const contact = input.billing_contact;
    const address = input.billing_address;
    if (!contact?.first_name?.trim() || !contact?.last_name?.trim() || !contact?.email?.trim()) {
        throw new CheckoutError(400, {
            error: 'MissingContact',
            message: 'billing_contact needs first_name, last_name and email'
        });
    }
    if (!address?.street?.trim() || !address?.city?.trim() || !address?.postal_code?.trim()) {
        throw new CheckoutError(400, {
            error: 'MissingAddress',
            message: 'billing_address needs street, city and postal_code'
        });
    }

    const branchId = toInt(input.saq_branch_id);
    if (!branchId) {
        throw new CheckoutError(400, { error: 'MissingBranch', message: 'A perso order needs a saq_branch_id' });
    }

    // ---- 1. cart -> Portaus lines (local catalogue, no Portaus call) --------------------------
    const wines = await resolveCartWines(supabase, input.items);
    const lines: PublicOrderLine[] = wines.map((w) => ({
        puid: w.puid,
        qty: w.bottles,
        name: w.name,
        uvc: w.uvc,
        portausId: w.portausId
    }));

    // ---- 2. pickup branch (local) -------------------------------------------------------------
    // saq_branches already carries the shape Portaus wants; only `address` is renamed.
    const { data: branch, error: branchError } = await supabase
        .schema('cms_saq')
        .from('saq_branches')
        .select('id, number, city, phone, address')
        .eq('id', branchId)
        .single();

    if (branchError || !branch) {
        throw new CheckoutError(400, {
            error: 'InvalidBranch',
            message: 'Selected SAQ branch was not found',
            branchId
        });
    }

    const deliveryBranch = {
        id: branch.id,
        number: branch.number,
        city: branch.city,
        phone: branch.phone,
        addressLine: branch.address
    };

    // ---- 3. calculate -------------------------------------------------------------------------
    const calculation = await calculate(lines);

    // ---- 4. payment intent --------------------------------------------------------------------
    // Perso orders are collected in person at an SAQ branch, so deliveryBranch is the destination
    // and there is no shipping address; the billing address must not be quietly reused as one.
    const intent = await portausPublic(PAYMENT_INTENTS_PATH, {
        ...calculation, // lines, prices, taxes, totals and signature, untouched
        customer: {
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: contact.email,
            phone: contact.phone ?? '',
            billingAddress: {
                street: address.street,
                city: address.city,
                postalCode: address.postal_code
            }
        },
        deliveryBranch,
        portausCompanyId: PORTAUS_COMPANY_ID
    });

    if (!intent.ok) {
        console.error('portausPublic: payment intent failed', intent.status, intent.body);
        throw new CheckoutError(502, {
            error: 'IntentFailed',
            message: 'Could not create the order',
            detail: intent.body
        });
    }

    const intentPayment = intent.body?.detail?.intentPayment;
    const clientSecret = intentPayment?.client_secret ?? null;

    if (!clientSecret) {
        console.error('portausPublic: intent returned no client_secret', intent.body);
        throw new CheckoutError(502, {
            error: 'IntentFailed',
            message: 'Order was created without a payment intent',
            detail: intent.body
        });
    }

    return {
        clientSecret,
        amountBillable: intent.body.amount ?? calculation.totalBillable,
        total: calculation.total,
        totalBillable: calculation.totalBillable,
        totalUnbillable: calculation.totalUnbillable,
        taxes: calculation.taxes,
        salesOrderId: intent.body?.detail?.salesOrders?.[0]?.id ?? null,
        salesOrderNumber: intentPayment?.metadata?.sales_order_number ?? null,
        stripeAccount: 'portaus'
    };
}

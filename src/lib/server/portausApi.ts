// Server-only client for the official Portaus integration API (https://<env>.portaus.net/api-docs/).
//
// This is the only Portaus API the site may call. The admin routes the Portaus web app uses
// (/auth/login, /API/latest/admin/…) are internal: idNovatrice asked us to stop using them, and the
// code that did has been removed.
//
// Auth: every call carries `apikey: <HS256 JWT>` whose claim `API_KEY` is our API key, signed with
// PORTAUS_JWT_SECRET. Those two are per environment: the test key is rejected by production.
//
// Base URL: PORTAUS_API_BASE, else PORTAUS_BASE. Point it at the environment the key belongs to
// (https://api-test-wardetassocies.portaus.net until the production key is issued).

import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

/** The "Importation privée" inventory: the only one the site sells out of. */
export const INVENTORY_ID = 1;
/** portausCompanyId of that inventory, which /payments/intents wants back. */
export const PORTAUS_COMPANY_ID = 1;

export class PortausApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly path: string,
        readonly body: unknown
    ) {
        super(message);
        this.name = 'PortausApiError';
    }

    /** Portaus's own message when it sent one, for logs and API answers. */
    get detail(): string {
        const b = this.body as any;
        return (typeof b === 'object' && (b?.message || b?.error)) || (typeof b === 'string' && b) || this.message;
    }
}

export function portausApiBase(): string {
    const base = (env['PORTAUS_API_BASE'] || env.PORTAUS_BASE || '').trim().replace(/\/+$/, '');
    if (!base) throw new Error('PORTAUS_API_BASE (or PORTAUS_BASE) is not set');
    return base;
}

function apiKeyToken(): string {
    const apiKey = env.PORTAUS_API_KEY?.trim();
    const secret = env.PORTAUS_JWT_SECRET;
    if (!apiKey || !secret) throw new Error('PORTAUS_API_KEY / PORTAUS_JWT_SECRET are not set');

    const b64url = (input: string) => Buffer.from(input, 'utf8').toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const claims = b64url(JSON.stringify({ API_KEY: apiKey, iat: now, exp: now + 3600 }));
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${claims}`).digest('base64url');
    return `${header}.${claims}.${signature}`;
}

export type PortausResponse<T = any> = { ok: boolean; status: number; body: T };

/** One call, answered as-is (no throw on non-2xx) so callers can read Portaus's error body. */
export async function portausCall<T = any>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown
): Promise<PortausResponse<T>> {
    const res = await fetch(`${portausApiBase()}${path}`, {
        method,
        headers: {
            accept: 'application/json',
            'Accept-Language': 'fr-CA',
            apikey: apiKeyToken(),
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    let parsed: any = text;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        /* keep the raw text */
    }
    return { ok: res.ok, status: res.status, body: parsed as T };
}

/** Like portausCall, but throws PortausApiError on non-2xx. */
export async function portausRequest<T = any>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const res = await portausCall<T>(method, path, body);
    if (!res.ok) throw new PortausApiError(`Portaus ${method} ${path} -> ${res.status}`, res.status, path, res.body);
    return res.body;
}

/**
 * Every product of the Ward environment, in one answer (no paging): the same product shape the
 * Portaus UI shows, with lots (`items`), pricing, stock (`quantity.inStock` is what can be
 * ordered), tags, provider and the Cloudinary `image`.
 *
 * Only active products of the private-import inventory that carry a puid are kept: a product
 * without a puid cannot be priced or ordered through this API.
 */
export async function getProducts(): Promise<any[]> {
    const all = await portausRequest<any[]>('GET', '/api/v1/products/');
    if (!Array.isArray(all)) throw new PortausApiError('Portaus products: not a list', 200, '/api/v1/products/', all);
    return all.filter((p) => p?.id && p?.puid && p.active !== false && (p.inventory?.id ?? INVENTORY_ID) === INVENTORY_ID);
}

/** SAQ branches: [{ id, number, city, phone, addressLine }]. */
export function getSaqBranches() {
    return portausRequest<Array<{ id: number; number: string; city: string; phone: string; addressLine: string }>>(
        'GET',
        '/api/v1/saq-branches'
    );
}

/** POST /sales-orders/calculate: prices, taxes, totals and the signature /payments/intents needs. */
export function calculateSalesOrder(lines: Array<{ puid: string; qty: number }>) {
    return portausCall('POST', '/api/v1/sales-orders/calculate', {
        lines: lines.map((l) => ({ product: { puid: l.puid }, qty: l.qty }))
    });
}

/** POST /payments/intents: draft sales order in Portaus + Stripe PaymentIntent. */
export function createPaymentIntent(body: unknown) {
    return portausCall('POST', '/api/v1/payments/intents', body);
}

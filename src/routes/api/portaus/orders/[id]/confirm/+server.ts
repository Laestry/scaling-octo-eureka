// POST /api/portaus/orders/:id/confirm
//
// Manually marks a web order as partially paid (invoice + agency-fee payment, what the Stripe
// webhook does), or moves the order to the status given in the body `{ status: 'CONFIRMED' }`.
// Body for the paid case: `{ reference?: string, amount?: number }` (amount defaults to the
// order's billable total). Needs dev mode or `Authorization: Bearer <CRON_SECRET>`.

import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import {
    PortausError,
    markOrderPartiallyPaid,
    setOrderStatus,
    type SalesOrderStatusCode
} from '$lib/server/portausAdmin';

/** Portaus returns unrounded floats (466.06998); present money with two decimals. */
function round2(v: number | null | undefined): number | null {
    return v == null ? null : Math.round(v * 100) / 100;
}

export const POST: RequestHandler = async ({ params, request }) => {
    const auth = request.headers.get('authorization') ?? '';
    const authorized = dev || (env['CRON_SECRET'] && auth === `Bearer ${env['CRON_SECRET']}`);
    if (!authorized) return json({ error: 'Unauthorized' }, { status: 401 });

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return json({ error: 'InvalidId' }, { status: 400 });

    let body: { status?: SalesOrderStatusCode; reference?: string; amount?: number } = {};
    try {
        body = (await request.json()) ?? {};
    } catch {
        /* empty body: default transition */
    }

    try {
        if (body.status) {
            const order = await setOrderStatus(id, body.status);
            return json({ salesOrderId: order.id, soNumber: order.soNumber, status: order.status?.code ?? null });
        }
        const result = await markOrderPartiallyPaid(id, {
            reference: body.reference ?? `manual-${Date.now()}`,
            amount: body.amount
        });
        return json({
            salesOrderId: result.order.id,
            soNumber: result.order.soNumber,
            status: result.order.status?.code ?? null,
            invoiceId: result.invoice.id,
            invNumber: result.invoice.inv_number,
            invoiceStatus: result.invoice.status?.code ?? null,
            paid: round2(result.invoice.balance?.paid),
            outstanding: round2(result.invoice.balance?.outstanding),
            alreadyRecorded: result.alreadyRecorded
        });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('orders/confirm: Portaus error', e.status, e.path, e.body);
            return json(
                { error: 'PortausError', message: e.detail, status: e.status, detail: e.body },
                { status: 502 }
            );
        }
        return json({ error: 'ConfirmFailed', message: (e as Error).message }, { status: 500 });
    }
};

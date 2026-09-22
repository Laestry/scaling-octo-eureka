// POST /api/portaus/orders/:id/confirm
//
// Manual version of what the Stripe webhook does: notes the agency-fee payment on the order and
// moves it to TO_PROCESS. Body: `{ payment_intent_id?, amount?, livemode? }` (amount defaults
// to the order's billable total). Alternatively `{ status: 'CONFIRMED' }` moves the order to an
// explicit status. Needs dev mode or `Authorization: Bearer <CRON_SECRET>`.

import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import {
    PortausError,
    billableTotal,
    getOrder,
    markAgencyFeePaid,
    setOrderStatus,
    type SalesOrderStatusCode
} from '$lib/server/portausAdmin';

export const POST: RequestHandler = async ({ params, request }) => {
    const auth = request.headers.get('authorization') ?? '';
    const authorized = dev || (env['CRON_SECRET'] && auth === `Bearer ${env['CRON_SECRET']}`);
    if (!authorized) return json({ error: 'Unauthorized' }, { status: 401 });

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return json({ error: 'InvalidId' }, { status: 400 });

    let body: { status?: SalesOrderStatusCode; payment_intent_id?: string; amount?: number; livemode?: boolean } = {};
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
        const amount = Number(body.amount) > 0 ? Number(body.amount) : billableTotal(await getOrder(id));
        const { order, alreadyNoted } = await markAgencyFeePaid(id, {
            paymentIntentId: body.payment_intent_id ?? `manual-${Date.now()}`,
            amount,
            livemode: body.livemode ?? false
        });
        return json({
            salesOrderId: order.id,
            soNumber: order.soNumber,
            status: order.status?.code ?? null,
            notes: order.notes ?? '',
            alreadyNoted
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

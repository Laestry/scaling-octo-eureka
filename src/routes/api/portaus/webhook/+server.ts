// POST /api/portaus/webhook  — Stripe webhook
//
// Marks the Portaus web order as partially paid once its PaymentIntent succeeds: the order gets
// an invoice and the amount Stripe collected (agency fee + taxes) is recorded as a payment on it,
// which sets the invoice to PARTIALLY_PAID. The PaymentIntent is created by
// /api/portaus/orders/draft with `portausSalesOrderId` in its metadata. Retries are safe: a
// payment with the same PaymentIntent id is never recorded twice.
//
// Local testing:
//   stripe listen --forward-to localhost:3173/api/portaus/webhook
//   stripe trigger payment_intent.succeeded --add payment_intent:metadata.portausSalesOrderId=<id>
//
// Needs STRIPE_WEBHOOK_SECRET (the `whsec_…` from the dashboard or from `stripe listen`) and
// STRIPE_SK / STRIPE_SK_TEST.

import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import Stripe from 'stripe';
import { PortausError, markOrderPartiallyPaid } from '$lib/server/portausAdmin';

export const POST: RequestHandler = async ({ request }) => {
    const secret = env['STRIPE_WEBHOOK_SECRET'];
    const stripeKey = env['STRIPE_SK'] ?? env['STRIPE_SK_TEST'];
    if (!secret || !stripeKey) {
        console.error('portaus/webhook: STRIPE_WEBHOOK_SECRET / STRIPE_SK(_TEST) not set');
        return json({ error: 'NotConfigured' }, { status: 500 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) return json({ error: 'MissingSignature' }, { status: 400 });

    const rawBody = Buffer.from(await request.arrayBuffer());
    let event: Stripe.Event;
    try {
        event = new Stripe(stripeKey).webhooks.constructEvent(rawBody, signature, secret);
    } catch (e) {
        console.error('portaus/webhook: invalid signature', (e as Error).message);
        return json({ error: 'InvalidSignature' }, { status: 400 });
    }

    if (event.type !== 'payment_intent.succeeded') {
        return json({ received: true, ignored: event.type });
    }

    const intent = event.data.object as Stripe.PaymentIntent;
    const salesOrderId = Number(intent.metadata?.['portausSalesOrderId']);
    if (!Number.isInteger(salesOrderId) || salesOrderId <= 0) {
        console.warn('portaus/webhook: payment_intent without portausSalesOrderId', intent.id);
        return json({ received: true, ignored: 'no portausSalesOrderId' });
    }

    try {
        const amountReceived = (intent.amount_received ?? intent.amount) / 100;
        const result = await markOrderPartiallyPaid(salesOrderId, {
            reference: intent.id,
            amount: amountReceived > 0 ? amountReceived : undefined,
            description: "Frais d'agence payés en ligne (Stripe)"
        });
        console.log(
            `portaus/webhook: order ${result.order.soNumber} (${result.order.id}) -> ${result.order.status?.code}, ` +
                `invoice ${result.invoice.inv_number} ${result.invoice.status?.code}` +
                (result.alreadyRecorded ? ' (already recorded)' : '') +
                ` for ${intent.id}`
        );
        return json({
            received: true,
            salesOrderId: result.order.id,
            orderStatus: result.order.status?.code ?? null,
            invoiceId: result.invoice.id,
            invoiceStatus: result.invoice.status?.code ?? null,
            alreadyRecorded: result.alreadyRecorded
        });
    } catch (e) {
        // Non-2xx makes Stripe retry, which is what we want if Portaus was briefly unreachable.
        if (e instanceof PortausError) console.error('portaus/webhook: Portaus error', e.status, e.path, e.body);
        else console.error('portaus/webhook: confirm failed', e);
        return json({ error: 'ConfirmFailed', salesOrderId }, { status: 500 });
    }
};

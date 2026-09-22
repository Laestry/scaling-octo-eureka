// POST /api/portaus/webhook  — Stripe webhook
//
// When a PaymentIntent succeeds, the matching Portaus web order gets a note ("Frais d'agence
// payés en ligne …" with the amount and a link to the payment in the Stripe dashboard) and
// moves from "Brouillon - web" to TO_PROCESS ("À traiter"). Nothing else is written in Portaus:
// no invoice, no payment record. The PaymentIntent is created by the checkout with
// `portausSalesOrderId` in its metadata. Retries are safe: the note is written once per intent.
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
import { PortausError, markAgencyFeePaid } from '$lib/server/portausAdmin';

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
        const { order, alreadyNoted } = await markAgencyFeePaid(salesOrderId, {
            paymentIntentId: intent.id,
            amount: (intent.amount_received || intent.amount) / 100,
            currency: intent.currency,
            livemode: event.livemode,
            paidAt: new Date(event.created * 1000)
        });
        console.log(
            `portaus/webhook: order ${order.soNumber} (${order.id}) -> ${order.status?.code}` +
                (alreadyNoted ? ' (already noted)' : '') +
                ` for ${intent.id}`
        );
        return json({ received: true, salesOrderId: order.id, orderStatus: order.status?.code ?? null, alreadyNoted });
    } catch (e) {
        // Non-2xx makes Stripe retry, which is what we want if Portaus was briefly unreachable.
        if (e instanceof PortausError) console.error('portaus/webhook: Portaus error', e.status, e.path, e.body);
        else console.error('portaus/webhook: update failed', e);
        return json({ error: 'UpdateFailed', salesOrderId }, { status: 500 });
    }
};

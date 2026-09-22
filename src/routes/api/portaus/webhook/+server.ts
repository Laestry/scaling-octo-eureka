// POST /api/portaus/webhook  — Stripe webhook
//
// When a payment succeeds (payment_intent.succeeded or charge.succeeded), the matching Portaus
// web order gets a note ("Frais d'agence
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

    // Either event works: the endpoint may be subscribed to payment_intent.succeeded or to
    // charge.succeeded (a charge carries the PaymentIntent's metadata and id).
    let paid: { paymentIntentId: string; amount: number; currency: string; salesOrderId: number };
    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        paid = {
            paymentIntentId: intent.id,
            amount: (intent.amount_received || intent.amount) / 100,
            currency: intent.currency,
            salesOrderId: Number(intent.metadata?.['portausSalesOrderId'])
        };
    } else if (event.type === 'charge.succeeded') {
        const charge = event.data.object as Stripe.Charge;
        const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (!intentId) return json({ received: true, ignored: 'charge without payment_intent' });
        paid = {
            paymentIntentId: intentId,
            amount: (charge.amount_captured || charge.amount) / 100,
            currency: charge.currency,
            salesOrderId: Number(charge.metadata?.['portausSalesOrderId'])
        };
    } else {
        return json({ received: true, ignored: event.type });
    }

    const { salesOrderId } = paid;
    if (!Number.isInteger(salesOrderId) || salesOrderId <= 0) {
        console.warn('portaus/webhook: payment without portausSalesOrderId', paid.paymentIntentId);
        return json({ received: true, ignored: 'no portausSalesOrderId' });
    }

    try {
        const { order, alreadyNoted } = await markAgencyFeePaid(salesOrderId, {
            paymentIntentId: paid.paymentIntentId,
            amount: paid.amount,
            currency: paid.currency,
            livemode: event.livemode,
            paidAt: new Date(event.created * 1000)
        });
        console.log(
            `portaus/webhook: order ${order.soNumber} (${order.id}) -> ${order.status?.code}` +
                (alreadyNoted ? ' (already noted)' : '') +
                ` for ${paid.paymentIntentId} (${event.type})`
        );
        return json({ received: true, salesOrderId: order.id, orderStatus: order.status?.code ?? null, alreadyNoted });
    } catch (e) {
        // Non-2xx makes Stripe retry, which is what we want if Portaus was briefly unreachable.
        if (e instanceof PortausError) console.error('portaus/webhook: Portaus error', e.status, e.path, e.body);
        else console.error('portaus/webhook: update failed', e);
        return json({ error: 'UpdateFailed', salesOrderId }, { status: 500 });
    }
};

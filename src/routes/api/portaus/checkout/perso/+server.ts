// POST /api/portaus/checkout/perso
//
// The cart's perso checkout: finds or creates the individual customer in Portaus, creates the
// order as "Brouillon - web" and opens the Stripe PaymentIntent for the agency fee.
//
// Body: { items: [{ id: <batch id>, caseQuantity }], saq_branch_id, saq_number?,
//         billing_contact: { first_name, last_name, email, phone }, billing_address: { street, city, postal_code } }
// Answers with the CheckoutResult (clientSecret, amountBillable, total, salesOrderNumber, salesOrderId…).

import { json, type RequestHandler } from '@sveltejs/kit';
import { CheckoutError, checkoutPerso } from '$lib/server/portausAdmin';

export const POST: RequestHandler = async ({ request, locals }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    try {
        return json(await checkoutPerso(locals.supabase, body), { status: 201 });
    } catch (e) {
        if (e instanceof CheckoutError) return json(e.body, { status: e.status });
        console.error('checkout/perso failed', e);
        return json({ error: 'CheckoutFailed', message: (e as Error).message }, { status: 500 });
    }
};

// POST /api/portaus/checkout/perso
//
// The cart's perso checkout, over Portaus's public API only. Nothing here signs in to Portaus:
// the two Portaus calls are calculate and payments/intents, both carrying the API key. No
// customer is searched for or created, and Portaus opens the Stripe PaymentIntent in its own
// account. See src/lib/server/portausPublic.ts.
//
// The resto checkout still goes through portausAdmin, which does sign in.
//
// Body: { items: [{ portaus_id, caseQuantity }], saq_branch_id,
//         billing_contact: { first_name, last_name, email, phone },
//         billing_address: { street, city, postal_code } }

import { json, type RequestHandler } from '@sveltejs/kit';
import { CheckoutError } from '$lib/server/portausAdmin';
import { checkoutPersoPublic } from '$lib/server/portausPublic';

export const POST: RequestHandler = async ({ request, locals }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    try {
        return json(await checkoutPersoPublic(locals.supabase, body), { status: 201 });
    } catch (e) {
        if (e instanceof CheckoutError) return json(e.body, { status: e.status });
        console.error('checkout/perso failed', e);
        return json({ error: 'CheckoutFailed', message: (e as Error).message }, { status: 500 });
    }
};

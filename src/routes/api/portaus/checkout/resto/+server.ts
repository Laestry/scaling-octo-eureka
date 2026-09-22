// POST /api/portaus/checkout/resto
//
// The cart's resto checkout: finds the licensee by SAQ number (creates it with the company name
// when unknown), creates the order as "Brouillon - web" and opens the Stripe PaymentIntent for
// the agency fee.
//
// Body: { items: [{ id: <batch id>, caseQuantity }], saq_number, company_name?,
//         resto_delivery_type: 0 | 3, saq_branch_id? (when 3),
//         billing_contact: {...}, billing_address: {...}, shipping_contact?: {...}, shipping_address?: {...} }
// Answers with the CheckoutResult (clientSecret, amountBillable, total, salesOrderNumber, salesOrderId…).

import { json, type RequestHandler } from '@sveltejs/kit';
import { CheckoutError, checkoutResto } from '$lib/server/portausAdmin';

export const POST: RequestHandler = async ({ request, locals }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    try {
        return json(await checkoutResto(locals.supabase, body), { status: 201 });
    } catch (e) {
        if (e instanceof CheckoutError) return json(e.body, { status: e.status });
        console.error('checkout/resto failed', e);
        return json({ error: 'CheckoutFailed', message: (e as Error).message }, { status: 500 });
    }
};

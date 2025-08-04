// import Stripe from 'stripe';
// import { STRIPE_SK_TEST, SUPABASE_SERVICE_ROLE } from '$env/static/private';
// import { PUBLIC_SUPABASE_URL } from '$env/static/public';
// import { createClient } from '@supabase/supabase-js';
//
// // initialize Stripe with your secret key
// const stripe = new Stripe(STRIPE_SK_TEST, {
//     apiVersion: '2025-06-30.basil'
// });
//
// /**
//  * Create a Checkout Session and either redirect to it
//  * or return its URL as JSON.
//  */
// export async function POST({ request, url }): Promise<Response> {
//     const { items, customer } = await request.json();
//
//     let tempItems = [
//         {
//             price_data: {
//                 currency: 'cad',
//                 unit_amount: 780,
//                 product_data: {
//                     name: 'Heimat Silvaner',
//                     description: '2 Natur Kinder, 750ml',
//                     metadata: {
//                         batchId: 'SUMMER25'
//                     }
//                 }
//             },
//             quantity: 6
//         }
//     ];
//
//     let session;
//     try {
//         session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: tempItems,
//             mode: 'payment',
//             success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${url.origin}/cancelled`,
//             payment_intent_data: {
//                 metadata: { customer: customer }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//     }
//
//     const body = JSON.stringify({ url: session.url });
//     return new Response(body, {
//         headers: { 'Content-Type': 'application/json' },
//         status: 200
//     });
// }

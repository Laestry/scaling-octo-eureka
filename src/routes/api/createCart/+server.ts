import { createCart } from '$lib/shopify';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const items = await request.json();

	const cart = await createCart(items);
	const options = {
		path: '/'
	};
	cookies.set('shopifyCart', JSON.stringify(cart), options);
	return json(cart.checkoutUrl);
}

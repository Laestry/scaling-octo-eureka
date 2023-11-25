import { createCart } from '$lib/shopify';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const { productId } = await request.json();

	const cart = await createCart(productId);
	const options = {
		path: '/'
	};
	cookies.set('cart', JSON.stringify(cart), options);
	return json(cart);
}

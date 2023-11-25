import { createCart, updateCartItem } from '$lib/shopify';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	let { productId, cartId, quantity } = await request.json();

	if (cartId) {
		await updateCartItem(cartId, productId, quantity);
	} else {
		cartId = await createCart(productId);
		quantity = 1;
	}

	return json(cartId);
}

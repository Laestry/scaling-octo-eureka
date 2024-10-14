import type { CartItem } from '$lib/cart';

export async function load({ cookies }) {
	let cart: CartItem[] = [];
	const cartCookie = cookies.get('cart');
	if (cartCookie) {
		try {
			cart = JSON.parse(cartCookie);
		} catch (error) {}
	}
	return {
		cart
	};
}

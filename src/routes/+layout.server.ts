export async function load({ cookies, url }) {
	const cartCookie = cookies.get('cart');
	let cart;
	if (cartCookie) {
		cart = JSON.parse(cookies.get('cart'));
	} else {
		cart = undefined;
	}
	return { cart, url: url.pathname };
}

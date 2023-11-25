export async function load({ cookies }) {
	const cart = JSON.parse(cookies.get('cart'));
	return { cart };
}

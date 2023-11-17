import { getProducts } from '$lib/shopify';

export async function load() {
	return await getProducts();
}

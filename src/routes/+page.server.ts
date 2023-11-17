import { getCollectionsWithProducts } from '$lib/shopify';

export async function load() {
	return await getCollectionsWithProducts();
}

import { getCollectionWithProducts } from '$lib/shopify';

export async function load() {
	return await getCollectionWithProducts('611985195338');
}

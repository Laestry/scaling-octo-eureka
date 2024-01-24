import { getCollectionWithProducts } from '$lib/shopify';
import { HOMEPAGE_COLLECTION_ID } from '$env/static/private';

export async function load() {
	return await getCollectionWithProducts(HOMEPAGE_COLLECTION_ID);
}

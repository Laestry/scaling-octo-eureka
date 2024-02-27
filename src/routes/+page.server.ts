import { getCollectionWithProducts } from '$lib/shopify';
import { PUBLIC_COLLECTION_ID } from '$env/static/public';

export async function load() {
	return await getCollectionWithProducts(PUBLIC_COLLECTION_ID);
}

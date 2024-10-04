import { getCollectionWithProducts } from '$lib/shopify';
import { HOMEPAGE_COLLECTION_ID } from '$env/static/private';
import { supabase, type Product } from '$lib/server/db';
import type { ProductData } from '$lib/models/shopifyTypes';

export async function load() {
	const { data, error } = await supabase.from('products').select();
	if (error) {
		throw error;
	}
	return {
		products: data as Product[],
		old_products: (await getCollectionWithProducts(HOMEPAGE_COLLECTION_ID)) as ProductData
	};
}

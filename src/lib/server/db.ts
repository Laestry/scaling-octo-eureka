import { SUPABASE_URL, SUPABASE_API_KEY } from '$env/static/private';
import { PortausApi } from './portaus';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

export type GenericFields = {
	id: string;
	created_at: string;
};
type _Product = ReturnType<(typeof PortausApi)['processProduct']> extends Readonly<infer I> ? I : never;
export type Product = GenericFields & _Product;

(async () => {
	console.log('--------------1');
	try {
		// const raw_products = await PortausApi.getProducts();
		// console.log('raw_products', raw_products);
		// const products = raw_products.map((x) => PortausApi.processProduct(x));
		// console.log('products', products);
		// const { error } = await supabase.from('products').insert(products);
		// console.log('error', error);
		// if (error) {
		// 	throw error;
		// }
	} catch (error) {
		console.error(error);
	}
	console.log('--------------2');
})();

export async function updateAllProducts() {
	// get new
	// delete all
	// add new
}

export async function addNewProducts() {
	// get new
	// get existing
	// find published and unpublished
	// add published
	// mark unpublished as deleted?
}

// export async function getProductByFilter(key: string, value: any) {
// 	const { data, error } = await supabase.from('products').select().filter(key, 'eq', value).single();
// 	if (error) {
// 		throw error;
// 	}
// 	return data as Product | undefined;
// }

// export async function getProductById(id: string) {
// 	return getProductByFilter('id', id);
// }

// export async function getProductBySlug(slug: string) {
// 	return getProductByFilter('slug', slug);
// }

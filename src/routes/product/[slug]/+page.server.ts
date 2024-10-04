import { supabase, type Product } from '$lib/server/db';

export async function load(event) {
	const { data, error } = await supabase.from('products').select().eq('slug', event.params.slug).single();
	if (error) {
		throw error;
	}
	return {
		product: data as Product
	};
}

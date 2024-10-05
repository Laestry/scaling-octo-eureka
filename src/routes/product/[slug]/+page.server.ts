import { supabase, type Product } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { data, error: err } = await supabase.from('products').select().eq('slug', event.params.slug).maybeSingle();
	if (err) {
		throw err;
	}
	if (!data) {
		error(404);
	}
	return {
		product: data as Product
	};
}

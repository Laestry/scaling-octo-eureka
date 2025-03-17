import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    let product = await locals.pb.collection('alcohol_products').getFirstListItem(`slug="${params.slug}"`);

    if (!product) {
        error(404);
    } else {
        return {
            product
        };
    }
}

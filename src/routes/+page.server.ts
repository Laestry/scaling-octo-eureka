import { fetchFilteredProductsForAlcohol } from './products/Filters/utils';

export async function load({ locals }) {
    let products = await fetchFilteredProductsForAlcohol(locals.supabase, null, {
        limit: 20,
        offset: 0
    });

    return { products };
}

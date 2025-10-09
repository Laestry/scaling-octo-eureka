import { error } from '@sveltejs/kit';
import { fetchFilteredProductsForAlcohol } from '../../vins/Filters/utils';

export async function load({ locals }) {
    const { data, error: serror } = await fetchFilteredProductsForAlcohol(locals.supabase, undefined, {
        limit: 1000,
        offset: 0
    });

    if (serror) {
        error(404);
    } else {
        return {
            products: data
        };
    }
}

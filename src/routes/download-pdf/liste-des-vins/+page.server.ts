import { error } from '@sveltejs/kit';
import { fetchFilteredProductsForAlcohol } from '../../vins/Filters/utils';
import type { TFilters } from '$lib/models/general';
import { parseFiltersFromUrl } from '../../vins/utils';

export async function load({ locals, url }) {
    const selectedFilters: TFilters = parseFiltersFromUrl(url);

    const { data, error: serror } = await fetchFilteredProductsForAlcohol(locals.supabase, selectedFilters, {
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

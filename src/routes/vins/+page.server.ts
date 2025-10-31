import type { TFilters } from '$lib/models/general';
import { fetchFilteredProductsForAlcohol } from './Filters/utils';
import { parseFiltersFromUrl } from './utils';

export async function load({ locals, url }) {
    const selectedFilters: TFilters = parseFiltersFromUrl(url);

    // fetch filtered products (first page)
    const PAGE_SIZE = 20;
    const productsPromise = fetchFilteredProductsForAlcohol(locals.supabase, selectedFilters, {
        limit: PAGE_SIZE,
        offset: 0,
        sorting: selectedFilters.sorting
    });

    // categories list (for buildDisplayFilters)
    const categoriesPromise = locals.supabase.schema('cms_saq').from('alcohol_categories').select('*');

    const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);

    return {
        products,
        categories,
        selectedFilters
    };
}

import type { TFilters } from '$lib/models/general';
import { fetchFilteredProductsForAlcohol } from './Filters/utils';
import { parseFiltersFromUrl } from './utils';
import { supabase } from '$lib/supabase/client';

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
    const enabledFacetsPromise = locals.supabase.schema('cms_saq').rpc('search_alcohol_facets', {
        payload: {
            organization_id: 2,
            limit: 20,
            offset: 0,
            sorting: selectedFilters.sorting ?? null,
            producer: selectedFilters.producer && JSON.parse(String(selectedFilters.producer)),
            region: selectedFilters.region && JSON.parse(String(selectedFilters.region)),
            category: selectedFilters.category && JSON.parse(`[${[selectedFilters.category].flat().join(',')}]`),
            format: selectedFilters.format && JSON.parse(String(selectedFilters.format)),
            vintage: [selectedFilters.vintage].flat().filter(Boolean),
            nameSearch: selectedFilters.nameSearch || null,
            tag: selectedFilters.tag || null,
            priceRange: selectedFilters.priceRange || null
        }
    });
    const [products, categories, enabledFacets] = await Promise.all([
        productsPromise,
        categoriesPromise,
        enabledFacetsPromise
    ]);

    return {
        products,
        categories,
        selectedFilters,
        enabledFacets
    };
}

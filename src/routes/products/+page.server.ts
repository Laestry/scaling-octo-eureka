import type { TFilters, FetchOpts } from '$lib/models/general';
import { fetchFilteredProductsForAlcohol } from './Filters/utils';

export async function load({ locals, url }) {
    const params = url.searchParams;

    function getArrayParam(key: string): string[] | undefined {
        const arr = params.getAll(key);
        return arr.length ? arr : undefined;
    }

    // producer (short key: p)
    const producer = getArrayParam('p');

    // region (short key: r)
    const region = getArrayParam('r');

    // vintage (short key: v) -> numbers
    const vintageRaw = params.getAll('v');
    const vintageNums = vintageRaw.map((v) => Number(v)).filter((n) => !isNaN(n));
    const vintage = vintageNums.length ? (vintageNums.length === 1 ? vintageNums[0] : vintageNums) : undefined;

    // format (short key: f)
    const format = getArrayParam('f');

    // category (short key: cat) encoded as "category_specificCategory"
    let category: string[] | undefined;
    const catParams = params.getAll('cat');
    if (catParams.length) {
        category = catParams
            .map((c) => {
                const [catVal, specificVal] = c.split('_');
                const categoryNum = Number(catVal);
                const specificNum = Number(specificVal);
                if (!isNaN(categoryNum) && !isNaN(specificNum)) {
                    // keep the same shape your fetch util expects: JSON string or object
                    return JSON.stringify({
                        category: categoryNum,
                        specificCategory: specificNum
                    });
                }
                return undefined;
            })
            .filter(Boolean) as string[];
        if (!category.length) category = undefined;
    }

    // uvc (long key, optional)
    const uvcArr = params
        .getAll('uvc')
        .map((v) => Number(v))
        .filter((n) => !isNaN(n));
    const uvc = uvcArr.length ? (uvcArr.length === 1 ? uvcArr[0] : uvcArr) : undefined;

    // priceRange (short key: pr)
    const pr = params.get('pr');
    const priceRange = pr === 'low' || pr === 'mid' || pr === 'high' ? pr : undefined;

    // sorting (short key: s) — must match the strings your fetch util expects
    const s = params.get('s');
    const sorting = s === 'Prix croissant' || s === 'Prix décroissant' || s === 'Alphabétique' ? s : undefined;

    // nameSearch (q)
    const nameSearch = params.get('q') || undefined;

    // tag (t)
    const tag = params.get('t') || undefined;

    const selectedFilters: TFilters = {
        producer,
        region,
        category,
        uvc,
        format,
        vintage,
        priceRange,
        sorting,
        nameSearch,
        tag
    };

    // fetch filtered products (first page)
    const PAGE_SIZE = 20;
    const productsPromise = fetchFilteredProductsForAlcohol(locals.supabase, selectedFilters, {
        limit: PAGE_SIZE,
        offset: 0,
        sorting: selectedFilters.sorting
    } as FetchOpts);

    // categories list (for buildDisplayFilters)
    const categoriesPromise = locals.supabase.schema('cms_saq').from('alcohol_categories').select('*');

    const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);

    return {
        products,
        categories,
        selectedFilters
    };
}

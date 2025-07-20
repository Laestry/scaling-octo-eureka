import type { TFilters } from '$lib/models/general';

//category & specific_category need to do

export async function load({ locals, url }) {
    function getArrayParam(key: string): string[] | undefined {
        const arr = params.getAll(key);
        return arr.length ? arr : undefined;
    }

    const params = url.searchParams;
    const producer = getArrayParam('producer');
    const region = getArrayParam('region');
    const color = getArrayParam('color');
    const format = getArrayParam('format');
    const vintage = getArrayParam('vintage');

    // For numeric values like uvc, convert them:
    const uvcArr = params
        .getAll('uvc')
        .map((val) => Number(val))
        .filter((val) => !isNaN(val));
    const uvc = uvcArr.length ? uvcArr : undefined;
    const priceRangeCandidate = params.get('priceRange');
    const priceRange =
        priceRangeCandidate === 'low' || priceRangeCandidate === 'mid' || priceRangeCandidate === 'high'
            ? priceRangeCandidate
            : undefined;
    const sortingCandidate = params.get('sorting');
    const sorting =
        sortingCandidate === 'Prix croissant' ||
        sortingCandidate === 'Prix décroissant' ||
        sortingCandidate === 'Alphabétique'
            ? sortingCandidate
            : undefined;
    const nameSearch = params.get('nameSearch') || undefined;
    const tag = params.get('tag') || undefined;

    const filterObj: TFilters = {
        producer,
        region,
        color,
        uvc,
        format,
        vintage,
        priceRange,
        sorting,
        nameSearch,
        tag
    };

    let filterParts: string[] = [];
    if (filterObj.producer) filterParts.push(`providerName="${filterObj.producer}"`);
    if (filterObj.region) filterParts.push(`originRegion="${filterObj.region}"`);
    if (filterObj.color) filterParts.push(`specificCategory="${filterObj.color}"`);
    if (filterObj.uvc) filterParts.push(`uvc=${filterObj.uvc}`);
    if (filterObj.format) filterParts.push(`lblFormat="${filterObj.format}"`);
    if (filterObj.vintage) filterParts.push(`vintage="${filterObj.vintage}"`);
    if (filterObj.tag) filterParts.push(`tags~"${filterObj.tag}"`);

    // Example for priceRange (you might need to adjust the logic)
    if (filterObj.priceRange) {
        if (filterObj.priceRange === 'low') {
            filterParts.push(`price>=20 && price<=30`);
        } else if (filterObj.priceRange === 'mid') {
            filterParts.push(`price>=30 && price<=40`);
        } else if (filterObj.priceRange === 'high') {
            filterParts.push(`price>=40`);
        }
    }

    const filter = filterParts.join(' && ');

    let sortField: string | undefined;
    if (filterObj.sorting) {
        if (filterObj.sorting === 'Prix croissant') {
            sortField = 'price';
        } else if (filterObj.sorting === 'Prix décroissant') {
            sortField = '-price';
        } else if (filterObj.sorting === 'Alphabétique') {
            sortField = 'name';
        }
    }

    const productsPromise = locals.supabase
        .schema('cms_saq')
        .from('alcohol')
        .select('*, alcohol_batches(*), parties(display_name)', { count: 'exact', head: false })
        .gt('alcohol_batches.quantity', 0)
        .order('sell_before_date', { referencedTable: 'alcohol_batches', ascending: false })
        .range(0, 19);

    // const productsPromise = locals.pb.collection('alcohol_products').getList(1, 20, {
    //     filter: filter || undefined,
    //     sort: sortField || undefined
    // });
    // const categoriesPromise = locals.pb.collection('categories').getFullList();

    const [products] = await Promise.all([productsPromise]);

    return { products };
}

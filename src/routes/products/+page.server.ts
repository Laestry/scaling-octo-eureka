import type { TFilters } from '$lib/models/general';

export async function load({ locals, url }) {
    const params = url.searchParams;
    const producer = params.get('producer') || undefined;
    const region = params.get('region') || undefined;
    const color = params.get('color') || undefined;
    const uvcStr = params.get('uvc');
    const uvc = uvcStr !== null && !isNaN(Number(uvcStr)) ? Number(uvcStr) : undefined;
    const format = params.get('format') || undefined;
    const vintage = params.get('vintage') || undefined;
    const priceRangeCandidate = params.get('priceRange');
    const priceRange =
        priceRangeCandidate === 'low' || priceRangeCandidate === 'mid' || priceRangeCandidate === 'high'
            ? priceRangeCandidate
            : undefined;
    const sortingCandidate = params.get('sorting');
    const sorting = sortingCandidate === 'Prix' || sortingCandidate === 'Alphabétique' ? sortingCandidate : undefined;
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

    const productsPromise = locals.pb.collection('alcohol_products').getList(1, 20, {
        filter: filter || undefined,
        sort: sortField || undefined
    });
    const categoriesPromise = locals.pb.collection('categories').getFullList();

    const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);

    return { products, categories, filterObj };
}

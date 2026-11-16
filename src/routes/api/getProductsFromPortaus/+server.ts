// Legacy admin-page import of Portaus products into PocketBase, one page of 50 at a time.
// Reads the official API's product list ($lib/server/portausApi), which comes back whole, and
// slices the requested page out of it.

import { getProducts } from '$lib/server/portausApi';
import { rejectUnlessInternal } from '$lib/server/internalAuth';
import { upsertAlcoholProductBatch } from '$lib/server/pocketbase';
import { getPocketBaseAdmin } from '$lib/server/pocketbaseAdmin';

const PAGE_SIZE = 50;

function processString(input: string | null | undefined) {
    return input?.trim() || undefined;
}

function processProduct(obj: any) {
    const alcohol = (parseFloat(obj.item?.extraInfo?.alcohol || '') || 0) / 100;
    const vintage =
        Math.min(Math.max(parseInt(obj.currentVintage) || 0, 0), new Date().getFullYear() + 1) || undefined;

    return {
        id: obj.puid,
        id2: obj.id,
        sku: obj.sku,
        slug: obj.slug,
        name: processString(obj.name) || processString(obj.cmsName) || '',
        shortDescription: processString(obj.shortDescription) || '',
        fullDescription: processString(obj.description) || processString(obj.content) || '',
        providerName:
            processString(obj.provider?.displayName) ||
            processString(obj.provider?.usualName) ||
            processString(obj.provider?.name) ||
            '',
        alcohol,
        lblFormat: obj.lblFormat,
        vintage,
        uvc: obj.uvc,
        quantity: Math.max(obj.quantity?.inStock || 0, 0),
        price: Math.max(obj.pricing?.price ?? 0, 0),
        priceTaxIn: Math.max(obj.pricing?.priceTaxIn ?? 0, 0),
        pricing: obj.pricing,
        originCity: processString(obj.origins?.[0]?.city?.name) || '',
        originRegion: processString(obj.origins?.[0]?.region?.name) || '',
        originCountry: processString(obj.originCountry) || processString(obj.origins?.[0]?.country?.name) || '',
        originCountryCode: processString(obj.origins?.[0]?.country?.code) || '',
        category: processString(obj.category?.name) || '',
        specificCategory: processString(obj.specificCategory?.name) || '',
        tags: (obj.tags ?? []).map((x: any) => processString(x.code)).filter(Boolean)
    };
}

export async function POST({ request }): Promise<Response> {
    const denied = rejectUnlessInternal(request);
    if (denied) return denied;

    const { page } = await request.json();
    const current = Math.max(1, Number(page) || 1);

    const all = await getProducts();
    const processedProducts = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map(processProduct);

    const pbAdmin = await getPocketBaseAdmin();
    const pocketRes = await upsertAlcoholProductBatch(pbAdmin, processedProducts);

    return new Response(
        JSON.stringify({
            totalPages: Math.ceil(all.length / PAGE_SIZE),
            processedProducts,
            pocketResponse: pocketRes
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );
}

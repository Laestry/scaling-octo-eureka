import { PortausApi } from '$lib/server/portaus';
import { rejectUnlessInternal } from '$lib/server/internalAuth';
import { upsertAlcoholProductBatch } from '$lib/server/pocketbase';
import { getPocketBaseAdmin } from '$lib/server/pocketbaseAdmin';

export async function POST({ request }): Promise<Response> {
    const denied = rejectUnlessInternal(request);
    if (denied) return denied;

    // Portaus tokens never come from (or go to) the browser
    const { page } = await request.json();
    const tokens = await PortausApi.getTokens();

    // Create a new authenticated PocketBase admin instance
    const pbAdmin = await getPocketBaseAdmin();

    // Fetch products for the given page using the tokens
    const res = await PortausApi.getProducts(page, tokens);
    const processedProducts = res.list.map(PortausApi.processProduct);

    // Upsert the processed products into PocketBase
    const pocketRes = await upsertAlcoholProductBatch(pbAdmin, processedProducts);

    // Return the results: total pages, processed products, and the PocketBase response
    const responseData = {
        totalPages: res.pages,
        processedProducts,
        pocketResponse: pocketRes
    };

    return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' }
    });
}

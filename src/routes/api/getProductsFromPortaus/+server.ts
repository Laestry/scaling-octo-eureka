import { PortausApi } from '$lib/server/portaus';
import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_PASSWORD, POCKETBASE_ADMIN_USER } from '$env/static/private';
import { upsertBatch } from '$lib/server/pocketbase';

export async function POST({ request }): Promise<Response> {
    // Extract tokens and page from the request body
    const { tokens, page } = await request.json();

    // Create a new authenticated PocketBase admin instance
    const pbAdmin = new PocketBase(PUBLIC_DB_URL);
    await pbAdmin.collection('_superusers').authWithPassword(POCKETBASE_ADMIN_USER, POCKETBASE_ADMIN_PASSWORD);

    // Fetch products for the given page using the tokens
    const res = await PortausApi.getProducts(page, tokens);
    const processedProducts = res.list.map(PortausApi.processProduct);

    // Upsert the processed products into PocketBase
    const pocketRes = await upsertBatch(pbAdmin, processedProducts);

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

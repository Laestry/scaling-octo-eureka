import { PortausApi } from '$lib/server/portaus';
import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_PASSWORD, POCKETBASE_ADMIN_USER } from '$env/static/private';
import { upsertBatch } from '$lib/server/pocketbase';

export async function GET({ locals }) {
    const tokens = await PortausApi.getTokens();
    locals.pbAdmin = new PocketBase(PUBLIC_DB_URL);
    await locals.pbAdmin.collection('_superusers').authWithPassword(POCKETBASE_ADMIN_USER, POCKETBASE_ADMIN_PASSWORD);

    let page = 1;
    let totalPages = 1;

    do {
        const res = await PortausApi.getProducts(page, tokens);
        const processedProducts = res.list.map(PortausApi.processProduct);

        // Upsert the products from the current page into Pocketbase using batch.
        const pocketRes = await upsertBatch(locals.pbAdmin, processedProducts);

        // const pocketRes = await pb.collection('alcohol_products').create(processedProducts[0]);

        // Update totalPages based on the API response (ensuring it's a number).
        totalPages = res.pages;
        page++;
    } while (page <= totalPages);
}

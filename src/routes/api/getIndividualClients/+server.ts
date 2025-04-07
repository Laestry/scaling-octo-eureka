import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_PASSWORD, POCKETBASE_ADMIN_USER } from '$env/static/private';
import { PortausApi } from '$lib/server/portaus';
import { upsertCustomerBatch } from '$lib/server/pocketbase';

export async function POST({ request }): Promise<Response> {
    const { tokens, page } = await request.json();

    const pbAdmin = new PocketBase(PUBLIC_DB_URL);
    await pbAdmin.collection('_superusers').authWithPassword(POCKETBASE_ADMIN_USER, POCKETBASE_ADMIN_PASSWORD);

    const res = await PortausApi.getIndividualCustomers(page, tokens);
    const processedCustomers = res.list.map(PortausApi.processCustomer);
    // const pocketIndRes = await pbAdmin.collection('customers').create(processedCustomers[2]);

    // Upsert the processed products into PocketBase
    const pocketRes = await upsertCustomerBatch(pbAdmin, processedCustomers);

    // Return the results: total pages, processed products, and the PocketBase response
    const responseData = {
        totalPages: res.pages,
        processedCustomers,
        pocketResponse: pocketRes
    };

    return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' }
    });
}

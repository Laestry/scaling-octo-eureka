import { getPocketBaseAdmin } from '$lib/server/pocketbaseAdmin';

export async function POST({ request }): Promise<Response> {
    const { email } = await request.json();

    const pbAdmin = await getPocketBaseAdmin();
    const contact = await pbAdmin.collection('customers').getFirstListItem(`email = ${JSON.stringify(email)}`);

    return Response.json(contact);
}

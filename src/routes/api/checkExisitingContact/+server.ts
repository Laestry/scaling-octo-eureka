import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';
import { POCKETBASE_ADMIN_PASSWORD, POCKETBASE_ADMIN_USER } from '$env/static/private';

export async function POST({ request }): Promise<Response> {
    const { email } = await request.json();

    const pbAdmin = new PocketBase(PUBLIC_DB_URL);
    await pbAdmin.collection('_superusers').authWithPassword(POCKETBASE_ADMIN_USER, POCKETBASE_ADMIN_PASSWORD);
}

import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import PocketBase from 'pocketbase';

export async function getPocketBaseAdmin(): Promise<PocketBase> {
    const url = publicEnv.PUBLIC_DB_URL;
    const username = privateEnv.POCKETBASE_ADMIN_USER;
    const password = privateEnv.POCKETBASE_ADMIN_PASSWORD;

    if (!url || !username || !password) {
        throw new Error(
            'Missing PocketBase configuration. Set PUBLIC_DB_URL, POCKETBASE_ADMIN_USER, and POCKETBASE_ADMIN_PASSWORD.'
        );
    }

    const client = new PocketBase(url);
    await client.collection('_superusers').authWithPassword(username, password);
    return client;
}

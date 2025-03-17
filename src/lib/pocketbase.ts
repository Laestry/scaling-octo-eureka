import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';

export let pb = new PocketBase(PUBLIC_DB_URL);

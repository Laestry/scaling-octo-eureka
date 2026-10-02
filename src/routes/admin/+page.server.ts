import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

// Local tool only. It used to log into Portaus here and ship the session tokens to the browser;
// the API routes it calls now log in on the server and only answer in dev mode.
export async function load() {
    if (!dev) error(404, 'Not found');
    return {};
}

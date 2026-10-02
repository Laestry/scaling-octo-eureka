import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

/**
 * Routes that reach Portaus on behalf of the server (cron jobs, manual tools) are not for browsers.
 * They need dev mode or `Authorization: Bearer <CRON_SECRET>` (what Vercel cron sends).
 */
export function isInternalRequest(request: Request): boolean {
    const auth = request.headers.get('authorization') ?? '';
    return dev || (!!env['CRON_SECRET'] && auth === `Bearer ${env['CRON_SECRET']}`);
}

/** A 401 response for a request that failed `isInternalRequest`, or null when it passed. */
export function rejectUnlessInternal(request: Request): Response | null {
    return isInternalRequest(request) ? null : json({ error: 'Unauthorized' }, { status: 401 });
}

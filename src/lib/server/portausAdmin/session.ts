// Session login against the Portaus admin API (the same API the Portaus web app uses).
//
// POST /auth/login answers with two JWTs: `accessToken` goes in the `authorization` header and
// `portausContextToken` in `x-portaus-context`. Both are needed on every admin call. Tokens are
// cached per server process and refreshed after MAX_AGE_MS or on a 401.

import { env } from '$env/dynamic/private';
import { PortausError } from './errors';

export type PortausTokens = {
    accessToken: string;
    contextToken: string;
    obtainedAt: number;
};

// The captured admin JWT had a 12h lifetime; re-login well before that.
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

let cached: PortausTokens | null = null;
let inflight: Promise<PortausTokens> | null = null;

export function portausBase(): string {
    const base = env.PORTAUS_BASE?.trim().replace(/\/+$/, '');
    if (!base) throw new Error('PORTAUS_BASE is not set');
    return base;
}

async function login(): Promise<PortausTokens> {
    const username = env.PORTAUS_LOGIN?.trim();
    const password = env.PORTAUS_PASSWORD;
    if (!username || !password) throw new Error('PORTAUS_LOGIN / PORTAUS_PASSWORD are not set');

    const res = await fetch(`${portausBase()}/auth/login`, {
        method: 'POST',
        headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'fr-CA',
            'content-type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const text = await res.text();
    let data: any = null;
    try {
        data = JSON.parse(text);
    } catch {
        /* keep raw text for the error below */
    }

    if (!res.ok) throw new PortausError('Portaus login failed', res.status, '/auth/login', data ?? text);
    if (!data?.accessToken || !data?.portausContextToken) {
        throw new PortausError('Portaus login returned no tokens', res.status, '/auth/login', data);
    }

    return { accessToken: data.accessToken, contextToken: data.portausContextToken, obtainedAt: Date.now() };
}

/** Cached admin session; pass `force` to discard the cached tokens and log in again. */
export async function getSession(force = false): Promise<PortausTokens> {
    if (!force && cached && Date.now() - cached.obtainedAt < MAX_AGE_MS) return cached;
    if (!inflight) {
        inflight = login()
            .then((t) => {
                cached = t;
                return t;
            })
            .finally(() => {
                inflight = null;
            });
    }
    return inflight;
}

export function invalidateSession(): void {
    cached = null;
}

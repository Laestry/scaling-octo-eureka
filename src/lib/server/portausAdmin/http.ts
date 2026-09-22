import { PortausError } from './errors';
import { getSession, invalidateSession, portausBase } from './session';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestOptions = {
    query?: Record<string, string | number | boolean | null | undefined>;
    body?: unknown;
    /** Extra headers, e.g. `X-Portaus-Include`. */
    headers?: Record<string, string>;
    /** Re-login and retry once on 401. Default true. */
    retryOnUnauthorized?: boolean;
};

function buildQuery(query: RequestOptions['query']): string {
    if (!query) return '';
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        params.set(k, String(v));
    }
    const s = params.toString();
    return s ? `?${s}` : '';
}

/**
 * One call to the Portaus admin API with the cached session attached.
 * Returns the parsed JSON body (or `null` for an empty body); throws PortausError on non-2xx.
 */
export async function portausRequest<T = unknown>(method: Method, path: string, opts: RequestOptions = {}): Promise<T> {
    const { query, body, headers: extraHeaders, retryOnUnauthorized = true } = opts;
    const url = `${portausBase()}${path}${buildQuery(query)}`;

    const attempt = async (forceLogin: boolean) => {
        const session = await getSession(forceLogin);
        const headers: Record<string, string> = {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'fr-CA',
            authorization: session.accessToken,
            'x-portaus-context': session.contextToken,
            ...extraHeaders
        };
        if (body !== undefined) headers['content-type'] = 'application/json';

        const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
        const text = await res.text();
        let data: any = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }
        return { res, data };
    };

    let { res, data } = await attempt(false);

    if (res.status === 401 && retryOnUnauthorized) {
        invalidateSession();
        ({ res, data } = await attempt(true));
    }

    if (!res.ok) {
        throw new PortausError(`Portaus ${method} ${path} -> ${res.status}`, res.status, path, data);
    }
    return data as T;
}

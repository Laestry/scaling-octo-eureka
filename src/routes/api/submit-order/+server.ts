// src/routes/api/submit-order/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_USE_LOCAL_SERVER } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
    let payload = await request.json();
    payload.organizationId = 2;

    const base = PUBLIC_USE_LOCAL_SERVER ? 'http://localhost:7777' : 'https://enos.is';

    let res: Response;
    try {
        res = await fetch(`${base}/api/c/saq/v1/create-external-sales-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error('// src/routes/api/submit-order/+server.ts network error', e);
        return new Response(
            JSON.stringify({
                error: 'NetworkError',
                message: 'Failed to reach create-external-sales-order backend'
            }),
            {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Remote API error body:', errorBody);

        return new Response(errorBody, {
            status: res.status,
            headers: {
                'Content-Type': res.headers.get('content-type') ?? 'application/json'
            }
        });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

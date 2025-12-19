// src/routes/api/submit-order/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    let payload = await request.json();
    payload.organizationId = 2;

    let res: Response;
    try {
        res = await fetch('https://enos.is/api/c/saq/v1/create-external-sales-order', {
            // res = await fetch('http://localhost:7777/api/c/saq/v1/create-external-sales-order', {
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

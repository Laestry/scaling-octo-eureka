// src/routes/api/submit-order/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    let payload = await request.json();
    payload.items = payload.items.map((item) => {
        // find the matching product in the cart if sent from frontend
        const cartItem = payload.cart?.find((c: any) => c.selectedBatchId == item.id);
        const uvc = cartItem?.uvc ?? 1;
        return { ...item, caseQuantity: item.caseQuantity * uvc };
    });
    let res;
    try {
        res = await fetch('https://enos.is/api/c/saq/v1/create-external-sales-order', {
            // const res = await fetch('http://localhost:7777/api/custom/saq/v1/create-external-sales-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error('// src/routes/api/submit-order/+server.ts', e);
    }

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('Remote API error body:', errorBody);
        return new Response(await res.text(), { status: res.status });
    }
    const data = await res.json();

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};


import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) => {
    let orderId, organizationId;
    try {
        const body = await request.json();
        orderId = body.orderId;
        organizationId = body.organizationId;
    } catch (e) {
        return json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!orderId || !organizationId) {
        return json({ error: 'Order ID and Organization ID are required' }, { status: 400 });
    }

    let res;
    try {
        res = await fetch(
            `${url.origin}/api/c/saq/v1/cancel-external-sales-order/${orderId}?organizationId=${organizationId}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (e) {
        return json({ error: 'Failed to connect to local API' }, { status: 500 });
    }

    if (!res.ok) {
        const errorBody = await res.text();
        return json({ error: errorBody }, { status: res.status });
    }

    try {
        const data = await res.json();
        return json({
            success: true,
            message: 'Order deleted successfully',
            orderId,
            data
        });
    } catch (e) {
        return json({
            success: true,
            message: 'Order deletion request completed',
            orderId
        });
    }
};


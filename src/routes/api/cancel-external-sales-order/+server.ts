import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	let payload: { orderId?: number; organizationId?: number } = {};

	try {
		payload = await request.json();
	} catch (e) {
		console.error('Failed to parse JSON in cancel-external-sales-order', e);
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { orderId, organizationId } = payload;

	if (!organizationId) {
		return new Response(JSON.stringify({ error: 'Organization ID is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}


	const parsedOrderId =
		typeof orderId === 'number'
			? orderId
			: typeof orderId === 'string'
				? parseInt(orderId, 10)
				: undefined;

	let url = `http://localhost:7777/api/c/saq/v1/cancel-external-sales-order`;
	if (parsedOrderId && !Number.isNaN(parsedOrderId)) {
		url += `/${parsedOrderId}`;
	}
	url += `?organizationId=${organizationId}`;

	let res: Response;
	try {
		res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (e) {
		console.error('Failed to reach cancel-external-sales-order upstream API', e);
		return new Response(JSON.stringify({ error: 'Upstream API unreachable' }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const text = await res.text();

	if (!res.ok) {
		console.error('Upstream cancel-external-sales-order error:', text);
		return new Response(text, {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response(text, {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};



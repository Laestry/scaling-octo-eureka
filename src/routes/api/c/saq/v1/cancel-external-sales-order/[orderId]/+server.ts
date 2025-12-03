import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, url }) => {

	const orderId = parseInt(params.orderId);
	const organizationId = url.searchParams.get('organizationId');

	if (!orderId || isNaN(orderId)) {
		return json({ error: 'Invalid order ID' }, { status: 400 });
	}

	if (!organizationId) {
		return json({ error: 'Organization ID is required' }, { status: 400 });
	}

	if (!SUPABASE_SERVICE_ROLE) {
		return json({ error: 'Server configuration error' }, { status: 500 });
	}

	const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	let order;
	try {
		const { data, error } = await supabase
			.schema('cms_saq')
			.from('alcohol_sales_orders')
			.select('id, payment_status, organization_id')
			.eq('id', orderId)
			.eq('organization_id', organizationId)
			.single();

		if (error || !data) {
			return json({ error: 'Order not found' }, { status: 404 });
		}

		order = data;

		if (order.payment_status !== 'started_checkout') {
			return json(
				{
					error: 'Order cannot be cancelled',
					message: `Order has payment status: ${order.payment_status}`
				},
				{ status: 400 }
			);
		}
	} catch (e) {
		return json({ error: 'Failed to verify order' }, { status: 500 });
	}

	try {
		const { error: linesError } = await supabase
			.schema('cms_saq')
			.from('alcohol_sales_order_lines')
			.delete()
			.eq('alcohol_sales_order_id', orderId)
			.eq('organization_id', organizationId);

		if (linesError) {
			return json({ error: 'Failed to delete order lines' }, { status: 500 });
		}
	} catch (e) {
		return json({ error: 'Failed to delete order lines' }, { status: 500 });
	}

	try {
		const { error: orderError } = await supabase
			.schema('cms_saq')
			.from('alcohol_sales_orders')
			.delete()
			.eq('id', orderId)
			.eq('organization_id', organizationId);

		if (orderError) {
			return json({ error: 'Failed to delete order' }, { status: 500 });
		}
	} catch (e) {
		return json({ error: 'Failed to delete order' }, { status: 500 });
	}

	return json({
		success: true,
		message: 'Order cancelled successfully',
		orderId
	});
};



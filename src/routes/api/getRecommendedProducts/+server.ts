import { getProductRecommendations } from '$lib/shopify';
import { json } from '@sveltejs/kit';
import { getNumberFromId } from '$lib/utils.js';

export async function POST({ request }) {
	const { productId } = await request.json();

	let recommendedProducts = await getProductRecommendations(getNumberFromId(productId));

	return json(recommendedProducts);
}

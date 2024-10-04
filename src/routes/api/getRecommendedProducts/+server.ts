import { getProductRecommendations } from '$lib/shopify';
import { json } from '@sveltejs/kit';
import { getNumberFromId } from '$lib/utils.js';

export async function POST({ request }) {
	const { productId } = await request.json();

	const recommendedProducts = await getProductRecommendations(getNumberFromId(productId));

	console.log('recommendedProducts', recommendedProducts);

	return json(recommendedProducts);
}

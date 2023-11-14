import type { PageServerLoadEvent } from './$types';
import { getNumberFromId } from '$lib/utils';
import { getProduct } from '$lib/shopify';
import { getProductRecommendations } from '$lib/shopify';


export async function load({ params }: PageServerLoadEvent) {
	return getProduct(getNumberFromId(params.slug));
}

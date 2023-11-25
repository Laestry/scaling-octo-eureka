import type { ProductNode } from '$lib/models/shopifyTypes';
import Cookies from 'js-cookie';
import { cartStore } from '$lib/store';

export function updateCart(product: ProductNode, quantity: number) {
	let products = JSON.parse(Cookies.get('cart'));

	const item = {
		title: product.title,
		id: product.id,
		variantId: product.variants.edges[0].node.id,
		picture: product.images.edges[0].node.originalSrc,
		price: product.variants.edges[0].node.priceV2.amount,
		color: product.color?.value ?? 'N/A',
		style: product.varietal?.value ?? 'N/A',
		quantity: quantity
	};

	const index = products.findIndex((o) => {
		return o.id === item.id;
	});

	if (index === -1) {
		products.push(item);
	} else {
		products[index] = item;
	}

	cartStore.set(products);

	const productsCookie = JSON.stringify(products);

	Cookies.set('cart', productsCookie, { path: '/' });
}

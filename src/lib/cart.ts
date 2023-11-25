import type { ProductNode } from '$lib/models/shopifyTypes';
import Cookies from 'js-cookie';
import { cartStore } from '$lib/store';
import { get } from 'svelte/store';

export interface CartItem {
	title: string;
	id: string;
	variantId: string;
	picture: string;
	price: string;
	color: string;
	style: string;
	quantity: number;
}

export function addToCart(product: ProductNode, quantity: number) {
	let products = get(cartStore);
	if (!products) products = [];

	const item: CartItem = {
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

export function updateCart(itemId: string, quantity: number) {
	let products = get(cartStore);
	if (!products) return;

	if (quantity <= 0) {
		products = products.filter((item) => item.id !== itemId);
	} else {
		const index = products.findIndex((item) => item.id === itemId);

		if (index !== -1) {
			products[index].quantity = quantity;
		}
	}

	cartStore.set(products);
	const productsCookie = JSON.stringify(products);
	Cookies.set('cart', productsCookie, { path: '/' });
}

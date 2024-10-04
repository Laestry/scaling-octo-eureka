import type { Product } from '$lib/server/db';

export function alcoholFormat(product: Product) {
	return `${(product.alcohol * 100).toFixed(2)}%`;
}

export function volumeFormat(product: Product) {
	const volume = product.format === 'l' ? product.volume * 1000 : product.format === 'ml' ? product.volume : undefined;
	const format = product.format === 'l' ? 'L' : product.format === 'ml' ? 'ML' : undefined;
	return `${volume || '-'} ${format || '-'}`;
}

export function priceFormat(product: Product) {
	return `${product.price.toFixed(2)} EUR`;
}

export function originFormat(product: Product) {
	return (
		[product.originCity, product.originRegion, product.originCountry, product.originCountryCode]
			.filter((x) => x)
			.join(', ') || '-'
	);
}

import type { Product } from '$lib/server/db';

export function alcoholFormat({ alcohol }: Product) {
	return `${(alcohol * 100).toFixed(2)}%`;
}

export function volumeFormat({ format, volume }: Product) {
	const _volume = format === 'l' ? volume * 1000 : format === 'ml' ? volume : undefined;
	const _format = format === 'l' ? 'L' : format === 'ml' ? 'ML' : undefined;
	return `${_volume || '-'} ${_format || '-'}`;
}

export function priceFormat({ price }: Product) {
	return `${price.toFixed(2)} $`;
}

export function originFormat({ originCity, originRegion, originCountry, originCountryCode }: Product) {
	return (
		[originCity, originRegion, originCountry, originCountryCode ? `[${originCountryCode}]` : '']
			.filter((x) => x)
			.join(', ') || '-'
	);
}

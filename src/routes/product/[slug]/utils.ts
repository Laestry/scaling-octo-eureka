import type { Product } from '$lib/server/prisma';

export function alcoholFormat({ alcohol }: Product) {
    return `${(alcohol * 100).toFixed(2)}%`;
}

export function volumeFormat({ volume }: Product) {
    return `${volume / 1000} L`;
}

export function priceFormat({ price }: Product) {
    return `${price.toFixed(2)} $`;
}

export function originFormat({ originCity, originRegion, originCountry, originCountryCode }: Product) {
    return (
        [originCity, originRegion, originCountry, originCountryCode ? `[${originCountryCode}]` : '']
            .filter(Boolean)
            .join(', ') || '-'
    );
}

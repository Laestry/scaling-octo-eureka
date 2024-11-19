import type { Product } from '$lib/server/prisma';

export function alcoholFormat({ alcohol }: Product) {
    return `${(alcohol * 100).toFixed(2)}%`;
}

export function volumeFormat({ volume }: Product) {
    return `${volume / 1000} L`;
}

export function priceFormat({ price, uvc }: Product, bottle: boolean = true, options: { none?: boolean } = {}) {
    const { none = false } = options; // Destructure 'none' from options with default value
    if (none) return `${price.toFixed(2)} $`;
    if (bottle) {
        return `${(price / uvc).toFixed(2)} $ / B`;
    } else {
        return `${price.toFixed(2)} $ / C`;
    }
}

export function originFormat({ originCity, originRegion, originCountry, originCountryCode }: Product) {
    return (
        [originCity, originRegion, originCountry, originCountryCode ? `[${originCountryCode}]` : '']
            .filter(Boolean)
            .join(', ') || '-'
    );
}

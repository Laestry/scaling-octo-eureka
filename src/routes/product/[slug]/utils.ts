import type { AlcoholProduct } from '$lib/models/pocketbase';
import { isPrixResto } from '$lib/store';
import { derived } from 'svelte/store';

export const priceFormat = derived(isPrixResto, ($isPrixResto) => {
    return function ({ pricing, uvc }: AlcoholProduct, bottle: boolean = true, options: { none?: boolean } = {}) {
        let price = $isPrixResto ? pricing.price : pricing.priceTaxIn;

        const { none = false } = options;
        if (none) return `${price.toFixed(2)} $`;
        if (bottle) {
            return `${(price / uvc).toFixed(2)} $ / B`;
        } else {
            return `${price.toFixed(2)} $ / C`;
        }
    };
});

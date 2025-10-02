import { isPrixResto } from '$lib/store';
import { derived } from 'svelte/store';

export const priceFormat = derived(isPrixResto, ($isPrixResto) => {
    return function (
        { price, price_tax_in, uvc }: { price: number; price_tax_in: number; uvc: number },
        bottle: boolean = true,
        options: { none?: boolean } = {}
    ) {
        // pick the right one
        const p = $isPrixResto ? price_tax_in : price;

        if (options.none) {
            return `${p.toFixed(2)} $`;
        }

        if (bottle) {
            return `${(p / uvc).toFixed(2)} $ / B`;
        } else {
            return `${p.toFixed(2)} $ / C`;
        }
    };
});

type SubCategory = { label: string; value: number };
type CategoryItem = {
    label: string;
    value: number;
    sub?: SubCategory[];
};

const translations: CategoryItem[] = [
    {
        sub: [
            {
                label: 'pet nat rosé',
                value: 25
            },
            {
                label: 'pet nat blanc',
                value: 6
            },
            {
                label: 'bulles rouge',
                value: 24
            },
            {
                label: 'bulles rosé',
                value: 23
            },
            {
                label: 'bulles blanc',
                value: 5
            },
            {
                label: 'rouge',
                value: 4
            },
            {
                label: 'rosé',
                value: 3
            },
            {
                label: 'orange',
                value: 2
            },
            {
                label: 'blanc',
                value: 1
            }
        ],
        label: 'vin',
        value: 1
    },
    {
        sub: [
            {
                label: 'de vin',
                value: 26
            }
        ],
        label: 'eau-de-vie',
        value: 8
    },
    {
        sub: [
            {
                label: 'saumon',
                value: 22
            },
            {
                label: 'tranquille',
                value: 18
            },
            {
                label: 'pétillant',
                value: 17
            },
            {
                label: 'jaune',
                value: 11
            }
        ],
        label: 'cidre',
        value: 3
    },
    {
        label: 'bière',
        value: 4
    }
];

/**
 * Look up the human-readable label for a given category & specific_category code.
 *
 * @param category      numeric code for the top-level category
 * @param specificCat   numeric code for the specific_category (optional)
 * @returns the matching label, or empty string if not found
 */
export function getCategory(product: any): string {
    let category = product.category;
    let specificCat = product.specific_category;
    const catItem = translations.find((c) => c.value === category);
    if (!catItem) return '';

    if (specificCat != null && Array.isArray(catItem.sub)) {
        const subItem = catItem.sub.find((s) => s.value === specificCat);
        if (subItem) return subItem.label;
    }

    return catItem.label;
}

export function sellBeforeDate(dateInput: Date | string | number): string {
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) throw new Error('Invalid date');

    const mois = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre'
    ];

    const dd = String(d.getDate()).padStart(2, '0');
    const month = mois[d.getMonth()];
    const y = d.getFullYear();
    const yyyy = String(y);

    return `${dd} ${month}, ${yyyy}`;
}

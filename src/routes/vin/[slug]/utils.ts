import { isPrixResto } from '$lib/store';
import { derived } from 'svelte/store';

export const priceFormat = derived(isPrixResto, ($isPrixResto) => {
    return function (
        {
            price,
            price_tax_in,
            uvc,
            isPrixResto
        }: {
            price: number;
            price_tax_in: number;
            uvc: number;
            isPrixResto?: boolean;
        },
        bottle: boolean = true,
        options: { none?: boolean } = {}
    ) {
        // console.log('price:', price, 'price_tax_in:', price_tax_in);
        const useResto = isPrixResto ?? $isPrixResto;
        const p = useResto ? price : price_tax_in;

        if (options.none) {
            return `${p.toFixed(2)} $`;
        }

        if (bottle) {
            return `${p.toFixed(2)} $ / B`;
        } else {
            return `${(p * uvc).toFixed(2)} $ / C`;
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

export function transformVinToCartObject(product, selectedBatchId) {
    // Find the selected batch
    const selectedBatch = product.alcohol_batches.find((batch) => batch.id === selectedBatchId);

    if (!selectedBatch) {
        throw new Error(`Batch with id ${selectedBatchId} not found`);
    }

    // Calculate total quantity across all batches
    const totalQuantity = product.alcohol_batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0;

    // Get unique vintages
    const vintages = [...new Set(product.alcohol_batches?.map((batch) => batch.vintage).filter(Boolean))];

    let mainImage;
    if (
        product.alcohol_website?.[0]?.alcohol_images?.[0]?.files?.file_name &&
        product.alcohol_website?.[0]?.alcohol_images?.[0]?.files?.uuid
    ) {
        mainImage =
            product.alcohol_website?.[0]?.alcohol_images?.[0]?.files?.uuid +
            '/' +
            product.alcohol_website?.[0]?.alcohol_images?.[0]?.files?.file_name;
    } else {
        mainImage = null;
    }

    // Transform to cart object format
    const cartObject = {
        id: product.id,
        name: product.name,
        category: product.category,
        specific_category: product.specific_category,
        uvc: product.uvc,
        format: product.format,
        unit: product.unit,
        volume: product.volume,
        volume_and_format: `${product.volume}${product.unit === 1 ? 'ml' : 'L'}`,
        organization_id: product.organization_id,
        provider_id: product.provider_id,
        country_id: product.country_id,
        region_name: product.region_name,
        tags: product.tags,
        provider_display_name: product.parties?.display_name,
        batch_count: product.alcohol_batches?.length || 0,
        total_quantity: totalQuantity,
        vintages: vintages,

        // Selected batch properties (replacing "oldest" with "selected")
        selected_batch_id: selectedBatch.id,
        selected_vintage: selectedBatch.vintage,
        selected_price: selectedBatch.price,
        selected_price_tax_in: selectedBatch.price_tax_in,
        selected_calculated_quantity: selectedBatch.calculated_quantity,
        selected_sell_before_date: selectedBatch.sell_before_date,
        selected_agency_fee: selectedBatch.agency_fee,
        selected_agency_fee_percentage: selectedBatch.agency_fee_percentage,
        selected_agency_fee_is_percentage: selectedBatch.agency_fee_is_percentage,

        website_slug: product.slug,
        main_image_file: mainImage || null,
        updated_at: product.updated_at
    };

    return cartObject;
}
//#endregion cart_handlers

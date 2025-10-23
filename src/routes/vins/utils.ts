export function getOldestBatch(product): any | null {
    return (
        product.alcohol_batches
            ?.filter((b) => !b.is_archived && b.quantity > 0 && b.calculated_quantity > 0)
            .sort((a, b) => {
                const aT = a.sell_before_date ? new Date(a.sell_before_date).getTime() : Infinity;
                const bT = b.sell_before_date ? new Date(b.sell_before_date).getTime() : Infinity;
                return aT - bT;
            })[0] ?? null
    );
}

export function transformVinsToCartObject(product) {
    // Transform to cart object format - using existing "oldest" properties
    const cartObject = {
        id: product.id,
        name: product.name,
        category: product.category,
        specific_category: product.specific_category,
        uvc: product.uvc,
        format: product.format,
        unit: product.unit,
        volume: product.volume,
        volume_and_format: product.volume_and_format,
        organization_id: product.organization_id,
        provider_id: product.provider_id,
        country_id: product.country_id,
        region_name: product.region_name,
        tags: product.tags,
        provider_display_name: product.provider_display_name,
        batch_count: product.batch_count,
        total_quantity: product.total_quantity,
        vintages: product.vintages,

        // Rename "oldest" properties to "selected"
        selected_batch_id: product.oldest_batch_id,
        selected_vintage: product.oldest_vintage,
        selected_price: product.oldest_price,
        selected_price_tax_in: product.oldest_price_tax_in,
        selected_calculated_quantity: product.oldest_calculated_quantity,
        selected_sell_before_date: product.oldest_sell_before_date,
        selected_agency_fee: product.oldest_agency_fee,
        selected_agency_fee_percentage: product.oldest_agency_fee_percentage,
        selected_agency_fee_is_percentage: product.oldest_agency_fee_is_percentage,

        website_slug: product.website_slug,
        main_image_file: product.main_image_file,
        updated_at: product.updated_at,

        // Cart specific properties
        selectedBatchId: product.oldest_batch_id.toString(),
        quantity: 1 // Initial quantity
    };

    return cartObject;
}

import { error } from '@sveltejs/kit';

const ORGANIZATION_ID = 2;

/**
 * Stock, price and agency fee come from cms_saq.portaus_wines, the same synced catalogue /vins and
 * the cart use; alcohol_batches stopped being updated when ordering moved to Portaus. That table
 * has no batches, so the wine becomes a single batch keyed by its Portaus id — the same key the
 * catalogue cards put in the cart.
 */
function portausBatch(w: any) {
    const priceTaxIn = Number(w.price_tax_in) || 0;
    const agencyFee = Number(w.agency_fee) || 0;
    return {
        id: w.portaus_id,
        vintage: w.vintage,
        price: Number(w.price) || 0,
        price_tax_in: priceTaxIn,
        quantity: w.available_bottles,
        calculated_quantity: w.available_bottles,
        // portaus_wines.sell_before is synced but deliberately not shown: no "Acheter avant" line.
        sell_before_date: null,
        // Portaus charges a flat fee per bottle; carried both ways, as the catalogue does.
        agency_fee: agencyFee,
        agency_fee_net: agencyFee,
        agency_fee_with_taxes: Number(w.agency_fee_with_taxes) || 0,
        agency_fee_percentage: priceTaxIn > 0 ? (agencyFee / priceTaxIn) * 100 : 0,
        agency_fee_is_percentage: false,
        is_archived: false
    };
}

export async function load({ locals, params }) {
    const { data, error: serror } = await locals.supabase
        .schema('cms_saq')
        .from('alcohol')
        .select(
            `*,
            parties(*),
            alcohol_website!inner(
                *,
                alcohol_images(id, alcohol_id, file_uuid, order, is_archived)
            )
            `
        )
        .eq('alcohol_website.slug', params.slug)
        .eq('organization_id', ORGANIZATION_ID)
        .eq('is_archived', false)
        .single();

    if (serror) error(404);

    const { data: wine } = await locals.supabase
        .schema('cms_saq')
        .from('portaus_wines')
        .select('*')
        .eq('portaus_id', data.id)
        .eq('organization_id', ORGANIZATION_ID)
        .maybeSingle();

    // No stock (or no longer in Portaus) means no batch, which the page shows as "Non disponible".
    data.alcohol_batches = wine && wine.available_bottles > 0 ? [portausBatch(wine)] : [];
    if (wine) {
        data.uvc = wine.uvc ?? data.uvc;
        data.volume = wine.volume ?? data.volume;
        data.format = wine.format ?? data.format;
        data.vintage = wine.vintage;
        data.provider_id = wine.provider_id ?? data.provider_id;
        data.country_id = wine.country_id ?? data.country_id;
        data.region_name = wine.region_name ?? data.region_name;
        // The price helpers add the fee as a fraction of the tax-in price.
        data.agency_fee_percentage = wine.price_tax_in > 0 ? Number(wine.agency_fee) / Number(wine.price_tax_in) : 0;
        data.parties = {
            ...(data.parties ?? {}),
            id: data.provider_id,
            display_name: wine.producer ?? data.parties?.display_name
        };
    }

    const allImages: any[] = (data.alcohol_website[0]?.alcohol_images ?? [])
        .filter((i: any) => !i.is_archived)
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    const fileUuids = [...new Set(allImages.map((i: any) => i.file_uuid).filter(Boolean))];

    let fileMap: Record<string, string> = {};
    if (fileUuids.length) {
        const { data: files } = await locals.supabase
            .schema('cms_saq')
            .from('files')
            .select('uuid, file_name')
            .in('uuid', fileUuids);

        fileMap = Object.fromEntries((files ?? []).map((f: any) => [f.uuid, f.file_name]));
    }

    data.image_paths = allImages
        .map((i: any) => (i.file_uuid && fileMap[i.file_uuid] ? `${i.file_uuid}/${fileMap[i.file_uuid]}` : null))
        .filter(Boolean);

    // fallback: если files недоступна через anon — берём из view
    if (!data.image_paths.length) {
        const { data: viewData } = await locals.supabase
            .schema('cms_saq')
            .from('alcohol_view')
            .select('main_image_file')
            .eq('website_slug', params.slug)
            .single();

        if (viewData?.main_image_file) {
            data.image_paths = [viewData.main_image_file];
        }
    }

    return { product: data };
}

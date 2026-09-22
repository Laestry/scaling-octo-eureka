import { alcoholCategory, countries, volumeFormat } from './types';

export function getSpecificCategoryLabel(raw: string | Record<string, any>): string | null {
    try {
        const { category, specificCategory } = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (category !== 1) return null; // only “vin” (wine) for now
        if (specificCategory === null || specificCategory === 0) return null; // skip null/0
        const wineGroup = alcoholCategory.fr.find((c) => c.value === 1);
        if (!wineGroup) return null;
        const sub = wineGroup.sub.find((s) => s.value === specificCategory);
        return sub?.label ?? String(specificCategory);
    } catch {
        return null;
    }
}

export function formatLocation(raw: string | Record<string, any>): string {
    try {
        const { country_id, region_name } = typeof raw === 'string' ? JSON.parse(raw) : raw;

        if (!country_id && !region_name) return ''; // skip entirely if both are null/0

        const country = countries.find((c) => c.id === country_id);
        const countryNameFr = country?.name?.fr ?? country?.country_name ?? '';
        if (region_name) {
            return `${countryNameFr}, ${region_name}`;
        }
        return countryNameFr;
    } catch {
        return String(raw);
    }
}

export function formatVolume(raw: string | Record<string, any>): string {
    try {
        const { volume, format } = typeof raw === 'string' ? JSON.parse(raw) : raw;

        if (!volume || !format) return '';

        if (format === 2) {
            const l = Number(volume);
            const display = Number.isInteger(l) ? `${l}` : `${parseFloat(l.toFixed(2))}`;
            return `${display}l`;
        }

        if (format === 1) {
            const ml = Number(volume);
            const display = Number.isInteger(ml) ? `${ml}` : `${Math.round(ml)}`;
            return `${display}ml`;
        }

        return String(volume);
    } catch {
        return String(raw);
    }
}

import { supabase } from '$lib/supabase/client';
import type { TFilters } from '$lib/models/general';

function parseMaybeJson<T = any>(v: any): T {
    if (typeof v === 'string') {
        try {
            return JSON.parse(v) as T;
        } catch {
            // fallback to raw string
            return v as T;
        }
    }
    return v as T;
}

type RawProducer = { id: number; name: string };
type RawRegion = { country_id?: number; region_name?: string };
type RawCategory = { category?: number; specificCategory?: number };
type RawFormat = { format?: number; volume?: number };

interface FetchOpts {
    limit: number;
    offset: number;
    sorting?: string | null;
}

/**
 * A row of cms_saq.portaus_wines dressed up as the product shape the cards and the cart
 * transform already expect.
 *
 * That table has no batches, so the "oldest batch" fields collapse onto the wine itself:
 * one wine, one price, one stock figure. `oldest_batch_id` is kept as the cart's local key and
 * carries the Portaus product id, which is also what the checkout posts.
 */
export function portausWineToProduct(w: any) {
    const priceTaxIn = Number(w.price_tax_in) || 0;
    const agencyFee = Number(w.agency_fee) || 0;

    return {
        id: w.portaus_id,
        name: w.name,
        category: w.category,
        specific_category: w.specific_category,
        uvc: w.uvc,
        format: w.format,
        unit: w.unit,
        volume: w.volume,
        volume_and_format: formatVolume({ volume: w.volume, format: w.format }),
        organization_id: w.organization_id,
        provider_id: w.provider_id,
        country_id: w.country_id,
        region_name: w.region_name,
        tags: w.tags ?? [],
        provider_display_name: w.producer ?? '',
        batch_count: 1,
        total_quantity: w.available_bottles,
        vintages: w.vintages ?? [],

        oldest_batch_id: w.portaus_id,
        oldest_vintage: w.vintage ? Number(w.vintage) : null,
        oldest_price: Number(w.price) || 0,
        oldest_price_tax_in: priceTaxIn,
        oldest_calculated_quantity: w.available_bottles,
        oldest_sell_before_date: w.availability_date,

        // Portaus charges a flat fee per bottle. The display helpers want a fraction of the
        // tax-in price, so express the same amount that way; the cart keeps the flat figure too.
        oldest_agency_fee: agencyFee,
        oldest_agency_fee_net: agencyFee,
        oldest_agency_fee_with_taxes: Number(w.agency_fee_with_taxes) || 0,
        oldest_agency_fee_percentage: priceTaxIn > 0 ? agencyFee / priceTaxIn : 0,
        oldest_agency_fee_is_percentage: false,

        website_slug: w.website_slug,
        main_image_file: w.main_image_file ?? null,
        short_description: w.short_description,
        updated_at: w.synced_at
    };
}

/**
 * Query `cms_saq.portaus_wines`: the flat catalogue of what Portaus will actually accept on an
 * order. Same filters and sorting as before, against this table's column names.
 */
export async function fetchFilteredProductsForAlcohol(
    supabaseClient: typeof supabase,
    selected: Partial<TFilters> = {},
    opts: FetchOpts
) {
    const producer = selected?.producer ? parseMaybeJson<RawProducer>(selected?.producer) : null;
    const region = selected?.region ? parseMaybeJson<RawRegion>(selected?.region) : null;

    const categoryArr: RawCategory[] = [];
    if (selected?.category) {
        const raw = Array.isArray(selected?.category) ? selected?.category : [selected?.category];
        raw.forEach((c) => {
            const parsed = parseMaybeJson<RawCategory>(c);
            if (parsed) categoryArr.push(parsed);
        });
    }

    const format = selected?.format ? parseMaybeJson<RawFormat>(selected?.format) : null;

    const vintageArr: number[] = [];
    if (selected?.vintage) {
        if (Array.isArray(selected?.vintage)) vintageArr.push(...selected?.vintage);
        else vintageArr.push(selected?.vintage);
    }

    let query = supabaseClient
        .schema('cms_saq')
        .from('portaus_wines')
        .select('*', { count: 'exact' })
        .eq('organization_id', 2)
        .gt('price', 0)
        .gt('price_tax_in', 0)
        .not('website_slug', 'is', null);

    // producer
    if (producer?.id != null) {
        query = query.eq('provider_id', producer.id);
    }

    // region
    if (region) {
        if (region.country_id != null) query = query.eq('country_id', region.country_id);
        if (region.region_name) query = query.eq('region_name', region.region_name);
    }

    // category OR of pairs
    if (categoryArr.length) {
        const validPairs = categoryArr
            .filter((c) => c?.category != null && c?.specificCategory != null)
            .map((c) => `and(category.eq.${c.category},specific_category.eq.${c.specificCategory})`);
        if (validPairs.length) query = query.or(validPairs.join(','));
    }

    // format
    if (format) {
        if (format.format != null) query = query.eq('format', format.format);
        if (format.volume != null) query = query.eq('volume', format.volume);
    }

    // vintage: any overlap with the wine's vintages
    if (vintageArr.length) {
        query = query.overlaps('vintages', vintageArr);
    }

    // name
    if (selected?.nameSearch) {
        query = query.ilike('name', `%${selected?.nameSearch}%`);
    }

    // tag
    if (selected?.tag) {
        query = query.ilike('tags', `%${selected?.tag}%`);
    }

    // price range on the bottle price
    if (selected?.priceRange) {
        if (selected?.priceRange === 'low') query = query.gte('price', 20).lte('price', 30);
        else if (selected?.priceRange === 'mid') query = query.gte('price', 30).lte('price', 40);
        else if (selected?.priceRange === 'high') query = query.gte('price', 40);
    }

    // sorting
    if (opts.sorting) {
        if (opts.sorting === 'Prix croissant') {
            query = query.order('price', { ascending: true });
        } else if (opts.sorting === 'Prix décroissant') {
            query = query.order('price', { ascending: false });
        } else if (opts.sorting === 'Alphabétique') {
            query = query.order('name', { ascending: true });
        } else {
            query = query
                .order('availability_date', { ascending: false })
                .order('available_bottles', { ascending: false });
        }
    } else {
        query = query.order('producer', { ascending: true }).order('name', { ascending: true });
    }

    // pagination
    query = query.range(opts.offset, opts.offset + opts.limit - 1);

    const result = await query;
    return { ...result, data: (result.data ?? []).map(portausWineToProduct) };
}

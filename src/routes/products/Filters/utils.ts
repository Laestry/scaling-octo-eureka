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

        if (!volume || !format) return ''; // skip 0 or null values

        if (format === 2) {
            // liters
            const l = Number(volume);
            const display = Number.isInteger(l) ? `${l}` : `${parseFloat(l.toFixed(2))}`;
            return `${display}l`;
        }

        if (format === 1) {
            // milliliters
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
 * Builds and executes the Supabase query for your `cms_saq.alcohol` table,
 * applying the selected filters (producer, region, categories, format, vintage,
 * nameSearch, tag, priceRange, sorting) and the existing joins / constraints.
 */
export async function fetchFilteredProductsForAlcohol(
    supabaseClient: typeof supabase,
    selected: TFilters,
    opts: FetchOpts
) {
    const producer = selected.producer ? parseMaybeJson<RawProducer>(selected.producer) : null;
    const region = selected.region ? parseMaybeJson<RawRegion>(selected.region) : null;

    const categoryArr: RawCategory[] = [];
    if (selected.category) {
        const raw = Array.isArray(selected.category) ? selected.category : [selected.category];
        raw.forEach((c) => {
            const parsed = parseMaybeJson<RawCategory>(c);
            if (parsed) categoryArr.push(parsed);
        });
    }

    const format = selected.format ? parseMaybeJson<RawFormat>(selected.format) : null;

    const vintageArr: number[] = [];
    if (selected.vintage) {
        if (Array.isArray(selected.vintage)) {
            vintageArr.push(...selected.vintage);
        } else {
            vintageArr.push(selected.vintage);
        }
    }

    // base query with joins and quantity constraint
    let query = supabaseClient
        .schema('cms_saq')
        .from('alcohol')
        .select('*, alcohol_batches!inner(*), parties!inner(display_name)', { count: 'exact' })
        .gt('alcohol_batches.quantity', 0)
        .gt('alcohol_batches.price', 0)
        .gt('alcohol_batches.price_tax_in', 0);

    // producer filter: assumes alcohol table has producer_id column
    if (producer?.id != null) {
        query = query.eq('provider_id', producer.id);
    }

    // region filter: example assumes columns region_country_id and region_name exist
    if (region) {
        if (region.country_id != null) {
            query = query.eq('country_id', region.country_id);
        }
        if (region.region_name) {
            query = query.eq('region_name', region.region_name);
        }
    }

    // category: OR of (category & specificCategory) pairs
    if (categoryArr.length) {
        const validPairs = categoryArr
            .filter((c) => c?.category != null && c?.specificCategory != null)
            .map((c) => `and(category.eq.${c.category},specific_category.eq.${c.specificCategory})`);
        if (validPairs.length) {
            query = query.or(validPairs.join(','));
        }
    }

    // format filter
    if (format) {
        if (format.format != null) {
            query = query.eq('format', format.format);
        }
        if (format.volume != null) {
            query = query.eq('volume', format.volume);
        }
    }

    // vintage filter
    if (vintageArr.length) {
        query = query.in('alcohol_batches.vintage', vintageArr);
    }

    // nameSearch: partial match on name
    if (selected.nameSearch) {
        query = query.ilike('name', `%${selected.nameSearch}%`);
    }

    // tag: naive inclusion, adapt depending on your schema (e.g., jsonb array, text array)
    if (selected.tag) {
        // If tags is a text column containing comma-separated or similar:
        query = query.ilike('tags', `%${selected.tag}%`);
        // If tags is a proper array column you might use: query = query.contains('tags', [selected.tag]);
    }

    // priceRange
    if (selected.priceRange) {
        if (selected.priceRange === 'low') {
            query = query.gte('alcohol_batches.price', 20).lte('alcohol_batches.price', 30);
        } else if (selected.priceRange === 'mid') {
            query = query.gte('alcohol_batches.price', 30).lte('alcohol_batches.price', 40);
        } else if (selected.priceRange === 'high') {
            query = query.gte('alcohol_batches.price', 40);
        }
    }

    // sorting
    if (opts.sorting) {
        if (opts.sorting === 'Prix croissant') {
            query = query.order('price', { referencedTable: 'alcohol_batches', ascending: true });
        } else if (opts.sorting === 'Prix décroissant') {
            query = query.order('price', { referencedTable: 'alcohol_batches', ascending: false });
        } else if (opts.sorting === 'Alphabétique') {
            query = query.order('name', { ascending: true });
        } else {
            query = query.order('sell_before_date', {
                referencedTable: 'alcohol_batches',
                ascending: false
            });
        }
    } else {
        query = query.order('sell_before_date', {
            referencedTable: 'alcohol_batches',
            ascending: false
        });
    }

    // range / pagination
    query = query.range(opts.offset, opts.offset + opts.limit - 1);

    return await query;
}

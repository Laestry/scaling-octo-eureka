// GET /api/portaus/sync/wines  — fills cms_saq.portaus_wines
//
// A flat catalogue of what can actually be ordered through Portaus: one row per product, no
// batches. Ordering only needs the puid, the case size and the bottles left, so the batch table
// is not involved here.
//
// Source: /API/latest/admin/inventories/1/products?active=true&available=true
//   - quantity.inStock is the orderable amount. Verified against sales-orders/calculate: asking
//     for more than inStock comes back with quantityLeft equal to it.
//   - pricing.agencyFee / agencyFeeWTaxes are per bottle, and match the PRODUCT_AGENCY_FEE line
//     the order API prices. agencyFeeWTaxes × bottles is what Stripe charges.
//
// Wines that dropped out of the "available" list keep their row but are zeroed, so nothing
// stale stays orderable.
//
// Auth: `Authorization: Bearer <CRON_SECRET>`, or dev mode.
// Query: ?dry=1 maps without writing, ?page=N&limit=N to sync a single page.

import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { INVENTORY_ID, PortausError, portausRequest } from '$lib/server/portausAdmin';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient, upsertChunked } from '$lib/server/supabase';

const ORGANIZATION_ID = 2;
const PAGE_SIZE = 100;
const PARALLEL_PAGES = 4;

type ProductsPage = { list: any[]; count: number; pages: number; page: number };

function str(v: unknown): string | null {
    if (typeof v === 'string') return v.trim() || null;
    if (typeof v === 'number') return String(v);
    return null;
}

function num(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function int(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/**
 * The SAQ code lives on the product's lot references, as "<saq code>-<lot>" or just the code.
 * Take it from the first lot that has one.
 */
function saqCode(product: any): string | null {
    for (const item of product.items ?? []) {
        const reference = str(item?.reference);
        if (reference) return reference.split('-')[0]!.trim() || null;
    }
    return null;
}

/** Distinct vintages across the product's lots, for the listing's vintage filter. */
function vintages(p: any): number[] {
    const years = new Set<number>();
    for (const item of p.items ?? []) {
        const year = Number(item?.extraInfo?.vintage ?? item?.vintage);
        if (Number.isInteger(year) && year > 1900) years.add(year);
    }
    return [...years].sort((a, b) => b - a);
}

/** Most recent lot arrival, which is what the listing orders by when nothing is chosen. */
function availabilityDate(p: any): string | null {
    const dates = (p.items ?? [])
        .map((item: any) => (item?.availabilityDate ? new Date(item.availabilityDate).getTime() : NaN))
        .filter((t: number) => Number.isFinite(t));
    return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
}

function mapWine(p: any, syncedAt: string) {
    const pricing = p.pricing ?? {};
    return {
        portaus_id: p.id,
        puid: p.puid,
        sku: str(p.sku),
        name: str(p.cmsName) || str(p.name) || '(sans nom)',
        extended_name: str(p.extendedName),
        vintage: str(p.currentVintage),
        producer: str(p.provider?.displayName) || str(p.provider?.usualName) || str(p.provider?.name),
        uvc: int(p.uvc) > 0 ? int(p.uvc) : 1,
        volume: num(p.volume),
        format: p.format ?? null,
        available_bottles: Math.max(0, int(p.quantity?.inStock)),
        price: num(pricing.price),
        price_tax_in: num(pricing.priceTaxIn),
        agency_fee: num(pricing.agencyFee),
        agency_fee_with_taxes: num(pricing.agencyFeeWTaxes),
        saq_code: saqCode(p),
        slug: str(p.slug),
        web_published: p.published === true,
        tags: (p.tags ?? []).map((t: any) => str(t?.code)).filter(Boolean),
        short_description: str(p.shortDescription),
        description: str(p.description),
        category: p.category?.id ?? null,
        specific_category: p.specificCategory?.id ?? null,
        unit: p.unit ?? null,
        vintages: vintages(p),
        availability_date: availabilityDate(p),
        organization_id: ORGANIZATION_ID,
        synced_at: syncedAt
    };
}

type CmsFields = {
    website_slug: string | null;
    provider_id: number | null;
    country_id: number | null;
    region_name: string | null;
};

/**
 * Website slug and origin are CMS data that Portaus does not serve. They live in the existing
 * tables under the same product id (portaus_id = cms_saq.alcohol.id, verified to hold for every
 * row), so they get folded into the wine rows before writing.
 *
 * Images are deliberately not copied: main_image_file stays null for now.
 */
async function readCmsFields(supabase: SupabaseClient, portausIds: number[]): Promise<Map<number, CmsFields>> {
    const out = new Map<number, CmsFields>();
    if (!portausIds.length) return out;

    const [alcohols, sites] = await Promise.all([
        supabase
            .schema('cms_saq')
            .from('alcohol')
            .select('id, provider_id, country_id, region_name')
            .in('id', portausIds),
        supabase
            .schema('cms_saq')
            .from('alcohol_website')
            .select('alcohol_id, slug, is_archived')
            .in('alcohol_id', portausIds)
    ]);

    if (alcohols.error) console.error('sync/wines: could not read alcohol for enrichment', alcohols.error);
    if (sites.error) console.error('sync/wines: could not read alcohol_website for enrichment', sites.error);

    const slug = new Map<number, string>();
    for (const site of sites.data ?? []) {
        if (!site.is_archived && site.slug && !slug.has(site.alcohol_id)) slug.set(site.alcohol_id, site.slug);
    }
    const origin = new Map((alcohols.data ?? []).map((a: any) => [a.id, a]));

    for (const id of portausIds) {
        out.set(id, {
            website_slug: slug.get(id) ?? null,
            provider_id: origin.get(id)?.provider_id ?? null,
            country_id: origin.get(id)?.country_id ?? null,
            region_name: origin.get(id)?.region_name ?? null
        });
    }
    return out;
}

export const GET: RequestHandler = async ({ request, url }) => {
    const auth = request.headers.get('authorization') ?? '';
    if (!(dev || (env['CRON_SECRET'] && auth === `Bearer ${env['CRON_SECRET']}`))) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onlyPage = Number(url.searchParams.get('page')) || null;
    const limit = Number(url.searchParams.get('limit')) || PAGE_SIZE;
    const started = Date.now();
    const syncedAt = new Date(started).toISOString();

    try {
        const list = (page: number) =>
            portausRequest<ProductsPage>('GET', `/API/latest/admin/inventories/${INVENTORY_ID}/products`, {
                query: { limit, page, active: 'true', available: 'true', orderBy: 'age' }
            });

        const first = await list(onlyPage ?? 1);
        const pages: any[][] = [first.list];
        if (!onlyPage) {
            for (let p = 2; p <= first.pages; p += PARALLEL_PAGES) {
                const batch = Array.from({ length: Math.min(PARALLEL_PAGES, first.pages - p + 1) }, (_, i) =>
                    list(p + i)
                );
                for (const res of await Promise.all(batch)) pages.push(res.list);
            }
        }

        const wines = pages
            .flat()
            .filter((p) => p?.puid)
            .map((p) => mapWine(p, syncedAt));

        if (url.searchParams.get('dry')) {
            return json({
                dry: true,
                available: first.count,
                pages: onlyPage ? 1 : first.pages,
                mapped: wines.length,
                sample: wines.slice(0, 3)
            });
        }

        const supabase = createServiceClient();

        // Fold in the CMS columns first: a second pass writing only those would be an upsert with
        // no puid, and PostgREST upserts insert-on-conflict, so NOT NULL would reject it.
        const cms = await readCmsFields(
            supabase,
            wines.map((w) => w.portaus_id)
        );
        for (const wine of wines) Object.assign(wine, cms.get(wine.portaus_id as number) ?? {});
        const enriched = [...cms.values()].filter((c) => c.website_slug).length;

        const result = await upsertChunked(supabase, 'cms_saq', 'portaus_wines', wines);

        // A wine that sold out drops off the "available" list entirely, so it would otherwise keep
        // whatever stock it had at its last sync. Only meaningful on a full run.
        // Matching on the run's timestamp rather than listing every id kept in this run: the id
        // list would go into the query string and grow with the catalogue.
        let retired = 0;
        if (!onlyPage && wines.length) {
            const { data, error } = await supabase
                .schema('cms_saq')
                .from('portaus_wines')
                .update({ available_bottles: 0 })
                .gt('available_bottles', 0)
                .lt('synced_at', syncedAt)
                .select('portaus_id');
            if (error) console.error('sync/wines: could not zero retired wines', error);
            retired = data?.length ?? 0;
        }

        if (result.failed.length) console.error('sync/wines: failed rows', JSON.stringify(result.failed, null, 1));

        return json({
            ok: result.failed.length === 0,
            available: first.count,
            pages: onlyPage ? 1 : first.pages,
            synced: result.ok,
            enriched,
            retired,
            failed: result.failed,
            ms: Date.now() - started
        });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('sync/wines: Portaus error', e.status, e.path, e.body);
            return json({ error: 'PortausError', message: e.detail, status: e.status }, { status: 502 });
        }
        console.error('sync/wines failed', e);
        return json({ error: 'SyncFailed', message: (e as Error).message }, { status: 500 });
    }
};

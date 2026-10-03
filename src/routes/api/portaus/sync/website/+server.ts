// GET /api/portaus/sync/website  — refreshes cms_saq.alcohol_website from Portaus
//
// One row per wine, matched on alcohol_id (= the Portaus product id, as in sync/wines). Wines
// with stock (quantity.inStock > 0, the same orderable amount sync/wines uses) get their Portaus
// content and are published; every other row of the organization is unpublished.
//
// Slugs: Portaus's slug, else the row's current one, else one made from the name. A slug another
// wine already uses gets -2, -3… appended, so every page URL stays unique.
//
// Rows are only ever updated or added, never deleted: alcohol_images hangs off this table with
// ON DELETE CASCADE, and the subtitles and English descriptions exist nowhere else. Those columns
// are not written here — Portaus has no English text, and its shortDescription is not the
// curated subtitle.
//
// Source: /API/latest/admin/inventories/1/products?active=true&available=true
//
// Auth: `Authorization: Bearer <CRON_SECRET>`, or dev mode.
// Query: ?dry=1 reports what would change without writing.

import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { INVENTORY_ID, PortausError, portausRequest } from '$lib/server/portausAdmin';
import { createServiceClient, upsertChunked } from '$lib/server/supabase';

const ORGANIZATION_ID = 2;
const PAGE_SIZE = 100;
const PARALLEL_PAGES = 4;
/** PostgREST caps a select at 1000 rows by default. */
const READ_PAGE = 1000;

type ProductsPage = { list: any[]; count: number; pages: number; page: number };

function str(v: unknown): string | null {
    if (typeof v === 'string') return v.trim() || null;
    if (typeof v === 'number') return String(v);
    return null;
}

/** "Château d'Yquem 2019!" -> "chateau-d-yquem-2019" */
function slugify(text: string | null): string | null {
    const slug = (text ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || null;
}

/**
 * Hands out unique slugs. `taken` maps every slug already in alcohol_website to the wine using
 * it; a wine keeps a slug that is already its own.
 */
function slugAllocator(taken: Map<string, number>) {
    return (alcoholId: number, ...candidates: (string | null)[]) => {
        const base = candidates.find(Boolean) ?? `vin-${alcoholId}`;
        let slug = base;
        for (let n = 2; taken.has(slug) && taken.get(slug) !== alcoholId; n++) slug = `${base}-${n}`;
        taken.set(slug, alcoholId);
        return slug;
    };
}

/** The Portaus-owned columns of an alcohol_website row. */
function websiteFields(p: any, now: string, slug: string) {
    return {
        alcohol_id: p.id as number,
        organization_id: ORGANIZATION_ID,
        name: str(p.cmsName) || str(p.name),
        slug,
        description_french: str(p.description),
        weblink: str(p.webLink),
        published: true,
        is_archived: false,
        updated_at: now
    };
}

/**
 * A minimal cms_saq.alcohol row for a wine Portaus added after the CMS import, so its website row
 * has the parent the foreign key wants. Same id as Portaus. Provider and country are left out:
 * they reference parties / unicode_countries, which use other ids.
 */
function alcoholFields(p: any, slug: string) {
    return {
        id: p.id as number,
        organization_id: ORGANIZATION_ID,
        name: str(p.cmsName) || str(p.name),
        extended_name: str(p.extendedName),
        short_description: str(p.shortDescription),
        sku: str(p.sku),
        slug,
        uvc: Number(p.uvc) > 0 ? Math.trunc(Number(p.uvc)) : null,
        volume: Number.isFinite(Number(p.volume)) ? Number(p.volume) : null,
        format: p.format ?? null,
        unit: p.unit ?? null,
        category: p.category?.id ?? null,
        specific_category: p.specificCategory?.id ?? null,
        is_archived: false
    };
}

async function fetchAvailableProducts(): Promise<{ products: any[]; count: number }> {
    const list = (page: number) =>
        portausRequest<ProductsPage>('GET', `/API/latest/admin/inventories/${INVENTORY_ID}/products`, {
            query: { limit: PAGE_SIZE, page, active: 'true', available: 'true', orderBy: 'age' }
        });

    const first = await list(1);
    const pages: any[][] = [first.list];
    for (let p = 2; p <= first.pages; p += PARALLEL_PAGES) {
        const batch = Array.from({ length: Math.min(PARALLEL_PAGES, first.pages - p + 1) }, (_, i) => list(p + i));
        for (const res of await Promise.all(batch)) pages.push(res.list);
    }

    // "available" in Portaus also lists wines whose stock is fully reserved; only keep what can
    // actually be added to an order.
    const products = pages.flat().filter((p) => p?.id && p?.puid && Number(p?.quantity?.inStock) > 0);
    return { products, count: first.count };
}

export const GET: RequestHandler = async ({ request, url }) => {
    const auth = request.headers.get('authorization') ?? '';
    if (!(dev || (env['CRON_SECRET'] && auth === `Bearer ${env['CRON_SECRET']}`))) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const started = Date.now();
    const now = new Date(started).toISOString();
    const dry = Boolean(url.searchParams.get('dry'));

    try {
        const { products, count } = await fetchAvailableProducts();
        if (!products.length) {
            // An empty answer is far more likely a Portaus hiccup than an empty cellar; unpublishing
            // the whole site on it would be the wrong call.
            return json(
                { error: 'NoProducts', message: 'Portaus returned no wine in stock; nothing written' },
                { status: 502 }
            );
        }

        const supabase = createServiceClient();
        const db = () => supabase.schema('cms_saq');

        // Existing Ward rows by alcohol_id, and every slug in the table (any organization) so a
        // new one never collides with a page that already exists.
        type Row = {
            id: number;
            alcohol_id: number;
            organization_id: number | null;
            published: boolean | null;
            slug: string | null;
        };
        const existing = new Map<number, Row>();
        const taken = new Map<string, number>();
        for (let from = 0; ; from += READ_PAGE) {
            const { data, error } = await db()
                .from('alcohol_website')
                .select('id, alcohol_id, organization_id, published, slug')
                .order('id')
                .range(from, from + READ_PAGE - 1);
            if (error) throw new Error(`could not read alcohol_website: ${error.message}`);
            for (const row of (data ?? []) as Row[]) {
                if (row.slug && !taken.has(row.slug)) taken.set(row.slug, row.alcohol_id);
                if (row.organization_id === ORGANIZATION_ID && !existing.has(row.alcohol_id))
                    existing.set(row.alcohol_id, row);
            }
            if (!data || data.length < READ_PAGE) break;
        }
        const allocate = slugAllocator(taken);
        const slugs = new Map<number, string>();
        let slugsGenerated = 0;
        for (const p of products) {
            const fromPortaus = slugify(str(p.slug));
            const current = existing.get(p.id)?.slug ?? null;
            if (!fromPortaus && !current) slugsGenerated += 1;
            slugs.set(p.id, allocate(p.id, fromPortaus, current, slugify(str(p.cmsName) || str(p.name))));
        }

        // A new row needs its cms_saq.alcohol parent (foreign key); create the ones that are missing.
        const newProducts = products.filter((p) => !existing.has(p.id));
        const parents = new Set<number>();
        if (newProducts.length) {
            const { data, error } = await db()
                .from('alcohol')
                .select('id')
                .in(
                    'id',
                    newProducts.map((p) => p.id)
                );
            if (error) throw new Error(`could not read alcohol: ${error.message}`);
            for (const row of data ?? []) parents.add(row.id);
        }

        const updates = products
            .filter((p) => existing.has(p.id))
            .map((p) => ({ id: existing.get(p.id)!.id, ...websiteFields(p, now, slugs.get(p.id)!) }));
        const inserts = newProducts.map((p) => websiteFields(p, now, slugs.get(p.id)!));
        const newAlcohol = newProducts.filter((p) => !parents.has(p.id)).map((p) => alcoholFields(p, slugs.get(p.id)!));

        const inStock = new Set(products.map((p) => p.id as number));
        const toUnpublish = [...existing.entries()].filter(
            ([alcoholId, row]) => !inStock.has(alcoholId) && row.published !== false
        );

        const summary = {
            portausAvailable: count,
            inStock: products.length,
            updated: updates.length,
            inserted: inserts.length,
            alcoholCreated: newAlcohol.length,
            unpublished: toUnpublish.length,
            slugsGenerated,
            slugsChanged: updates.filter((u) => u.slug !== existing.get(u.alcohol_id)!.slug).length,
            newWines: newProducts.map((p) => ({ portausId: p.id, name: str(p.cmsName) || str(p.name) }))
        };

        if (dry) return json({ dry: true, ...summary, sample: updates.slice(0, 2), ms: Date.now() - started });

        const updated = await upsertChunked(supabase, 'cms_saq', 'alcohol_website', updates);

        let alcoholCreated = 0;
        const insertFailed: Array<{ alcohol_id: unknown; error: string }> = [];
        for (const row of newAlcohol) {
            const { error } = await db().from('alcohol').insert(row);
            if (error) insertFailed.push({ alcohol_id: row.id, error: `alcohol: ${error.message}` });
            else alcoholCreated += 1;
        }

        let inserted = 0;
        for (const row of inserts) {
            const { error } = await db().from('alcohol_website').insert(row);
            if (error) insertFailed.push({ alcohol_id: row.alcohol_id, error: error.message });
            else inserted += 1;
        }

        const unpublishIds = toUnpublish.map(([, row]) => row.id);
        let unpublished = 0;
        for (let i = 0; i < unpublishIds.length; i += 200) {
            const { data, error } = await db()
                .from('alcohol_website')
                .update({ published: false, updated_at: now })
                .in('id', unpublishIds.slice(i, i + 200))
                .select('id');
            if (error) console.error('sync/website: could not unpublish', error);
            unpublished += data?.length ?? 0;
        }

        const failed = [...updated.failed, ...insertFailed];
        if (failed.length) console.error('sync/website: failed rows', JSON.stringify(failed, null, 1));

        return json({
            ok: failed.length === 0,
            ...summary,
            updated: updated.ok,
            inserted,
            alcoholCreated,
            unpublished,
            failed,
            ms: Date.now() - started
        });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('sync/website: Portaus error', e.status, e.path, e.body);
            return json({ error: 'PortausError', message: e.detail, status: e.status }, { status: 502 });
        }
        console.error('sync/website failed', e);
        return json({ error: 'SyncFailed', message: (e as Error).message }, { status: 500 });
    }
};

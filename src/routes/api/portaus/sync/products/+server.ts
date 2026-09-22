// GET /api/portaus/sync/products  — cron job
//
// Pulls the "Importation privée" inventory from the Portaus admin API and upserts products into
// cms_saq.alcohol and their items (lots) into cms_saq.alcohol_batches. Same field mapping as the
// enosis ptransfer processProduct / processWineBatches, so the shop keeps reading the same shape.
//
// Auth: `Authorization: Bearer <CRON_SECRET>` (what Vercel cron sends), or dev mode.
// Query: ?page=N syncs one page (50 products); ?limit=N per page.

import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { INVENTORY_ID, PortausError, portausRequest } from '$lib/server/portausAdmin';
import { createServiceClient, upsertChunked } from '$lib/server/supabase';

const ORGANIZATION_ID = 2;
const PAGE_SIZE = 50;
const PARALLEL_PAGES = 4;
/** Portaus keeps a lot sellable for 210 days after its availability date. */
const SELL_BEFORE_DAYS = 210;

type ProductsPage = { list: any[]; count: number; pages: number; page: number };

function str(v: unknown): string | null {
    if (typeof v === 'string') return v.trim() || null;
    if (typeof v === 'number') return String(v);
    return null;
}

function num(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).match(/[\d.]+/)?.[0] ?? '');
    return Number.isFinite(n) ? n : null;
}

function mapProduct(p: any) {
    return {
        id: p.id,
        uuid: p.puid ?? null,
        is_archived: p.active === false,
        sku: str(p.sku),
        ean: str(p.ean),
        upc: str(p.upc),
        isbn: str(p.isbn),
        mpn: str(p.mpn),
        weight: p.weight ?? null,
        length: p.length ?? null,
        width: p.width ?? null,
        height: p.height ?? null,
        volume: p.volume ?? null,
        name: str(p.name) ?? '',
        extended_name: str(p.extendedName) ?? '',
        short_description: str(p.shortDescription) ?? '',
        internal_notes: str(p.description) ?? '',
        format: p.format ?? null,
        agency_fee_is_percentage: p.agencyRate ? true : p.agencyFee ? false : null,
        agency_fee_percentage: p.agencyRate ?? null,
        agency_fee_net: p.agencyFee ?? null,
        uvc: p.uvc ?? null,
        category: p.category?.id ?? null,
        specific_category: p.specificCategory?.id ?? null,
        provider_id: p.provider?.id ?? null,
        unit: p.unit ?? null,
        tags: (p.tags ?? []).map((t: any) => str(t.code)).filter(Boolean),
        saq_id: p.items?.[0]?.reference ? String(p.items[0].reference).split('-')[0] : null,
        slug: p.slug ?? null,
        organization_id: ORGANIZATION_ID
    };
}

function mapItem(item: any, productId: number) {
    const availability = item.availabilityDate ? new Date(item.availabilityDate) : null;
    return {
        id: item.id,
        created_at: item.createdAt ?? null,
        updated_at: item.updatedAt ?? null,
        is_archived: item.active === false,
        alcohol_id: productId,
        alcohol_order_id: item.purchaseOrder?.id ?? null,
        description: str(item.description),
        saq_arrival_lot_number: str(item.reference),
        vintage:
            num(item.extraInfo?.vintage ?? item.vintage) == null
                ? null
                : Math.trunc(num(item.extraInfo?.vintage ?? item.vintage)!),
        alcohol_percentage: num(item.extraInfo?.alcohol),
        quantity: item.quantity?.total ?? item.qty ?? null,
        transfer_quantity: item.quantity?.onHand ?? null,
        release_date: availability?.toISOString() ?? null,
        sell_before_date: item.sellBefore
            ? new Date(item.sellBefore).toISOString()
            : availability
              ? new Date(availability.getTime() + SELL_BEFORE_DAYS * 24 * 60 * 60 * 1000).toISOString()
              : null,
        price: num(item.price),
        price_tax_in: num(item.priceTaxIn),
        purchase_unit_price: num(item.purchaseUnitPrice),
        is_published: item.indCmsOnline ?? null,
        organization_id: ORGANIZATION_ID
    };
}

export const GET: RequestHandler = async ({ request, url }) => {
    const auth = request.headers.get('authorization') ?? '';
    if (!(dev || (env['CRON_SECRET'] && auth === `Bearer ${env['CRON_SECRET']}`))) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onlyPage = Number(url.searchParams.get('page')) || null;
    const limit = Number(url.searchParams.get('limit')) || PAGE_SIZE;
    const started = Date.now();

    try {
        const list = (page: number) =>
            portausRequest<ProductsPage>('GET', `/API/latest/admin/inventories/${INVENTORY_ID}/products`, {
                query: { limit, page, orderBy: 'age' }
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

        const products: Record<string, unknown>[] = [];
        const batches: Record<string, unknown>[] = [];
        for (const page of pages) {
            for (const p of page) {
                products.push(mapProduct(p));
                for (const item of p.items ?? []) batches.push(mapItem(item, p.id));
            }
        }

        // ?dry=1 maps everything but writes nothing; returns the first rows for inspection.
        if (url.searchParams.get('dry')) {
            return json({
                dry: true,
                products: first.count,
                pages: onlyPage ? 1 : first.pages,
                batches: batches.length,
                sample: { alcohol: products.slice(0, 2), alcohol_batches: batches.slice(0, 2) }
            });
        }

        const supabase = createServiceClient();
        const result = {
            alcohol: await upsertChunked(supabase, 'cms_saq', 'alcohol', products),
            alcohol_batches: await upsertChunked(supabase, 'cms_saq', 'alcohol_batches', batches)
        };
        const failed = result.alcohol.failed.length + result.alcohol_batches.failed.length;
        if (failed) console.error('sync/products: failed rows', JSON.stringify(result, null, 1));

        return json({
            ok: failed === 0,
            products: first.count,
            pages: onlyPage ? 1 : first.pages,
            batches: batches.length,
            ms: Date.now() - started,
            result
        });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('sync/products: Portaus error', e.status, e.path, e.body);
            return json({ error: 'PortausError', message: e.detail, status: e.status }, { status: 502 });
        }
        console.error('sync/products failed', e);
        return json({ error: 'SyncFailed', message: (e as Error).message }, { status: 500 });
    }
};

// GET /download-pdf/liste-des-vins — the wine list as a PDF file, straight to the download.
//
// Same filters as /vins (the button passes its query string along) plus `mode=resto|perso`, since
// the Resto/Perso toggle lives in the visitor's tab and does not reach the server on its own.
// Only wines that can be ordered (at least one full case) are listed: a printed price list has
// no "Non dispo" badge, so a sold-out wine there would just read as available.

import type { RequestHandler } from '@sveltejs/kit';
import { fetchFilteredProductsForAlcohol } from '../../vins/Filters/utils';
import { countries } from '../../vins/Filters/types';
import { parseFiltersFromUrl } from '../../vins/utils';
import { getCategory } from '../../vin/[slug]/utils';
import { buildWineListPdf, type WineListRow } from '$lib/server/pdf/winelist';

const MAX_WINES = 1000;

/**
 * The Riposte TTFs, base64, fetched once per server instance from /fonts (the static folder).
 * Static files are not part of the server bundle on Vercel, so they are fetched over HTTP
 * rather than read from disk; a failure is not cached, so the next request retries.
 */
let fonts: Promise<{ regular: string; bold: string }> | null = null;
function loadFonts(fetch: typeof globalThis.fetch) {
    const get = async (file: string) => {
        const res = await fetch(`/fonts/${file}`);
        if (!res.ok) throw new Error(`font ${file}: HTTP ${res.status}`);
        return Buffer.from(await res.arrayBuffer()).toString('base64');
    };
    fonts ??= Promise.all([get('Riposte-Regular.ttf'), get('Riposte-Bold.ttf')])
        .then(([regular, bold]) => ({ regular, bold }))
        .catch((e) => {
            fonts = null;
            throw e;
        });
    return fonts;
}

function countryName(id: number | null | undefined): string {
    const country = countries.find((c) => c.id === id);
    return country?.name?.fr ?? '';
}

function capitalize(s: string): string {
    return s ? s[0]!.toUpperCase() + s.slice(1) : s;
}

function toRow(p: any, mode: 'resto' | 'perso'): WineListRow {
    // Portaus charges a flat fee per bottle on top of either price, as the site displays it.
    const base = mode === 'resto' ? Number(p.oldest_price) || 0 : Number(p.oldest_price_tax_in) || 0;
    const bottle = base + (Number(p.oldest_agency_fee) || 0);
    const uvc = Number(p.uvc) || 1;
    return {
        region: p.region_name?.trim() || countryName(p.country_id),
        producer: p.provider_display_name ?? '',
        name: p.name ?? '',
        vintage: p.oldest_vintage ? String(p.oldest_vintage) : '',
        type: capitalize(getCategory(p)),
        format: `${p.uvc} x ${p.volume}`,
        bottle,
        case: uvc > 1 ? bottle * uvc : null
    };
}

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
    const mode = url.searchParams.get('mode') === 'perso' ? 'perso' : 'resto';
    const filters = parseFiltersFromUrl(url);

    const { data, error } = await fetchFilteredProductsForAlcohol(locals.supabase, filters, {
        limit: MAX_WINES,
        offset: 0,
        sorting: filters.sorting
    });
    if (error) {
        console.error('liste-des-vins: could not load wines', error);
        return new Response('La liste des vins est momentanément indisponible.', { status: 503 });
    }

    const orderable = (data ?? []).filter((p: any) => Number(p.uvc) > 0 && Number(p.total_quantity) >= Number(p.uvc));
    const generatedAt = new Date();
    const filtered = [...url.searchParams.keys()].some((k) => k !== 'mode' && k !== 's');

    let pdf: ArrayBuffer;
    try {
        pdf = buildWineListPdf({
            rows: orderable.map((p) => toRow(p, mode)),
            mode,
            generatedAt,
            filtered,
            fonts: await loadFonts(fetch)
        });
    } catch (e) {
        console.error('liste-des-vins: could not build the PDF', e);
        return new Response('La liste des vins est momentanément indisponible.', { status: 503 });
    }

    const day = generatedAt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
    const filename = `Ward-et-Associes-liste-des-vins-prix-${mode}-${day}.pdf`;
    return new Response(pdf, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            // Prices and stock change with every sync.
            'Cache-Control': 'no-store'
        }
    });
};

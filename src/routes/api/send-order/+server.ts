// src/routes/api/send-order/+server.ts
//
// The cart's only ordering path, perso and resto alike. Nothing is ordered in Portaus and nothing
// is charged: the cart is re-priced from cms_saq.portaus_wines and emailed to the team (MAIL_TO),
// who key the order into Portaus by hand and contact the customer.
//
// Nothing priced by the browser is trusted. The wine ids are the only thing the client is
// believed about; names, formats, prices, fees and stock are read back from the catalogue, so
// the mail always reflects what was synced rather than a stale or tampered cart.
//
// Body: { type: 'perso' | 'resto', items: [{ portaus_id, caseQuantity }], customer: {...} }
// Answers { ok: true, reference } — the reference is what /success shows the customer.

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { sendMail } from '$lib/server/mail';

const ORGANIZATION_ID = 2;

/** Values of the "Pour la cueillette" select on the resto cart. */
const RESTO_DELIVERY_TYPES: Record<number, string> = {
    0: "Livraison à l'établissement",
    3: 'Livraison en succursale'
};

type OrderType = 'perso' | 'resto';

type IncomingItem = {
    /** cms_saq.portaus_wines.portaus_id — the Portaus product id the cart stores as item.id */
    portaus_id: number | string;
    /** number of cases, exactly as the cart counts them */
    caseQuantity: number | string;
};

type IncomingCustomer = {
    /** resto only: 0 = establishment delivery, 3 = SAQ branch */
    resto_delivery_type?: number | string | null;
    /** 8-digit SAQ customer number: required for a resto, optional for a perso */
    saq_number?: string | null;
    /** resto only: establishment name */
    company_name?: string | null;
    /** cms_saq.saq_branches.id: always for a perso, for a resto only with branch delivery */
    saq_branch_id?: number | string | null;
    newsletter?: boolean;
    billing_address: { street: string; city: string; postal_code: string };
    billing_contact: { first_name: string; last_name: string; email: string; phone: string };
};

type OrderLine = {
    portausId: number;
    name: string;
    producer: string;
    vintage: string;
    format: string;
    cases: number;
    bottles: number;
    unitPrice: number | null;
    lineTotal: number | null;
    agencyFee: number | null;
    saqCode: string;
    sku: string;
    stockBottles: number;
    shortStock: boolean;
};

function toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function esc(v: unknown): string {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' });

function price(v: number | null): string {
    return v == null ? '—' : money.format(v);
}

/**
 * A short human reference so the team and the customer can talk about the same request.
 * Nothing depends on it being unique across time — it only has to be quotable in a reply.
 */
function orderReference(type: OrderType, now: Date): string {
    const day = now
        .toLocaleDateString('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${type.toUpperCase()}-${day}-${suffix}`;
}

function bad(error: string, message: string, status = 400) {
    return json({ error, message }, { status });
}

export const POST: RequestHandler = async ({ request, locals }) => {
    let payload: { type?: OrderType; items?: IncomingItem[]; customer?: IncomingCustomer };
    try {
        payload = await request.json();
    } catch {
        return bad('InvalidJson', 'Body is not valid JSON');
    }

    const type = payload.type;
    if (type !== 'perso' && type !== 'resto') return bad('InvalidType', "type must be 'perso' or 'resto'");

    const items = (payload.items ?? []).filter((i) => toInt(i.caseQuantity) > 0);
    const customer = payload.customer;

    if (!items.length) return bad('EmptyCart', 'No items to order');
    if (!customer?.billing_contact || !customer?.billing_address) {
        return bad('MissingCustomer', 'billing_contact and billing_address are required');
    }

    const deliveryType = type === 'resto' ? toInt(customer.resto_delivery_type) : 3;
    const branchId = toInt(customer.saq_branch_id);
    if (deliveryType === 3 && !branchId) return bad('MissingBranch', 'A branch pickup needs a saq_branch_id');
    if (type === 'resto') {
        if (!customer.saq_number?.trim()) return bad('MissingSaqNumber', 'A resto order needs its SAQ number');
        if (!customer.company_name?.trim()) return bad('MissingCompany', 'A resto order needs the establishment name');
    }

    // ---- 1. re-read every cart line from the catalogue -----------------------------------------
    if (items.some((i) => toInt(i.portaus_id) <= 0)) {
        return bad('StaleCart', 'Every cart item needs a portaus_id; please refresh the page');
    }
    const portausIds = items.map((i) => toInt(i.portaus_id));

    const { data: catalogue, error: lookupError } = await locals.supabase
        .schema('cms_saq')
        .from('portaus_wines')
        .select(
            `portaus_id, name, sku, saq_code, producer, vintage, uvc, volume,
             price, price_tax_in, agency_fee, available_bottles`
        )
        .in('portaus_id', portausIds)
        .eq('organization_id', ORGANIZATION_ID);

    if (lookupError) {
        console.error('send-order: portaus_wines lookup failed', lookupError);
        return bad('LookupFailed', 'Could not resolve cart items', 500);
    }

    const byId = new Map((catalogue ?? []).map((w: any) => [Number(w.portaus_id), w]));

    const missing = portausIds.filter((id) => !byId.has(id));
    if (missing.length) {
        return json(
            { error: 'UnknownWines', message: 'Some wines are no longer offered', portausIds: missing },
            { status: 409 }
        );
    }

    const lines: OrderLine[] = items.map((item) => {
        const wine: any = byId.get(toInt(item.portaus_id));
        const uvc = toInt(wine.uvc) > 0 ? toInt(wine.uvc) : 1;
        const cases = toInt(item.caseQuantity);
        const bottles = cases * uvc;
        // A resto pays the pre-tax bottle price; a perso the consumer price, taxes in.
        const raw = type === 'resto' ? wine.price : wine.price_tax_in;
        const unitPrice = raw == null ? null : Number(raw);
        const stockBottles = toInt(wine.available_bottles);

        return {
            portausId: Number(wine.portaus_id),
            name: wine.name ?? '(sans nom)',
            producer: wine.producer ?? '—',
            vintage: wine.vintage ? String(wine.vintage) : '—',
            format: `${uvc} × ${wine.volume ?? '?'} ml`,
            cases,
            bottles,
            unitPrice,
            lineTotal: unitPrice == null ? null : unitPrice * bottles,
            agencyFee: wine.agency_fee == null ? null : Number(wine.agency_fee),
            saqCode: wine.saq_code ?? '—',
            sku: wine.sku ?? '—',
            stockBottles,
            shortStock: bottles > stockBottles
        };
    });

    const totalCases = lines.reduce((acc, l) => acc + l.cases, 0);
    const totalBottles = lines.reduce((acc, l) => acc + l.bottles, 0);
    const subtotal = lines.reduce((acc, l) => acc + (l.lineTotal ?? 0), 0);
    const agencyFeeTotal = lines.reduce((acc, l) => acc + (l.agencyFee ?? 0) * l.bottles, 0);
    // The cart's "Total": bottle price plus agency fee, per bottle, across the order.
    const total = subtotal + agencyFeeTotal;
    const incomplete = lines.some((l) => l.unitPrice == null || l.agencyFee == null);
    const priceLabel = type === 'resto' ? 'Prix resto / bt (avant taxes)' : 'Prix / bt (taxes incluses)';

    // ---- 2. compose ---------------------------------------------------------------------------
    const contact = customer.billing_contact;
    const address = customer.billing_address;
    const fullName = `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() || '(sans nom)';
    const typeLabel = type === 'resto' ? 'restaurant' : 'particulier';

    // Branch pickup needs the branch named, or the team cannot action the request.
    let branchLabel = '—';
    if (deliveryType === 3) {
        const { data: branch } = await locals.supabase
            .schema('cms_saq')
            .from('saq_branches')
            .select('number, city, address')
            .eq('id', branchId)
            .maybeSingle();
        branchLabel = branch
            ? [branch.number, branch.address, branch.city].filter(Boolean).join(' — ')
            : `introuvable (#${branchId})`;
    }

    const deliveryLabel =
        type === 'perso' ? 'Cueillette en succursale' : (RESTO_DELIVERY_TYPES[deliveryType] ?? `Type ${deliveryType}`);
    const now = new Date();
    const reference = orderReference(type, now);
    const placedAt = now.toLocaleString('fr-CA', {
        timeZone: 'America/Toronto',
        dateStyle: 'long',
        timeStyle: 'short'
    });

    const who = type === 'resto' ? customer.company_name!.trim() : fullName;
    const subject = `Commande ${type} ${reference} — ${who} — ${totalCases} caisse${totalCases > 1 ? 's' : ''} — ${money.format(total)}`;

    const detailRows: [string, string][] = [
        ['Référence', reference],
        ['Type', type === 'resto' ? 'Restaurant' : 'Particulier'],
        ['Reçue le', placedAt],
        ...(type === 'resto' ? ([['Établissement', customer.company_name!.trim()]] as [string, string][]) : []),
        ['Contact', fullName],
        ['Courriel', contact.email ?? '—'],
        ['Téléphone', contact.phone ?? '—'],
        ['No de SAQ', customer.saq_number?.trim() || '—'],
        ['Livraison', deliveryLabel],
        ['Succursale', branchLabel],
        ['Adresse', [address.street, address.city, address.postal_code].filter(Boolean).join(', ') || '—'],
        ['Infolettre', customer.newsletter ? 'Oui' : 'Non']
    ];

    const totalRows: [string, string][] = [
        ['Vins', `${totalCases} caisse(s), ${totalBottles} bouteille(s)`],
        [`Sous-total (${type === 'resto' ? 'prix resto, avant taxes' : 'taxes incluses'})`, money.format(subtotal)],
        ['Frais d’agence (avant taxes)', money.format(agencyFeeTotal)],
        ['Total (comme affiché au panier)', money.format(total)]
    ];

    const text = [
        `Nouvelle commande ${typeLabel.toUpperCase()} — ${reference}`,
        'Aucun paiement n’a été pris et aucune commande n’a été créée dans Portaus — à saisir manuellement.',
        '',
        ...detailRows.map(([label, value]) => `${label}: ${value}`),
        '',
        'Vins :',
        ...lines.map(
            (l) =>
                `- ${l.name} — ${l.producer} — ${l.vintage} — ${l.format}\n` +
                `  ${l.cases} caisse(s) = ${l.bottles} bouteille(s) @ ${price(l.unitPrice)} = ${price(l.lineTotal)}\n` +
                `  produit #${l.portausId} · code SAQ ${l.saqCode} · SKU ${l.sku} · frais d’agence ${price(l.agencyFee)} / bt · stock ${l.stockBottles} bouteille(s)${l.shortStock ? ' — STOCK INSUFFISANT' : ''}`
        ),
        '',
        ...totalRows.map(([label, value]) => `${label}: ${value}`),
        ...(incomplete ? ['', 'ATTENTION : certaines lignes n’ont pas de prix ou de frais d’agence en base.'] : [])
    ].join('\n');

    const cell = 'padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:13px;';
    const head =
        'padding:6px 10px;border-bottom:2px solid #333;font-size:12px;text-align:left;text-transform:uppercase;';
    const row = ([label, value]: [string, string]) =>
        `<tr><td style="${cell}color:#666;white-space:nowrap">${esc(label)}</td><td style="${cell}"><strong>${esc(value)}</strong></td></tr>`;

    const html = `
<div style="font-family:Helvetica,Arial,sans-serif;color:#111;background:#ffffff;padding:24px;max-width:1000px">
    <h2 style="margin:0 0 4px">Nouvelle commande — ${typeLabel}</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px">
        Référence <strong>${esc(reference)}</strong>. Aucun paiement n’a été pris et aucune commande n’a été
        créée dans Portaus — à saisir manuellement.
    </p>

    <table style="border-collapse:collapse;margin-bottom:24px">${detailRows.map(row).join('')}</table>

    <table style="border-collapse:collapse;width:100%">
        <thead>
            <tr>
                <th style="${head}">Vin</th>
                <th style="${head}">Producteur</th>
                <th style="${head}">Millésime</th>
                <th style="${head}">Format</th>
                <th style="${head}">Caisses</th>
                <th style="${head}">Bouteilles</th>
                <th style="${head}">${esc(priceLabel)}</th>
                <th style="${head}">Total</th>
                <th style="${head}">Frais d’agence / bt</th>
                <th style="${head}">Produit / SAQ / SKU</th>
                <th style="${head}">Stock</th>
            </tr>
        </thead>
        <tbody>
            ${lines
                .map(
                    (l) => `<tr>
                <td style="${cell}"><strong>${esc(l.name)}</strong></td>
                <td style="${cell}">${esc(l.producer)}</td>
                <td style="${cell}">${esc(l.vintage)}</td>
                <td style="${cell}">${esc(l.format)}</td>
                <td style="${cell}">${l.cases}</td>
                <td style="${cell}">${l.bottles}</td>
                <td style="${cell}">${esc(price(l.unitPrice))}</td>
                <td style="${cell}">${esc(price(l.lineTotal))}</td>
                <td style="${cell}">${esc(price(l.agencyFee))}</td>
                <td style="${cell}color:#666">#${l.portausId} · ${esc(l.saqCode)} · ${esc(l.sku)}</td>
                <td style="${cell}${l.shortStock ? 'color:#de350b;font-weight:bold' : ''}">${l.stockBottles}${l.shortStock ? ' ⚠' : ''}</td>
            </tr>`
                )
                .join('')}
        </tbody>
    </table>

    <table style="border-collapse:collapse;margin-top:16px">${totalRows.map(row).join('')}</table>

    ${incomplete ? '<p style="margin:12px 0 0;color:#de350b;font-size:12px"><strong>Certaines lignes n’ont pas de prix ou de frais d’agence en base — à vérifier.</strong></p>' : ''}
    <p style="margin:12px 0 0;color:#666;font-size:12px">
        Répondre à ce courriel écrit directement au client (${esc(contact.email ?? '')}).
    </p>
</div>`;

    // ---- 3. send ------------------------------------------------------------------------------
    try {
        await sendMail({ subject, text, html, replyTo: contact.email || undefined });
    } catch (e) {
        console.error('send-order: mail delivery failed', e);
        return bad('MailFailed', 'Could not send the order email', 502);
    }

    return json({ ok: true, reference });
};

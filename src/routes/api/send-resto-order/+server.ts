// src/routes/api/send-resto-order/+server.ts
//
// Ordering path for restaurants. Restos do not pay the agency fee online on this branch, so
// this route skips Portaus and Stripe entirely: it re-prices the cart from cms_saq.portaus_wines
// and emails the request to the team, who key the order into Portaus by hand.
//
// Nothing priced by the browser is trusted. The wine ids are the only thing the client is
// believed about; names, formats, prices, fees and stock are read back from the catalogue, so
// the mail always reflects what was synced rather than a stale or tampered cart.

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { sendMail } from '$lib/server/mail';

const ORGANIZATION_ID = 2;

/** Values of the "Pour la cueillette" select on the resto cart. */
const DELIVERY_TYPES: Record<number, string> = {
    0: "Livraison à l'établissement",
    3: 'Livraison en succursale'
};

type IncomingItem = {
    /** cms_saq.portaus_wines.portaus_id — the Portaus product id the cart stores as item.id */
    portaus_id: number | string;
    /** number of cases, exactly as the cart counts them */
    caseQuantity: number | string;
};

type IncomingCustomer = {
    resto_delivery_type?: number | string | null;
    saq_number?: string | null;
    /** establishment name, as typed in the cart */
    company_name?: string | null;
    /** cms_saq.saq_branches.id, only when the resto chose branch delivery */
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
    uvc: number;
    cases: number;
    bottles: number;
    unitPrice: number | null;
    lineTotal: number | null;
    agencyFee: string;
    saqCode: string;
    sku: string;
    puid: string;
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
function orderReference(now: Date): string {
    const day = now
        .toLocaleDateString('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `RESTO-${day}-${suffix}`;
}

/** Portaus prices the agency fee as a flat amount per bottle, identical for resto and perso. */
function agencyFeeLabel(wine: any): string {
    const fee = wine.agency_fee == null ? null : Number(wine.agency_fee);
    return fee == null ? 'n/d' : `${money.format(fee)} / bouteille`;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    let payload: { items?: IncomingItem[]; customer?: IncomingCustomer };
    try {
        payload = await request.json();
    } catch {
        return json({ error: 'InvalidJson', message: 'Body is not valid JSON' }, { status: 400 });
    }

    const items = (payload.items ?? []).filter((i) => toInt(i.caseQuantity) > 0);
    const customer = payload.customer;

    if (!items.length) return json({ error: 'EmptyCart', message: 'No items to order' }, { status: 400 });
    if (!customer?.billing_contact || !customer?.billing_address) {
        return json(
            { error: 'MissingCustomer', message: 'billing_contact and billing_address are required' },
            { status: 400 }
        );
    }

    // ---- 1. re-read every cart line from the catalogue -----------------------------------------
    if (items.some((i) => toInt(i.portaus_id) <= 0)) {
        return json(
            { error: 'StaleCart', message: 'Every cart item needs a portaus_id; please refresh the page' },
            { status: 400 }
        );
    }
    const portausIds = items.map((i) => toInt(i.portaus_id));

    const { data: catalogue, error: lookupError } = await locals.supabase
        .schema('cms_saq')
        .from('portaus_wines')
        .select(
            `portaus_id, puid, name, sku, saq_code, producer, vintage, uvc, volume,
             price, price_tax_in, agency_fee, available_bottles`
        )
        .in('portaus_id', portausIds)
        .eq('organization_id', ORGANIZATION_ID);

    if (lookupError) {
        console.error('send-resto-order: portaus_wines lookup failed', lookupError);
        return json({ error: 'LookupFailed', message: 'Could not resolve cart items' }, { status: 500 });
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
        // Resto price is the pre-tax bottle price; price_tax_in is the consumer one.
        const unitPrice = wine.price == null ? null : Number(wine.price);
        const stockBottles = toInt(wine.available_bottles);

        return {
            portausId: Number(wine.portaus_id),
            name: wine.name ?? '(sans nom)',
            producer: wine.producer ?? '—',
            vintage: wine.vintage ? String(wine.vintage) : '—',
            format: `${uvc} × ${wine.volume ?? '?'} ml`,
            uvc,
            cases,
            bottles,
            unitPrice,
            lineTotal: unitPrice == null ? null : unitPrice * bottles,
            agencyFee: agencyFeeLabel(wine),
            saqCode: wine.saq_code ?? '—',
            sku: wine.sku ?? '—',
            puid: wine.puid ?? '—',
            stockBottles,
            shortStock: bottles > stockBottles
        };
    });

    const totalCases = lines.reduce((acc, l) => acc + l.cases, 0);
    const totalBottles = lines.reduce((acc, l) => acc + l.bottles, 0);
    const subtotal = lines.reduce((acc, l) => acc + (l.lineTotal ?? 0), 0);
    const incomplete = lines.some((l) => l.unitPrice == null);

    // ---- 2. compose ---------------------------------------------------------------------------
    const contact = customer.billing_contact;
    const address = customer.billing_address;
    const fullName = `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() || '(sans nom)';
    const deliveryType = customer.resto_delivery_type == null ? null : toInt(customer.resto_delivery_type);
    // Branch delivery needs the branch named, or the team cannot action the request.
    let branchLabel = '—';
    const branchId = toInt(customer.saq_branch_id);
    if (branchId) {
        const { data: branch } = await locals.supabase
            .schema('cms_saq')
            .from('saq_branches')
            .select('number, city, address')
            .eq('id', branchId)
            .single();
        branchLabel = branch
            ? [branch.number, branch.address, branch.city].filter(Boolean).join(' — ')
            : `introuvable (#${branchId})`;
    }

    const deliveryLabel =
        deliveryType == null ? 'Non précisé' : (DELIVERY_TYPES[deliveryType] ?? `Type ${deliveryType}`);
    const now = new Date();
    const reference = orderReference(now);
    const placedAt = now.toLocaleString('fr-CA', {
        timeZone: 'America/Toronto',
        dateStyle: 'long',
        timeStyle: 'short'
    });

    const subject = `Commande resto ${reference} — ${fullName} — ${totalCases} caisse${totalCases > 1 ? 's' : ''} — ${money.format(subtotal)}`;

    const detailRows: [string, string][] = [
        ['Référence', reference],
        ['Reçue le', placedAt],
        ['Établissement', customer.company_name?.trim() || '—'],
        ['Contact', fullName],
        ['Courriel', contact.email ?? '—'],
        ['Téléphone', contact.phone ?? '—'],
        ['No de SAQ', customer.saq_number || '—'],
        ['Livraison', deliveryLabel],
        ['Succursale', branchLabel],
        ['Adresse', [address.street, address.city, address.postal_code].filter(Boolean).join(', ') || '—'],
        ['Infolettre', customer.newsletter ? 'Oui' : 'Non']
    ];

    const text = [
        `Nouvelle demande de commande RESTAURANT — ${reference}`,
        'Aucun paiement n’a été pris et aucune commande n’a été créée dans Portaus.',
        '',
        ...detailRows.map(([label, value]) => `${label}: ${value}`),
        '',
        'Commande (prix resto, hors frais d’agence et taxes) :',
        ...lines.map(
            (l) =>
                `- ${l.name} — ${l.producer} — ${l.vintage} — ${l.format}\n` +
                `  ${l.cases} caisse(s) = ${l.bottles} bouteille(s) @ ${price(l.unitPrice)} = ${price(l.lineTotal)}\n` +
                `  produit #${l.portausId} · code SAQ ${l.saqCode} · SKU ${l.sku} · puid ${l.puid} · frais d’agence ${l.agencyFee} · stock ${l.stockBottles} bouteille(s)${l.shortStock ? ' — STOCK INSUFFISANT' : ''}`
        ),
        '',
        `Total: ${totalCases} caisse(s), ${totalBottles} bouteille(s) — ${money.format(subtotal)}`,
        'Sous-total au prix resto, frais d’agence et taxes non inclus.'
    ].join('\n');

    const cell = 'padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:13px;';
    const head =
        'padding:6px 10px;border-bottom:2px solid #333;font-size:12px;text-align:left;text-transform:uppercase;';

    const html = `
<div style="font-family:Helvetica,Arial,sans-serif;color:#111;background:#ffffff;padding:24px;max-width:1000px">
    <h2 style="margin:0 0 4px">Nouvelle demande de commande — restaurant</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px">
        Référence <strong>${esc(reference)}</strong>. Aucun paiement n’a été pris et aucune commande n’a été
        créée dans Portaus — à saisir manuellement.
    </p>

    <table style="border-collapse:collapse;margin-bottom:24px">
        ${detailRows
            .map(
                ([label, value]) =>
                    `<tr><td style="${cell}color:#666;white-space:nowrap">${esc(label)}</td><td style="${cell}"><strong>${esc(value)}</strong></td></tr>`
            )
            .join('')}
    </table>

    <table style="border-collapse:collapse;width:100%">
        <thead>
            <tr>
                <th style="${head}">Vin</th>
                <th style="${head}">Producteur</th>
                <th style="${head}">Millésime</th>
                <th style="${head}">Format</th>
                <th style="${head}">Caisses</th>
                <th style="${head}">Bouteilles</th>
                <th style="${head}">Prix resto / bt</th>
                <th style="${head}">Total</th>
                <th style="${head}">Produit / SAQ / SKU</th>
                <th style="${head}">Frais d’agence</th>
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
                <td style="${cell}color:#666">#${l.portausId} · ${esc(l.saqCode)} · ${esc(l.sku)}</td>
                <td style="${cell}">${esc(l.agencyFee)}</td>
                <td style="${cell}${l.shortStock ? 'color:#de350b;font-weight:bold' : ''}">${l.stockBottles}${l.shortStock ? ' ⚠' : ''}</td>
            </tr>`
                )
                .join('')}
        </tbody>
        <tfoot>
            <tr>
                <td style="${cell}font-weight:bold" colspan="4">Total</td>
                <td style="${cell}font-weight:bold">${totalCases}</td>
                <td style="${cell}font-weight:bold">${totalBottles}</td>
                <td style="${cell}"></td>
                <td style="${cell}font-weight:bold">${esc(money.format(subtotal))}</td>
                <td style="${cell}" colspan="3"></td>
            </tr>
        </tfoot>
    </table>

    <p style="margin:12px 0 0;color:#666;font-size:12px">
        Sous-total au prix resto (hors frais d’agence et taxes).
        ${incomplete ? '<br><strong style="color:#de350b">Certaines lignes n’ont pas de prix en base — à vérifier.</strong>' : ''}
    </p>
    <p style="margin:4px 0 0;color:#666;font-size:12px">
        Répondre à ce courriel écrit directement au client (${esc(contact.email ?? '')}).
    </p>
</div>`;

    // ---- 3. send ------------------------------------------------------------------------------
    try {
        await sendMail({ subject, text, html, replyTo: contact.email || undefined });
    } catch (e) {
        console.error('send-resto-order: mail delivery failed', e);
        return json({ error: 'MailFailed', message: 'Could not send the order email' }, { status: 502 });
    }

    return json({ ok: true, reference, totalCases, totalBottles, subtotal });
};

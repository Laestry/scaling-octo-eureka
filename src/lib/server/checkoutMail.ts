// src/lib/server/checkoutMail.ts
//
// The email the team receives each time a cart checks out, perso or resto. It is sent once the
// Portaus order exists and the Stripe PaymentIntent is open, i.e. before the customer has paid:
// the mail says which order to watch, the webhook is what confirms the payment.
//
// Lines and totals come from Portaus's calculate response, not from the browser, so the mail
// matches what was actually ordered.

import type { SupabaseClient } from '@supabase/supabase-js';
import { sendMail } from './mail';
import type { CheckoutResult, WireAddress, WireContact } from './portausAdmin/checkout';
import type { CustomerSummary } from './portausAdmin/customers';
import { DELIVERY_TYPE } from './portausAdmin/reference';
import type { CalculateResponse, SalesOrder } from './portausAdmin/salesOrders';

export type CheckoutMail = {
    kind: 'perso' | 'resto';
    customer: CustomerSummary;
    customerCreated: boolean;
    order: SalesOrder;
    calculation: CalculateResponse;
    result: CheckoutResult;
    billingContact: WireContact;
    billingAddress: WireAddress;
    companyName?: string | null;
    saqNumber?: string | null;
    deliveryTypeId: number;
    saqBranchId: number | null;
};

const DELIVERY_LABELS: Record<number, string> = {
    [DELIVERY_TYPE.RESTO_BEFORE_16H]: 'Livraison restaurant < 16h',
    [DELIVERY_TYPE.RESTO_BEFORE_9H]: 'Livraison restaurant < 9h',
    [DELIVERY_TYPE.SAQ_BRANCH]: 'Livraison en succursale'
};

const money = new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' });

function esc(v: unknown): string {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function branchLabel(supabase: SupabaseClient, id: number | null): Promise<string> {
    if (!id) return '—';
    const { data } = await supabase
        .schema('cms_saq')
        .from('saq_branches')
        .select('number, city, address')
        .eq('id', id)
        .maybeSingle();
    return data ? [data.number, data.address, data.city].filter(Boolean).join(' — ') : `introuvable (#${id})`;
}

/**
 * Sends the checkout notification. Never throws: the order is already in Portaus and the
 * customer is about to pay, so a mail outage must not turn into a failed checkout.
 */
export async function sendCheckoutMail(supabase: SupabaseClient, m: CheckoutMail): Promise<void> {
    try {
        const kindLabel = m.kind === 'resto' ? 'resto' : 'perso';
        const contact = m.billingContact;
        const address = m.billingAddress;
        const fullName = `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() || m.customer.name;

        const lines = m.calculation.lines.map((l) => {
            const uvc = l.product.uvc && l.product.uvc > 0 ? l.product.uvc : 1;
            return {
                name: l.product.name,
                puid: l.product.puid ?? '—',
                bottles: l.qty,
                cases: l.qty / uvc,
                subTotal: l.subTotal,
                billable: l.billableAmount
            };
        });
        const totalBottles = lines.reduce((acc, l) => acc + l.bottles, 0);

        const placedAt = new Date().toLocaleString('fr-CA', {
            timeZone: 'America/Toronto',
            dateStyle: 'long',
            timeStyle: 'short'
        });

        const details: [string, string][] = [
            ['Commande Portaus', `${m.order.soNumber} (#${m.order.id})`],
            ['Type', kindLabel === 'resto' ? 'Restaurant' : 'Particulier'],
            ['Passée le', placedAt],
            ...(m.kind === 'resto'
                ? ([['Établissement', m.companyName?.trim() || m.customer.name]] as [string, string][])
                : []),
            ['Client Portaus', `${m.customer.name} (#${m.customer.id})${m.customerCreated ? ' — nouveau client' : ''}`],
            ['Contact', fullName],
            ['Courriel', contact.email ?? '—'],
            ['Téléphone', contact.phone ?? '—'],
            ['No de SAQ', m.saqNumber || m.customer.saqNumber || '—'],
            ['Livraison', DELIVERY_LABELS[m.deliveryTypeId] ?? `Type ${m.deliveryTypeId}`],
            ['Succursale', await branchLabel(supabase, m.saqBranchId)],
            ['Adresse', [address.street, address.city, address.postal_code].filter(Boolean).join(', ') || '—'],
            [
                'Paiement',
                m.result.paymentIntentId ? `En attente (${m.result.paymentIntentId})` : 'Aucun paiement en ligne ouvert'
            ]
        ];

        const totals: [string, string][] = [
            ['Total de la commande', money.format(m.calculation.total)],
            ['Payé en ligne (frais d’agence + taxes)', money.format(m.result.amountBillable)],
            ['Payable à la SAQ', money.format(m.calculation.totalUnbillable)]
        ];

        const subject = `Commande ${kindLabel} ${m.order.soNumber} — ${m.kind === 'resto' ? m.companyName?.trim() || fullName : fullName} — ${money.format(m.calculation.total)}`;

        const text = [
            `Nouvelle commande ${kindLabel.toUpperCase()} — ${m.order.soNumber}`,
            'Créée dans Portaus comme « Brouillon - web ». Le paiement en ligne n’est pas encore confirmé.',
            '',
            ...details.map(([label, value]) => `${label}: ${value}`),
            '',
            'Vins :',
            ...lines.map(
                (l) =>
                    `- ${l.name} (${l.puid}) — ${l.cases} caisse(s) = ${l.bottles} bouteille(s) — ${money.format(l.subTotal)}`
            ),
            '',
            `${totalBottles} bouteille(s)`,
            ...totals.map(([label, value]) => `${label}: ${value}`)
        ].join('\n');

        const cell = 'padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:13px;';
        const head =
            'padding:6px 10px;border-bottom:2px solid #333;font-size:12px;text-align:left;text-transform:uppercase;';
        const row = ([label, value]: [string, string]) =>
            `<tr><td style="${cell}color:#666;white-space:nowrap">${esc(label)}</td><td style="${cell}"><strong>${esc(value)}</strong></td></tr>`;

        const html = `
<div style="font-family:Helvetica,Arial,sans-serif;color:#111;background:#ffffff;padding:24px;max-width:900px">
    <h2 style="margin:0 0 4px">Nouvelle commande — ${m.kind === 'resto' ? 'restaurant' : 'particulier'}</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px">
        <strong>${esc(m.order.soNumber)}</strong> créée dans Portaus comme « Brouillon - web ».
        Le paiement en ligne n’est pas encore confirmé.
    </p>

    <table style="border-collapse:collapse;margin-bottom:24px">${details.map(row).join('')}</table>

    <table style="border-collapse:collapse;width:100%">
        <thead>
            <tr>
                <th style="${head}">Vin</th>
                <th style="${head}">Produit</th>
                <th style="${head}">Caisses</th>
                <th style="${head}">Bouteilles</th>
                <th style="${head}">Sous-total</th>
            </tr>
        </thead>
        <tbody>
            ${lines
                .map(
                    (l) => `<tr>
                <td style="${cell}"><strong>${esc(l.name)}</strong></td>
                <td style="${cell}color:#666">${esc(l.puid)}</td>
                <td style="${cell}">${l.cases}</td>
                <td style="${cell}">${l.bottles}</td>
                <td style="${cell}">${esc(money.format(l.subTotal))}</td>
            </tr>`
                )
                .join('')}
        </tbody>
    </table>

    <table style="border-collapse:collapse;margin-top:16px">${totals.map(row).join('')}</table>

    <p style="margin:12px 0 0;color:#666;font-size:12px">
        Répondre à ce courriel écrit directement au client (${esc(contact.email ?? '')}).
    </p>
</div>`;

        await sendMail({ subject, text, html, replyTo: contact.email || undefined });
    } catch (e) {
        console.error(`checkout mail for order ${m.order.soNumber} (${m.order.id}) failed`, e);
    }
}

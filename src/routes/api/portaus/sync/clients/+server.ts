// GET /api/portaus/sync/clients  — cron job
//
// Pulls every active customer from the Portaus admin API and upserts it into Supabase
// (cms_saq.contacts, companies, company_contacts, addresses, parties). Same mapping as the
// enosis ptransfer/get-clients route, so the tables keep the shape the shop already reads.
//
// Auth: `Authorization: Bearer <CRON_SECRET>` (what Vercel cron sends), or dev mode.
// Query: ?page=N syncs a single page (50 customers) instead of everything; ?limit=N per page.

import { json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { PortausError, searchCustomers, type CustomerListItem } from '$lib/server/portausAdmin';
import { createServiceClient, upsertChunked } from '$lib/server/supabase';

const ORGANIZATION_ID = 2;
const PAGE_SIZE = 50;
const PARALLEL_PAGES = 4;

type Rows = {
    contacts: Record<string, unknown>[];
    companies: Record<string, unknown>[];
    companyContacts: Record<string, unknown>[];
    addresses: Record<string, unknown>[];
    parties: Record<string, unknown>[];
};

function mapAddress(addr: any, owner: { company_id?: number; contact_id?: number }) {
    return {
        id: addr.id,
        street: addr.street ?? null,
        city: addr.city ?? null,
        postal_code: addr.postalCode ?? null,
        country: addr.country?.name ?? null,
        country_id: addr.country?.id ?? null,
        type: addr.type?.id ?? null,
        company_id: owner.company_id ?? null,
        contact_id: owner.contact_id ?? null,
        organization_id: ORGANIZATION_ID
    };
}

function mapContact(c: any) {
    return {
        id: c.id,
        first_name: c.firstName ?? null,
        last_name: c.lastName ?? null,
        email: c.email ?? c.workEmail ?? null,
        birth_date: c.birthDate ?? null,
        phone: c.phone ?? c.workPhone ?? null,
        phone_ext: c.phoneExt ?? c.workPhoneExt ?? null,
        organization_id: ORGANIZATION_ID
    };
}

function mapCustomer(client: any, rows: Rows) {
    const party: Record<string, unknown> = {
        id: client.id,
        created_at: client.createdAt,
        updated_at: client.updatedAt,
        is_archived: !client.active,
        payment_options: (client.paymentTypes ?? []).map((p: any) => Number(p.id)).filter(Number.isFinite),
        saq_number: client.externalId ?? client.customFields?.find((f: any) => f.value)?.value ?? null,
        display_name: client.name ?? null,
        company_id: null,
        individual_id: null,
        class: client.class?.id ?? null,
        language: client.language?.id ?? null,
        currency: client.currency?.id ?? null,
        last_shipping_contact_id: client.lastShippingContactId?.id ?? null,
        last_shipping_address_id: client.lastShippingAddressId?.id ?? null,
        last_billing_contact_id: client.lastBillingContactId?.id ?? null,
        last_billing_address_id: client.lastBillingAddressId?.id ?? null,
        last_delivery_type_id: client.deliveryTypeId?.id ?? client.deliveryType?.id ?? null,
        last_saq_store_id: client.lastSAQStoreId?.id ?? client.extraInfo?.location?.id ?? null,
        organization_id: ORGANIZATION_ID
    };

    if (client.company) {
        const company = client.company;
        rows.companies.push({
            id: company.id,
            name: company.name ?? null,
            usual_name: company.usualName ?? null,
            email: company.email ?? null,
            phone: company.phone ?? null,
            phone_ext: company.phoneExt ?? null,
            organization_id: ORGANIZATION_ID
        });
        for (const addr of company.addresses ?? []) rows.addresses.push(mapAddress(addr, { company_id: company.id }));
        for (const contact of company.contacts ?? []) {
            rows.contacts.push(mapContact(contact));
            rows.companyContacts.push({
                id: contact.id,
                company_id: company.id,
                contact_id: contact.id,
                is_main: contact.indPrimary ?? null,
                is_billing_contact: contact.defaultBillingInd ?? null,
                is_shipping_contact: contact.defaultShippingInd ?? null,
                receives_billing_notices: contact.sendInvoiceNotice ?? null,
                receives_reminders_of_reservations_and_orders: contact.sendReservationOrdersInd ?? null,
                is_archived: contact.active === false,
                organization_id: ORGANIZATION_ID
            });
            for (const addr of contact.addresses ?? []) {
                rows.addresses.push(mapAddress(addr, { company_id: company.id, contact_id: contact.id }));
            }
        }
        party['company_id'] = company.id;
    } else if (client.contact) {
        const c = client.contact;
        rows.contacts.push(mapContact(c));
        for (const addr of c.addresses ?? []) rows.addresses.push(mapAddress(addr, { contact_id: c.id }));
        party['individual_id'] = c.id;
    } else {
        return; // nothing to attach the party to
    }

    rows.parties.push(party);
}

function dedupeById<T extends Record<string, unknown>>(arr: T[]): T[] {
    const seen = new Set<unknown>();
    return arr.filter((r) => (seen.has(r['id']) ? false : (seen.add(r['id']), true)));
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
        const list = (page: number) => searchCustomers({ searchTerms: '', limit, page });

        const first = await list(onlyPage ?? 1);
        const pages: CustomerListItem[][] = [first.list];
        if (!onlyPage) {
            for (let p = 2; p <= first.pages; p += PARALLEL_PAGES) {
                const batch = Array.from({ length: Math.min(PARALLEL_PAGES, first.pages - p + 1) }, (_, i) =>
                    list(p + i)
                );
                for (const res of await Promise.all(batch)) pages.push(res.list);
            }
        }

        const rows: Rows = { contacts: [], companies: [], companyContacts: [], addresses: [], parties: [] };
        for (const page of pages) for (const client of page) mapCustomer(client, rows);

        // ?dry=1 maps everything but writes nothing; returns the first rows for inspection.
        if (url.searchParams.get('dry')) {
            return json({
                dry: true,
                customers: first.count,
                pages: onlyPage ? 1 : first.pages,
                counts: Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.length])),
                sample: Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.slice(0, 2)]))
            });
        }

        const supabase = createServiceClient();
        const result = {
            contacts: await upsertChunked(supabase, 'cms_saq', 'contacts', dedupeById(rows.contacts)),
            companies: await upsertChunked(supabase, 'cms_saq', 'companies', dedupeById(rows.companies)),
            company_contacts: await upsertChunked(
                supabase,
                'cms_saq',
                'company_contacts',
                dedupeById(rows.companyContacts)
            ),
            addresses: await upsertChunked(supabase, 'cms_saq', 'addresses', dedupeById(rows.addresses)),
            parties: await upsertChunked(supabase, 'cms_saq', 'parties', dedupeById(rows.parties))
        };

        const failed = Object.values(result).reduce((n, r) => n + r.failed.length, 0);
        if (failed) console.error('sync/clients: failed rows', JSON.stringify(result, null, 1));

        return json({
            ok: failed === 0,
            customers: first.count,
            pages: onlyPage ? 1 : first.pages,
            ms: Date.now() - started,
            result
        });
    } catch (e) {
        if (e instanceof PortausError) {
            console.error('sync/clients: Portaus error', e.status, e.path, e.body);
            return json({ error: 'PortausError', message: e.detail, status: e.status }, { status: 502 });
        }
        console.error('sync/clients failed', e);
        return json({ error: 'SyncFailed', message: (e as Error).message }, { status: 500 });
    }
};

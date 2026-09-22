// Reference data and constants for the Ward et associés Portaus company.
//
// Ids below were read from the test server (api-test-wardetassocies.portaus.net, systemId WARDPROD)
// on 2026-09-21. Anything that could plausibly differ between environments (sales-order statuses,
// SAQ locations, delivery types) is fetched and cached at runtime instead of hard-coded.

import { portausRequest } from './http';

/** The only inventory this shop sells from ("Importation privée"). */
export const INVENTORY_ID = 1;

export const CUSTOMER_TYPE = {
    /** individual: `contact` + addresses */
    PERSO: 0,
    /** company: `company` with contacts + addresses */
    RESTO: 1
} as const;

export const CUSTOMER_CLASS = {
    /** "Titulaire de permis" — licensed businesses, i.e. restos */
    LICENSEE: { id: 1, code: 'Titulaire de permis', ind: 'LICENCIE' },
    /** "Particulier" — private customers */
    INDIVIDUAL: { id: 2, code: 'Particulier', ind: 'PARTICULIER' }
} as const;

export const DELIVERY_TYPE = {
    RESTO_BEFORE_16H: 1, // CUSTOMER_DELIVERY_16H  "Livraison restaurant < 16h"
    RESTO_BEFORE_9H: 2, // CUSTOMER_DELIVERY_9H   "Livraison restaurant < 9h"
    SAQ_BRANCH: 3, // DELIVERY (choice_custom_info SAQ) "Livraison succursale"
    PICKUP_REP_BEFORE_15: 4,
    PICKUP_REP_AFTER_15: 5,
    PICKUP_CUSTOMER_BEFORE_15: 6,
    PICKUP_CUSTOMER_AFTER_15: 7
} as const;

export const PAYMENT_TYPE = {
    CREDIT_CARD: 1,
    CHECK_ONLINE: 2,
    BANK_TRANSFER_ONLINE: 3
} as const;

export const INVOICE_TERM_NET_30 = { id: 2, label: 'NET_30', value: 'P30D' } as const;

export const TAXES = [
    { id: 1, name: 'TPS', number: '811808716', rate: 0.05 },
    { id: 2, name: 'TVQ', number: '1217685610', rate: 0.09975 }
] as const;

export const COUNTRY = {
    CANADA: { id: 1, isoCode: 'CA', code: 'fr', name: 'Canada' },
    USA: { id: 2, isoCode: 'US', code: 'en', name: 'United States' }
} as const;

export const STATE_QUEBEC = { id: 1, name: 'Québec' } as const;

export const ADDRESS_TYPE = {
    BILLING: { id: 1, name: 'Facturation', code: 'BILLING' },
    SHIPPING: { id: 2, name: 'Livraison', code: 'SHIPPING' }
} as const;

/** Company contact role used for a resto's main contact ("Directeur"). */
export const COMPANY_ROLE_DIRECTOR_ID = 1;

/** Email template the UI attaches to the default invoice reminders (30 / 37 / 44 days). */
export const INVOICE_REMINDER_EMAIL_CONTENT_ID = 4;

export type SalesOrderStatusCode =
    | 'DRAFT'
    | 'DRAFT_EXTERNAL'
    | 'TO_PROCESS'
    | 'TO_PROCESS_REJECTED'
    | 'TO_PROCESS_PAID'
    | 'IN_PROCESS'
    | 'IN_AUTO_PROCESS'
    | 'CONFIRMED'
    | 'CONFIRMED_SAQ'
    | 'WAITING_PAYMENT'
    | 'WAITING_PAYMENT_CONFIRMED'
    | 'AWAITING_BILLING'
    | 'COMPLETED'
    | 'IMPORTED'
    | 'REJECTED'
    | 'VOIDED';

export type SalesOrderStatus = { id: number; code: SalesOrderStatusCode; weight?: number };

export type DeliveryType = {
    id: number;
    code: string;
    choice_custom_info: string | null;
    languages: Array<{ code: string; delivery_type_language: { name: string } }>;
};

export type SaqLocation = {
    id: number;
    code: 'SAQ';
    content: { city: string; phone: string; number: string; address: string };
};

const TTL_MS = 60 * 60 * 1000;

function cached<T>(loader: () => Promise<T>) {
    let value: { at: number; data: T } | null = null;
    let inflight: Promise<T> | null = null;
    return async (): Promise<T> => {
        if (value && Date.now() - value.at < TTL_MS) return value.data;
        if (!inflight) {
            inflight = loader()
                .then((data) => {
                    value = { at: Date.now(), data };
                    return data;
                })
                .finally(() => {
                    inflight = null;
                });
        }
        return inflight;
    };
}

export const listSalesOrderStatuses = cached(() =>
    portausRequest<SalesOrderStatus[]>('GET', '/API/statuses/', { query: { type: 'SALES_ORDER' } })
);

export async function getSalesOrderStatus(code: SalesOrderStatusCode): Promise<SalesOrderStatus> {
    const list = await listSalesOrderStatuses();
    const found = list.find((s) => s.code === code);
    if (!found) throw new Error(`Portaus has no SALES_ORDER status with code ${code}`);
    return found;
}

export const listDeliveryTypes = cached(() => portausRequest<DeliveryType[]>('GET', '/API/delivery-types/'));

export async function getDeliveryType(id: number): Promise<DeliveryType> {
    const found = (await listDeliveryTypes()).find((d) => d.id === id);
    if (!found) throw new Error(`Portaus has no delivery type with id ${id}`);
    return found;
}

/** SAQ branches as Portaus knows them ("custom infos" with code SAQ). Their ids match cms_saq.saq_branches.id. */
export const listSaqLocations = cached(() =>
    portausRequest<SaqLocation[]>('GET', '/API/v1/admin/custom-infos', { query: { code: 'SAQ' } })
);

export async function getSaqLocation(id: number): Promise<SaqLocation> {
    const found = (await listSaqLocations()).find((l) => l.id === id);
    if (!found) throw new Error(`Portaus has no SAQ location with id ${id}`);
    return found;
}

// Customers ("clients") on the Portaus admin API.
//
// Two customer types exist:
//   - perso (type 0): one `contact` carrying the addresses. Identified by SAQ number when they
//     have one, otherwise by the contact's email.
//   - resto (type 1): a `company` carrying addresses and one or more contacts. Always has a SAQ
//     number, stored in `externalId`.
//
// Endpoints (verified against the test server, see reference.ts for the date):
//   GET  /API/v1/admin/customers/?searchTerms=&type[]=   list, matches name / externalId
//   GET  /API/contacts?searchTerms=                      list, matches email
//   GET  /API/contacts/:id                               contact with its `customer`
//   GET  /API/contacts/validate-email?email=             200 free, 403 already used
//   GET  /API/customers/:id                              full customer (snake_case)
//   POST /API/contacts                                   create a bare contact (resto contacts)
//   POST /API/customers                                  create customer (perso or resto)

import { PortausError } from './errors';
import { portausRequest } from './http';
import {
    ADDRESS_TYPE,
    COMPANY_ROLE_DIRECTOR_ID,
    COUNTRY,
    CUSTOMER_CLASS,
    CUSTOMER_TYPE,
    DELIVERY_TYPE,
    INVOICE_REMINDER_EMAIL_CONTENT_ID,
    INVOICE_TERM_NET_30,
    PAYMENT_TYPE,
    STATE_QUEBEC,
    TAXES,
    getDeliveryType,
    getSaqLocation
} from './reference';

// ---------- shapes returned by Portaus ------------------------------------------------------

/** One row of GET /API/v1/admin/customers/ (camelCase). */
export type CustomerListItem = {
    id: number;
    name: string;
    usualName: string | null;
    type: 0 | 1;
    active: boolean;
    externalId: string | null;
    customFields?: Array<{ id: number; value: string | null }>;
    class?: { id: number; code: string } | null;
    contact?: {
        id: number;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        addresses?: PortausAddressCamel[];
    } | null;
    company?: {
        id: number;
        name: string;
        usualName: string | null;
        email: string | null;
        phone: string | null;
        addresses?: PortausAddressCamel[];
        contacts?: Array<{ id: number; firstName: string | null; lastName: string | null; email: string | null }>;
    } | null;
};

export type PortausAddressCamel = {
    id: number;
    street: string | null;
    city: string | null;
    postalCode: string | null;
    otherState?: string | null;
    country?: { id: number; name: string } | null;
    state?: { id: number; name: string } | null;
    type?: { id: number; code: 'BILLING' | 'SHIPPING'; name?: string } | null;
};

export type PortausAddressSnake = {
    id: number;
    street: string | null;
    city: string | null;
    postal_code: string | null;
    other_state?: string | null;
    country?: { id: number; name: string } | null;
    state?: { id: number; name: string } | null;
    type?: { id: number; code: 'BILLING' | 'SHIPPING'; name?: string } | null;
};

/** GET /API/customers/:id (snake_case). Only the fields we read are typed. */
export type CustomerDetail = {
    id: number;
    name: string;
    usual_name: string | null;
    type: 0 | 1;
    active: boolean;
    externalId: string | null;
    extra_info?: { location?: { id: number; code: string; content: Record<string, string> } | null } | null;
    customer_class?: { id: number; code: string } | null;
    delivery_type?: { id: number; code: string; choice_custom_info?: string | null } | null;
    taxable?: boolean;
    contact?: {
        id: number;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        addresses: PortausAddressSnake[];
    } | null;
    company?: {
        id: number;
        name: string;
        usual_name: string | null;
        email: string | null;
        phone: string | null;
        contacts: Array<{
            id: number;
            first_name: string | null;
            last_name: string | null;
            email: string | null;
            work_email: string | null;
            active: boolean;
            ind_primary: boolean;
            default_billing_ind: boolean;
            default_shipping_ind: boolean;
        }>;
        addresses: PortausAddressSnake[];
    } | null;
};

/** The part of a customer the shop needs to place an order for it. */
export type CustomerSummary = {
    id: number;
    type: 'perso' | 'resto';
    name: string;
    saqNumber: string | null;
    email: string | null;
    deliveryTypeId: number | null;
    saqLocationId: number | null;
    billingContactId: number | null;
    shippingContactId: number | null;
    billingAddressId: number | null;
    shippingAddressId: number | null;
    addresses: PortausAddressSnake[];
};

// ---------- lookups ---------------------------------------------------------------------------

type CustomerListResponse = { count: number; pages: number; page: number; list: CustomerListItem[] };

export async function searchCustomers(opts: {
    searchTerms: string;
    type?: 0 | 1;
    limit?: number;
    page?: number;
    activeOnly?: boolean;
}): Promise<CustomerListResponse> {
    return portausRequest<CustomerListResponse>('GET', '/API/v1/admin/customers/', {
        query: {
            searchTerms: opts.searchTerms,
            'type[]': opts.type,
            limit: opts.limit ?? 20,
            page: opts.page ?? 1,
            'primary-only': 'true',
            active: opts.activeOnly === false ? undefined : 'true',
            orderBy: 'createdAt',
            direction: 'DESC'
        }
    });
}

export async function getCustomer(id: number): Promise<CustomerDetail> {
    return portausRequest<CustomerDetail>('GET', `/API/customers/${id}`);
}

function normalizeSaq(value: unknown): string {
    return String(value ?? '')
        .replace(/\s+/g, '')
        .trim();
}

function saqNumberOf(c: CustomerListItem): string | null {
    const fromCustomField = c.customFields?.find((f) => f.value)?.value ?? null;
    return c.externalId ?? fromCustomField;
}

async function findBySaqNumber(saqNumber: string, type: 0 | 1): Promise<CustomerDetail | null> {
    const wanted = normalizeSaq(saqNumber);
    if (!wanted) return null;
    const res = await searchCustomers({ searchTerms: wanted, type, limit: 20 });
    const hit = res.list.find((c) => normalizeSaq(saqNumberOf(c)) === wanted);
    return hit ? getCustomer(hit.id) : null;
}

/** Restos always carry their SAQ number in `externalId`; the list search matches on it. */
export function findRestoBySaqNumber(saqNumber: string) {
    return findBySaqNumber(saqNumber, CUSTOMER_TYPE.RESTO);
}

export function findPersoBySaqNumber(saqNumber: string) {
    return findBySaqNumber(saqNumber, CUSTOMER_TYPE.PERSO);
}

/** 403 from validate-email means a contact with that email already exists. */
export async function isEmailTaken(email: string): Promise<boolean> {
    try {
        await portausRequest('GET', '/API/contacts/validate-email', {
            query: { email: email.trim() },
            retryOnUnauthorized: false
        });
        return false;
    } catch (e) {
        if (e instanceof PortausError && e.status === 403) return true;
        throw e;
    }
}

type ContactsListResponse = {
    count: number;
    pages: number;
    page: number;
    contacts: Array<{ id: number; email: string | null; first_name: string | null; last_name: string | null }>;
};

/**
 * Perso lookup by email. The customer search does not index emails, so go through contacts:
 * list contacts matching the email, then read each one to find which customer it belongs to.
 * When several contacts share the email (this happens on the test server), the most recent
 * customer wins.
 */
export async function findPersoByEmail(email: string): Promise<CustomerDetail | null> {
    const wanted = email.trim().toLowerCase();
    if (!wanted) return null;

    const res = await portausRequest<ContactsListResponse>('GET', '/API/contacts', {
        query: { searchTerms: wanted, limit: 20, page: 1, orderBy: 'last_name', direction: 'ASC' }
    });
    const exact = res.contacts.filter((c) => (c.email ?? '').trim().toLowerCase() === wanted);
    if (!exact.length) return null;

    const details = await Promise.all(
        exact.map((c) =>
            portausRequest<{ id: number; customer?: { id: number; name: string } | null }>(
                'GET',
                `/API/contacts/${c.id}`
            ).catch(() => null)
        )
    );
    const customerIds = [...new Set(details.map((d) => d?.customer?.id).filter((id): id is number => !!id))];
    if (!customerIds.length) return null;

    const customers = await Promise.all(customerIds.map((id) => getCustomer(id).catch(() => null)));
    const perso = customers
        .filter((c): c is CustomerDetail => !!c && c.type === CUSTOMER_TYPE.PERSO && c.active !== false)
        .sort((a, b) => b.id - a.id);
    return perso[0] ?? null;
}

export function summarizeCustomer(c: CustomerDetail): CustomerSummary {
    const isResto = c.type === CUSTOMER_TYPE.RESTO;
    const addresses = (isResto ? c.company?.addresses : c.contact?.addresses) ?? [];
    const billingAddress = addresses.find((a) => a.type?.code === 'BILLING') ?? addresses[0] ?? null;
    const shippingAddress = addresses.find((a) => a.type?.code === 'SHIPPING') ?? billingAddress;

    let billingContactId: number | null = null;
    let shippingContactId: number | null = null;
    let email: string | null = null;

    if (isResto) {
        const contacts = (c.company?.contacts ?? []).filter((x) => x.active !== false);
        const primary = contacts.find((x) => x.ind_primary) ?? contacts[0] ?? null;
        billingContactId = (contacts.find((x) => x.default_billing_ind) ?? primary)?.id ?? null;
        shippingContactId = (contacts.find((x) => x.default_shipping_ind) ?? primary)?.id ?? null;
        email = c.company?.email ?? primary?.work_email ?? primary?.email ?? null;
    } else {
        billingContactId = shippingContactId = c.contact?.id ?? null;
        email = c.contact?.email ?? null;
    }

    return {
        id: c.id,
        type: isResto ? 'resto' : 'perso',
        name: c.name,
        saqNumber: c.externalId ?? null,
        email,
        deliveryTypeId: c.delivery_type?.id ?? null,
        saqLocationId: c.extra_info?.location?.id ?? null,
        billingContactId,
        shippingContactId,
        billingAddressId: billingAddress?.id ?? null,
        shippingAddressId: shippingAddress?.id ?? null,
        addresses
    };
}

// ---------- creation --------------------------------------------------------------------------

export type AddressInput = {
    street: string;
    city: string;
    postalCode: string;
    /** Portaus country id; defaults to Canada. */
    countryId?: number;
    /** Portaus state id; defaults to Québec for Canada, null otherwise. */
    stateId?: number | null;
    otherState?: string | null;
};

export type ContactInput = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    phoneExt?: string | null;
    /** 0 = female, 1 = male as Portaus encodes it; optional. */
    sex?: 0 | 1 | null;
};

export type CreatePersoInput = {
    contact: ContactInput;
    billingAddress: AddressInput;
    /** Only when the perso wants a different delivery address; SAQ pickups need none. */
    shippingAddress?: AddressInput | null;
    saqNumber?: string | null;
    /** cms_saq.saq_branches.id of the pickup branch, sets the customer's default location. */
    saqLocationId?: number | null;
};

export type CreateRestoInput = {
    company: {
        name: string;
        usualName?: string | null;
        email?: string | null;
        phone?: string | null;
        phoneExt?: string | null;
    };
    saqNumber: string;
    billingContact: ContactInput;
    /** Separate delivery contact; defaults to the billing contact. */
    shippingContact?: ContactInput | null;
    billingAddress: AddressInput;
    /** Where cases are delivered; defaults to the billing address. */
    shippingAddress?: AddressInput | null;
    /** DELIVERY_TYPE.* id. Defaults to SAQ branch delivery when saqLocationId is given, else RESTO_BEFORE_16H. */
    deliveryTypeId?: number | null;
    saqLocationId?: number | null;
};

function addressPayload(a: AddressInput, type: (typeof ADDRESS_TYPE)[keyof typeof ADDRESS_TYPE]) {
    const countryId = a.countryId ?? COUNTRY.CANADA.id;
    const country = Object.values(COUNTRY).find((c) => c.id === countryId) ?? { id: countryId };
    const stateId = a.stateId === undefined ? (countryId === COUNTRY.CANADA.id ? STATE_QUEBEC.id : null) : a.stateId;
    return {
        street: a.street.trim(),
        city: a.city.trim(),
        state: stateId == null ? null : stateId === STATE_QUEBEC.id ? STATE_QUEBEC : { id: stateId },
        country,
        code: null,
        other_state: a.otherState ?? null,
        postal_code: a.postalCode.trim(),
        type: { id: type.id, name: type.name }
    };
}

function defaultInvoiceReminders() {
    return [30, 37, 44].map((nbDays, i) => ({
        type: 'INVOICE_REMINDER',
        configuration: { type: 1, nbDays },
        order: i + 1,
        email_custom_content_id: INVOICE_REMINDER_EMAIL_CONTENT_ID
    }));
}

async function settingsPayload(opts: {
    customerClass: (typeof CUSTOMER_CLASS)[keyof typeof CUSTOMER_CLASS];
    deliveryTypeId: number;
    saqLocationId?: number | null;
    paymentMethods: number[];
    invoiceReminders: boolean;
}) {
    const deliveryType = await getDeliveryType(opts.deliveryTypeId);
    const location = opts.saqLocationId ? await getSaqLocation(opts.saqLocationId) : null;
    const reminders = opts.invoiceReminders ? defaultInvoiceReminders() : [];

    return {
        customerClass: { ...opts.customerClass },
        tags: [],
        currency: 1, // CAD
        language: 1, // fr
        paymentMethods: opts.paymentMethods,
        term: INVOICE_TERM_NET_30,
        lateFeeActivated: false,
        indTypeFee: 0,
        fee: 5,
        gracePeriod: 30,
        deliveryType: {
            id: deliveryType.id,
            name: deliveryType.languages.find((l) => l.code === 'en')?.delivery_type_language.name ?? deliveryType.code,
            choice_custom_info: deliveryType.choice_custom_info
        },
        location: location ? { id: location.id, code: location.code, content: location.content } : null,
        reminderActivated: opts.invoiceReminders,
        invoiceReminders: reminders,
        reservationNotificationInd: false,
        reservationNotificationType: null,
        reservationNotificationEmailCustomContent: null,
        lateFeeReminderActivated: null,
        customerDeliverySchedules: [],
        invoice_before_processing: true,
        online_invoicing_ind: true,
        taxes: TAXES.map((t) => ({ ...t })),
        taxable: true,
        nbDaysReminder: 3
    };
}

function notificationsFrom(settings: { invoiceReminders: Array<Record<string, unknown>> }) {
    return settings.invoiceReminders.map((r) => ({ ...r, customer_id: null }));
}

/** Creates a perso customer (type 0). Returns the new customer id. */
export async function createPersoCustomer(input: CreatePersoInput): Promise<number> {
    const saqNumber = input.saqNumber ? normalizeSaq(input.saqNumber) : null;
    const settings = await settingsPayload({
        customerClass: CUSTOMER_CLASS.INDIVIDUAL,
        deliveryTypeId: DELIVERY_TYPE.SAQ_BRANCH,
        saqLocationId: input.saqLocationId ?? null,
        paymentMethods: [PAYMENT_TYPE.CREDIT_CARD],
        invoiceReminders: false
    });

    const addresses = [addressPayload(input.billingAddress, ADDRESS_TYPE.BILLING)];
    if (input.shippingAddress) addresses.push(addressPayload(input.shippingAddress, ADDRESS_TYPE.SHIPPING));

    const body = {
        contacts: [
            {
                id: null,
                first_name: input.contact.firstName.trim(),
                last_name: input.contact.lastName.trim(),
                email: input.contact.email.trim(),
                sex: input.contact.sex ?? null,
                denomination: null,
                phone: input.contact.phone?.trim() || null,
                phone_ext: input.contact.phoneExt?.trim() || null,
                addresses
            }
        ],
        type: String(CUSTOMER_TYPE.PERSO),
        externalId: saqNumber,
        settings,
        territory_id: null,
        rep_id: null,
        parent: null,
        notifications: notificationsFrom(settings)
    };

    const res = await portausRequest<{ id: number }>('POST', '/API/customers', { body });
    if (!res?.id) throw new PortausError('Portaus created the customer but returned no id', 200, '/API/customers', res);
    return res.id;
}

async function createBareContact(c: ContactInput): Promise<number> {
    const res = await portausRequest<{ id: number }>('POST', '/API/contacts', {
        body: {
            first_name: c.firstName.trim(),
            last_name: c.lastName.trim(),
            email: c.email.trim(),
            phone: c.phone?.trim() || null,
            phone_ext: c.phoneExt?.trim() || null,
            sex: c.sex ?? null,
            denomination: null,
            addresses: []
        }
    });
    if (!res?.id) throw new PortausError('Portaus created the contact but returned no id', 200, '/API/contacts', res);
    return res.id;
}

/**
 * Creates a resto customer (type 1): company + addresses + contacts.
 * Company contacts are standalone records in Portaus, so they are created first and then
 * attached by id with their billing / shipping roles. Returns the new customer id.
 */
export async function createRestoCustomer(input: CreateRestoInput): Promise<number> {
    const saqNumber = normalizeSaq(input.saqNumber);
    if (!saqNumber) throw new Error('A resto customer needs a SAQ number');

    const deliveryTypeId =
        input.deliveryTypeId ?? (input.saqLocationId ? DELIVERY_TYPE.SAQ_BRANCH : DELIVERY_TYPE.RESTO_BEFORE_16H);

    const settings = await settingsPayload({
        customerClass: CUSTOMER_CLASS.LICENSEE,
        deliveryTypeId,
        saqLocationId: input.saqLocationId ?? null,
        paymentMethods: [PAYMENT_TYPE.CREDIT_CARD, PAYMENT_TYPE.CHECK_ONLINE, PAYMENT_TYPE.BANK_TRANSFER_ONLINE],
        invoiceReminders: true
    });

    const sameContact =
        !input.shippingContact ||
        input.shippingContact.email.trim().toLowerCase() === input.billingContact.email.trim().toLowerCase();

    const billingContactId = await createBareContact(input.billingContact);
    const shippingContactId = sameContact ? billingContactId : await createBareContact(input.shippingContact!);

    const contactPayload = (
        id: number,
        c: ContactInput,
        roles: { billing: boolean; shipping: boolean; primary: boolean }
    ) => ({
        id,
        active: true,
        role: { id: COMPANY_ROLE_DIRECTOR_ID },
        work_email: c.email.trim(),
        work_phone: c.phone?.trim() || null,
        work_phone_ext: c.phoneExt?.trim() || null,
        ind_primary: roles.primary,
        send_invoice_notice: roles.billing,
        send_reservation_orders_ind: roles.primary,
        default_shipping_ind: roles.shipping,
        default_billing_ind: roles.billing
    });

    const contacts = [
        contactPayload(billingContactId, input.billingContact, { billing: true, shipping: sameContact, primary: true })
    ];
    if (!sameContact) {
        contacts.push(
            contactPayload(shippingContactId, input.shippingContact!, {
                billing: false,
                shipping: true,
                primary: false
            })
        );
    }

    const addresses = [addressPayload(input.billingAddress, ADDRESS_TYPE.BILLING)];
    if (input.shippingAddress) addresses.push(addressPayload(input.shippingAddress, ADDRESS_TYPE.SHIPPING));

    const body = {
        contacts,
        company: {
            id: null,
            name: input.company.name.trim(),
            usual_name: (input.company.usualName ?? input.company.name).trim(),
            email: input.company.email?.trim() || input.billingContact.email.trim(),
            phone: input.company.phone?.trim() || input.billingContact.phone?.trim() || null,
            phoneExt: input.company.phoneExt?.trim() || null,
            addresses
        },
        type: String(CUSTOMER_TYPE.RESTO),
        externalId: saqNumber,
        settings,
        territory_id: null,
        rep_id: null,
        parent: null,
        notifications: notificationsFrom(settings)
    };

    const res = await portausRequest<{ id: number }>('POST', '/API/customers', { body });
    if (!res?.id) throw new PortausError('Portaus created the customer but returned no id', 200, '/API/customers', res);
    return res.id;
}

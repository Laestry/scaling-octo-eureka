// Sales orders on the Portaus admin API.
//
// Web flow (all verified against the test server on 2026-09-21):
//   1. price the lines with /calculate
//   2. POST the order with status DRAFT, then PUT it back with status DRAFT_EXTERNAL
//      ("Brouillon - web"). Posting DRAFT_EXTERNAL directly is silently turned into TO_PROCESS.
//   3. once the PaymentIntent exists, PUT status WAITING_PAYMENT
//   4. when the payment webhook arrives, invoice the order and record the agency-fee payment
//      against it (see invoices.ts): the invoice becomes PARTIALLY_PAID and the order stays in
//      WAITING_PAYMENT until the team processes it.
//
// A full PUT of the order with a new `status` is accepted for every transition we tried.
// `?action=CONFIRM` is NOT "confirm" in the business sense: it moves a draft to TO_PROCESS and
// is a no-op afterwards, so it is exposed as emitOrder() and not used by the web flow.
//
// Endpoints:
//   GET  /API/latest/admin/products/:puid/price?inventoryId=&qty=&customerId=&idType=puid
//   POST /api/latest/admin/sales-orders/calculate
//   POST /API/latest/admin/sales-orders
//   GET  /API/latest/admin/sales-orders/:id
//   PUT  /API/latest/admin/sales-orders/:id                (full order, status change)
//   PUT  /API/latest/admin/sales-orders/:id?action=CONFIRM | VOID&force= | COMPLETED | SEND | UNPROCESS

import { OrderValidationError } from './errors';
import { portausRequest } from './http';
import {
    INVENTORY_ID,
    getSalesOrderStatus,
    getSaqLocation,
    type SalesOrderStatus,
    type SalesOrderStatusCode
} from './reference';

export type LinePrice = {
    label: 'DEFAULT_PRODUCT_PRICE' | 'PRODUCT_AGENCY_FEE' | string;
    price: number;
    taxable: boolean;
    editState: boolean;
    productId: number;
    chargeFullPrices: boolean;
};

export type ProductPriceResponse = {
    product: { id: number; puid: string; name: string; uvc: number; taxable?: boolean; taxes?: unknown[] };
    prices: LinePrice[];
    productTaxes?: unknown[] | null;
    inventory?: { id: number };
};

export type CalculatedLine = {
    uuid?: string;
    product: { id: number; puid?: string; name: string; uvc?: number };
    prices: LinePrice[];
    inventory: { id: number };
    qty: number;
    reservation: unknown | null;
    quantityLeft: number;
    validations: Array<{ message?: string } | string>;
    subTotal: number;
    subTotalBrut: number;
    discount: number | null;
    taxableAmount: number;
    taxAmount: number;
    billableAmount: number;
    unbillableAmount: number;
    taxes?: unknown[];
};

export type OrderTax = {
    label: string;
    taxableAmount: number;
    taxNumber: string;
    total: number;
    rate: number;
    billableTaxableAmount: number;
    billable: number;
};

export type CalculateResponse = {
    id: number | null;
    customer: { id: number };
    discount: number | null;
    lines: CalculatedLine[];
    subTotal: number;
    /** What we bill (agency fee); the rest is paid to the SAQ. */
    subTotalBillable: number;
    taxes: OrderTax[];
    total: number;
    totalBillable: number;
    totalUnbillable: number;
};

/** GET /API/latest/admin/sales-orders/:id. Only the fields we read or re-send are typed. */
export type SalesOrder = {
    id: number;
    soNumber: string;
    date: string;
    expectedDeliveryDate?: string | null;
    origin: string;
    status: SalesOrderStatus;
    reference?: string | null;
    notes?: string | null;
    discount?: number | null;
    subTotal: number;
    total: number;
    taxes: OrderTax[];
    tags?: unknown[];
    rep?: { id: number; firstName?: string; lastName?: string; first_name?: string; last_name?: string } | null;
    customer: { id: number; name: string; type: 0 | 1 };
    deliveryType?: { id: number; code: string } | null;
    extraInfo?: { location?: unknown } | null;
    lines: Array<{
        id: number;
        puid: string;
        qty: number;
        prices: LinePrice[];
        discount?: number | null;
        subTotal: number;
        subTotalBrut: number;
        taxes?: unknown;
        product: { id: number; inventory?: { id: number } };
    }>;
    billingContact?: { id: number } | null;
    shippingContact?: { id: number } | null;
    billingAddress?: { id: number } | null;
    shippingAddress?: { id: number } | null;
    statusLogs?: unknown[];
};

export type OrderLineInput = {
    /** Portaus product puid (cms_saq.alcohol.uuid). */
    puid: string;
    /** Quantity in BOTTLES, not cases. */
    qty: number;
};

export async function getProductPrice(puid: string, qty: number, customerId: number): Promise<ProductPriceResponse> {
    return portausRequest<ProductPriceResponse>('GET', `/API/latest/admin/products/${puid}/price`, {
        query: { inventoryId: INVENTORY_ID, qty, customerId, idType: 'puid' }
    });
}

function mergeLines(lines: OrderLineInput[]): OrderLineInput[] {
    const byPuid = new Map<string, number>();
    for (const l of lines) {
        const qty = Math.trunc(Number(l.qty));
        if (!l.puid || !(qty > 0)) continue;
        byPuid.set(l.puid, (byPuid.get(l.puid) ?? 0) + qty);
    }
    return [...byPuid.entries()].map(([puid, qty]) => ({ puid, qty }));
}

/**
 * Prices every line for the customer, then asks Portaus for the totals.
 * Throws OrderValidationError when a line is short on stock or unknown.
 */
export async function calculateOrder(input: {
    customerId: number;
    lines: OrderLineInput[];
}): Promise<CalculateResponse> {
    const lines = mergeLines(input.lines);
    if (!lines.length) throw new Error('An order needs at least one line');

    const priced = await Promise.all(
        lines.map(async (l) => ({ line: l, price: await getProductPrice(l.puid, l.qty, input.customerId) }))
    );

    // Portaus rejects a line carrying `id: null` on create; new lines must have no id key at all.
    const calc = await portausRequest<CalculateResponse>('POST', '/api/latest/admin/sales-orders/calculate', {
        body: {
            id: null,
            customer: { id: input.customerId },
            discount: null,
            lines: priced.map(({ line, price }, i) => ({
                uuid: `web-${i + 1}`,
                product: { id: price.product.id, puid: line.puid },
                discount: null,
                reservation: null,
                inventory: { id: INVENTORY_ID },
                qty: line.qty,
                prices: price.prices,
                productTaxes: price.productTaxes ?? null
            }))
        }
    });

    const failing = calc.lines
        .map((line, i) => ({ line, meta: lines[i] }))
        .filter(({ line }) => (line.validations ?? []).length > 0)
        .map(({ line, meta }) => ({
            reason: line.product?.id ? ('InsufficientQuantity' as const) : ('UnknownProduct' as const),
            puid: meta?.puid ?? line.product?.puid ?? null,
            productId: line.product?.id ?? null,
            name: line.product?.name ?? null,
            requested: line.qty,
            quantityLeft: line.quantityLeft ?? 0,
            messages: (line.validations ?? []).map((v) =>
                typeof v === 'string' ? v : (v.message ?? JSON.stringify(v))
            )
        }));
    if (failing.length) throw new OrderValidationError(failing);

    return calc;
}

export type CreateDraftOrderInput = {
    customerId: number;
    billingContactId: number;
    billingAddressId: number;
    /** Default to the billing contact / address. */
    shippingContactId?: number | null;
    shippingAddressId?: number | null;
    /** DELIVERY_TYPE.* id. */
    deliveryTypeId: number;
    /** Required with DELIVERY_TYPE.SAQ_BRANCH: the SAQ branch (cms_saq.saq_branches.id == Portaus custom-info id). */
    saqLocationId?: number | null;
    lines: OrderLineInput[];
    reference?: string | null;
    notes?: string | null;
    /** Order date; defaults to now. */
    date?: Date;
    /** Status the order is left in. Defaults to DRAFT_EXTERNAL ("Brouillon - web"). */
    statusCode?: SalesOrderStatusCode;
};

/**
 * Creates the order in Portaus and leaves it in DRAFT_EXTERNAL. Returns the stored order together
 * with the calculate() result it was built from (the caller needs `totalBillable` to charge).
 */
export async function createDraftWebOrder(
    input: CreateDraftOrderInput
): Promise<{ order: SalesOrder; calculation: CalculateResponse }> {
    const calculation = await calculateOrder({ customerId: input.customerId, lines: input.lines });
    const location = input.saqLocationId ? await getSaqLocation(input.saqLocationId) : null;

    const body = {
        id: null,
        soNumber: null,
        customer: { id: input.customerId },
        date: (input.date ?? new Date()).toISOString(),
        expectedDeliveryDate: undefined,
        reference: input.reference ?? '',
        notes: input.notes ?? '',
        subTotal: calculation.subTotal,
        total: calculation.total,
        discount: calculation.discount ?? null,
        taxes: calculation.taxes,
        billingAddress: { id: input.billingAddressId },
        shippingAddress: { id: input.shippingAddressId ?? input.billingAddressId },
        billingContact: { id: input.billingContactId },
        shippingContact: { id: input.shippingContactId ?? input.billingContactId },
        extraInfo: { location: location ? { id: location.id, code: location.code, content: location.content } : null },
        // No `id` on new lines: Portaus answers 500 "Error while creating a sales order" for id: null.
        lines: calculation.lines.map((l) => ({
            product: { id: l.product.id, puid: l.product.puid },
            inventory: { id: l.inventory?.id ?? INVENTORY_ID },
            prices: l.prices,
            qty: l.qty,
            discount: l.discount ?? null,
            subTotal: l.subTotal,
            subTotalBrut: l.subTotalBrut
        })),
        tags: [],
        deliveryTypes: [{ id: input.deliveryTypeId }],
        // Only DRAFT survives a POST; the web status is applied with a PUT right after.
        status: await getSalesOrderStatus('DRAFT')
    };

    const created = await portausRequest<SalesOrder>('POST', '/API/latest/admin/sales-orders', { body });
    const target = input.statusCode ?? 'DRAFT_EXTERNAL';
    const order = target === 'DRAFT' ? created : await setOrderStatus(created.id, target);
    return { order, calculation };
}

export async function getOrder(id: number): Promise<SalesOrder> {
    return portausRequest<SalesOrder>('GET', `/API/latest/admin/sales-orders/${id}`);
}

/** The subset of a stored order that PUT /sales-orders/:id expects back (same as the Portaus UI sends). */
function serializeForPut(o: SalesOrder, status: SalesOrderStatus) {
    const body: Record<string, unknown> = {
        id: o.id,
        soNumber: o.soNumber,
        customer: { id: o.customer.id },
        date: o.date,
        expectedDeliveryDate: o.expectedDeliveryDate ?? undefined,
        reference: o.reference ?? '',
        notes: o.notes ?? '',
        subTotal: o.subTotal,
        total: o.total,
        discount: o.discount ?? null,
        taxes: o.taxes,
        billingAddress: { id: o.billingAddress?.id },
        shippingAddress: { id: o.shippingAddress?.id },
        billingContact: { id: o.billingContact?.id },
        shippingContact: { id: o.shippingContact?.id },
        extraInfo: o.extraInfo ?? { location: null },
        tags: o.tags ?? [],
        lines: o.lines.map((l) => ({
            id: l.id,
            product: { id: l.product.id, puid: l.puid },
            inventory: { id: l.product?.inventory?.id ?? INVENTORY_ID },
            prices: l.prices,
            qty: l.qty,
            discount: l.discount ?? null,
            subTotal: l.subTotal,
            subTotalBrut: l.subTotalBrut,
            taxes: l.taxes
        })),
        status
    };
    if (o.deliveryType?.id) body['deliveryTypes'] = [{ id: o.deliveryType.id }];
    if (o.rep) {
        body['rep'] = {
            id: o.rep.id,
            firstName: o.rep.firstName ?? o.rep.first_name,
            lastName: o.rep.lastName ?? o.rep.last_name
        };
    }
    return body;
}

/** Re-sends the stored order with a new status. Idempotent: returns as is when already there. */
export async function setOrderStatus(id: number, code: SalesOrderStatusCode): Promise<SalesOrder> {
    const current = await getOrder(id);
    if (current.status?.code === code) return current;
    const status = await getSalesOrderStatus(code);
    return portausRequest<SalesOrder>('PUT', `/API/latest/admin/sales-orders/${id}`, {
        body: serializeForPut(current, status)
    });
}

/** Status a web order gets once its payment succeeded: "Payé - à traiter". */
export const PAID_STATUS: SalesOrderStatusCode = 'TO_PROCESS_PAID';

/**
 * Marks a web order as paid. Only moves forward: an order already past the draft / waiting
 * states (processed, confirmed, voided…) is left untouched and returned as is.
 */
export async function markOrderPaid(id: number, code: SalesOrderStatusCode = PAID_STATUS): Promise<SalesOrder> {
    const current = await getOrder(id);
    const movable: SalesOrderStatusCode[] = ['DRAFT', 'DRAFT_EXTERNAL', 'WAITING_PAYMENT', 'TO_PROCESS'];
    if (!movable.includes(current.status?.code)) return current;
    return setOrderStatus(id, code);
}

/** `?action=CONFIRM`: draft -> TO_PROCESS ("À traiter"), a no-op afterwards. Not the paid flow. */
export async function emitOrder(id: number): Promise<SalesOrder> {
    return portausRequest<SalesOrder>('PUT', `/API/latest/admin/sales-orders/${id}`, { query: { action: 'CONFIRM' } });
}

export async function voidOrder(id: number, force = false): Promise<SalesOrder> {
    return portausRequest<SalesOrder>('PUT', `/API/latest/admin/sales-orders/${id}`, {
        query: { action: 'VOID', force: String(force) }
    });
}

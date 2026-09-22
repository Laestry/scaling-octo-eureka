// Invoices and payments on the Portaus admin API.
//
// "Partially paid" is an INVOICE status, not a sales-order status. A web order becomes partially
// paid the way the Portaus UI does it (verified on the test server on 2026-09-22):
//   1. POST /API/latest/admin/invoices?salesOrdersId=<orderId>   (no body) -> unsaved invoice
//   2. POST /API/latest/admin/invoices  with that invoice + status DRAFT -> stored invoice
//   3. POST /API/payments { payment: {...}, invoices: [{ id, invNumber }] } -> payment applied
// After step 3 the invoice reads PARTIALLY_PAID (outstanding = order total - agency fee) and
// Portaus itself moves the sales order to WAITING_PAYMENT.

import { PortausError } from './errors';
import { portausRequest } from './http';
import { getOrder, type SalesOrder } from './salesOrders';

export type InvoiceStatusCode = 'DRAFT' | 'TO_SEND' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'VOIDED';
export type InvoiceStatus = { id: number; code: InvoiceStatusCode; weight?: number };

/** Row as the sales order lists it under `invoices`. */
export type OrderInvoiceRef = {
    id: number;
    invNumber: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    status: InvoiceStatus;
};

/** POST /API/latest/admin/invoices response (camelCase). */
export type Invoice = {
    id: number;
    invNumber: string;
    date: string;
    dueDate: string;
    status: InvoiceStatus;
    total: number;
    subTotal: number;
    customer: { id: number; name: string };
    salesOrders?: Array<{ id: number; soNumber: string }>;
    balance?: { total: number; paid: number; outstanding: number; credited: number };
};

/** GET /API/invoices/:id (snake_case). Only what we read. */
export type InvoiceDetail = {
    id: number;
    inv_number: string;
    total: number;
    status: InvoiceStatus;
    balance: { total: number; paid: number; outstanding: number; credited: number };
    payments: Array<{
        id: number;
        amount: number;
        reference: string | null;
        description: string | null;
        invoice_payment?: { amount: number };
        payment_type?: { id: number; code: string };
    }>;
};

export type Payment = {
    id: number;
    amount: number;
    reference: string | null;
    description: string | null;
    date: string;
};

let invoiceStatuses: InvoiceStatus[] | null = null;
async function getInvoiceStatus(code: InvoiceStatusCode): Promise<InvoiceStatus> {
    invoiceStatuses ??= await portausRequest<InvoiceStatus[]>('GET', '/API/statuses/', { query: { type: 'INVOICE' } });
    const found = invoiceStatuses.find((s) => s.code === code);
    if (!found) throw new Error(`Portaus has no INVOICE status with code ${code}`);
    return found;
}

export async function getInvoice(id: number): Promise<InvoiceDetail> {
    return portausRequest<InvoiceDetail>('GET', `/API/invoices/${id}`);
}

/**
 * Creates the invoice for a sales order (same two calls as the "Facturer" button in the UI).
 * The invoice is stored as DRAFT unless another status is asked for.
 */
export async function createInvoiceForOrder(
    orderId: number,
    statusCode: InvoiceStatusCode = 'DRAFT'
): Promise<Invoice> {
    const draft = await portausRequest<any>('POST', '/API/latest/admin/invoices', {
        query: { salesOrdersId: orderId }
    });
    if (!draft || !Array.isArray(draft.lines)) {
        throw new PortausError(
            'Portaus returned no invoice draft for the order',
            200,
            '/API/latest/admin/invoices',
            draft
        );
    }

    // What the invoice editor adds before saving (CLONE_INVOICE mutation).
    const body = {
        ...draft,
        status: await getInvoiceStatus(statusCode),
        lines: draft.lines.map((l: any, i: number) => ({
            ...l,
            uuid: `web-inv-${i + 1}`,
            account: l.account === undefined ? null : l.account,
            discount: l.discount ?? { amount: null, creditType: null, netType: null, value: null }
        }))
    };
    return portausRequest<Invoice>('POST', '/API/latest/admin/invoices', { body });
}

export type RecordPaymentInput = {
    invoiceId: number;
    invNumber: string;
    customerId: number;
    amount: number;
    /** Stripe PaymentIntent id; also what makes the operation idempotent. */
    reference: string;
    description?: string;
    date?: Date;
    /** Payment type code from /API/payments/types; CREDIT_CARD by default. */
    typeCode?: string;
};

/** Records a manual payment against an invoice (what the payment dialog posts). */
export async function recordPayment(input: RecordPaymentInput): Promise<Payment> {
    return portausRequest<Payment>('POST', '/API/payments', {
        body: {
            payment: {
                automatic: false,
                type: input.typeCode ?? 'CREDIT_CARD',
                amount: Math.round(input.amount * 100) / 100,
                reference: input.reference,
                description: input.description ?? "Frais d'agence payés en ligne",
                date: (input.date ?? new Date()).toISOString(),
                customerId: input.customerId
            },
            invoices: [{ id: input.invoiceId, invNumber: input.invNumber }]
        }
    });
}

/** Agency fee + its taxes for a stored order: the part the customer pays us, not the SAQ. */
export function billableTotal(order: SalesOrder): number {
    const fees = order.lines.reduce(
        (sum, l) =>
            sum + l.qty * l.prices.filter((p) => p.label === 'PRODUCT_AGENCY_FEE').reduce((s, p) => s + p.price, 0),
        0
    );
    const taxes = order.taxes.reduce((sum, t) => sum + (t.billable ?? 0), 0);
    return Math.round((fees + taxes) * 100) / 100;
}

export type PartiallyPaidResult = {
    order: SalesOrder;
    invoice: InvoiceDetail;
    payment: Payment | null;
    /** true when the payment with this reference already existed and nothing was posted. */
    alreadyRecorded: boolean;
};

/**
 * Marks a web order as partially paid: makes sure it has an invoice, then records the online
 * payment against it. Safe to call twice with the same reference (the webhook may be retried):
 * an existing payment with that reference is detected and nothing is posted again.
 *
 * `amount` defaults to the order's billable total (agency fee + its taxes).
 */
export async function markOrderPartiallyPaid(
    orderId: number,
    opts: { reference: string; amount?: number; description?: string; date?: Date }
): Promise<PartiallyPaidResult> {
    const order = await getOrder(orderId);
    const orderInvoices = ((order as any).invoices ?? []) as OrderInvoiceRef[];
    const live = orderInvoices.find((i) => i.status?.code !== 'VOIDED');

    let invoiceId: number;
    let invNumber: string;
    if (live) {
        invoiceId = live.id;
        invNumber = live.invNumber;
        const existing = await getInvoice(invoiceId);
        if (existing.payments?.some((p) => p.reference === opts.reference)) {
            return { order, invoice: existing, payment: null, alreadyRecorded: true };
        }
    } else {
        const created = await createInvoiceForOrder(orderId);
        invoiceId = created.id;
        invNumber = created.invNumber;
    }

    const payment = await recordPayment({
        invoiceId,
        invNumber,
        customerId: order.customer.id,
        amount: opts.amount ?? billableTotal(order),
        reference: opts.reference,
        description: opts.description,
        date: opts.date
    });

    const [invoice, refreshed] = await Promise.all([getInvoice(invoiceId), getOrder(orderId)]);
    return { order: refreshed, invoice, payment, alreadyRecorded: false };
}

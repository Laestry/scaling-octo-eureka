/**
 * The client_secret is handed to /pay through sessionStorage rather than a query string —
 * it's a payment credential and has no business sitting in browser history, the address bar,
 * or a server access log.
 */
const KEY = 'portaus.checkout';

export type Checkout = {
    clientSecret: string;
    /** what Stripe actually charges — the agency fee, not the order total */
    amountBillable: number;
    total: number;
    salesOrderNumber: string | null;
    salesOrderId: number | null;
};

export function stashCheckout(c: Checkout) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(KEY, JSON.stringify(c));
}

export function readCheckout(): Checkout | null {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as Checkout;
    } catch {
        return null;
    }
}

export function clearCheckout() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(KEY);
}

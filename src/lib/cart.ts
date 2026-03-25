import { writable, derived, type Writable } from 'svelte/store';
import type { AlcoholProduct } from '$lib/models/pocketbase';

export type AlcoholProduct = {
    id: number; // from a.id
    name: string;
    category: number;
    specific_category: number;
    uvc: number;
    format: number;
    unit: string | null;
    volume: number;
    volume_and_format: string;

    organization_id: number | null;
    provider_id: number | null;
    country_id: number | null;
    region_name: string | null;

    tags: string[] | null;
    provider_display_name: string | null;

    batch_count: number; // bigint -> number
    total_quantity: number;
    oldest_sell_before_date: string | null; // ISO date

    vintages: number[]; // smallint[]

    oldest_batch_id: number | null;
    oldest_vintage: number | null;
    oldest_price: number | null; // numeric
    oldest_price_tax_in: number | null; // numeric
    oldest_calculated_quantity: number | null;

    website_slug: string | null;

    updated_at: string; // ISO timestamp
};

type CartProduct = AlcoholProduct & { quantity: number; selectedBatchId: string };
type Cart = CartProduct[];

type UnknownRecord = Record<string, unknown>;

function isFiniteInteger(n: unknown) {
    return Number.isInteger(n) && Number.isFinite(n as number);
}

function isValidCartEntry(x: unknown): x is CartProduct {
    if (!x || typeof x !== 'object') return false;
    const o = x as UnknownRecord;

    // required for cart ops
    const hasBatch = typeof o.selected_batch_id === 'number';
    const hasQty = isFiniteInteger(o.quantity) && (o.quantity as number) >= 0;

    // minimal product fields your code uses
    const hasId = 'id' in o;
    const hasUvc = typeof o.uvc === 'number' && Number.isFinite(o.uvc as number) && (o.uvc as number) >= 0;

    return hasBatch && hasQty && hasId && hasUvc;
}

export function isValidCartStructure(x: unknown): x is Cart {
    return Array.isArray(x) && x.every(isValidCartEntry);
}

function safeLoadCart(): Cart {
    if (typeof window === 'undefined') return [];
    const key = 'cart';
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (isValidCartStructure(parsed)) {
            // optional: normalize quantities to integers
            parsed.forEach((p: CartProduct) => (p.quantity = Math.max(0, Math.trunc(p.quantity))));
            return parsed as Cart;
        }
    } catch {
        // ignore and clear below
    }
    // invalid -> clear
    localStorage.removeItem(key);
    return [];
}

type CartStore = Writable<Cart> & {
    add: (item: AlcoholProduct, amount?: number) => void;
    remove: (selectedBatchId: string, amount?: number) => void;
    removeCompletely: (selectedBatchId: string) => void;
    clear: () => void;
};

let _cart: CartStore | undefined;

export function createCart(): CartStore {
    if (_cart) return _cart;

    const getInitialCart = (): Cart => safeLoadCart();

    const cartStore = writable<Cart>(getInitialCart());

    if (typeof window !== 'undefined') {
        cartStore.subscribe((cart: Cart) => {
            localStorage.setItem('cart', JSON.stringify(cart));
        });
    }

    function toStrId(v: string | number) {
        return String(v);
    }
    function toInt(v: unknown): number {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    function resolveBatchId(sel: string | number | { id: string | number }) {
        return typeof sel === 'object' && sel !== null ? toStrId(sel.id) : toStrId(sel as string | number);
    }
    // Returns bottles available for the *selected* batch when known.
    // If unknown, returns undefined and no cap will be applied.
    function resolveAvailableBottles(
        item: any,
        sel: string | number | { id: string | number; calculated_quantity?: number }
    ) {
        if (sel && typeof sel === 'object' && 'calculated_quantity' in sel && sel.calculated_quantity != null) {
            return toInt(sel.calculated_quantity);
        }
        const selId = resolveBatchId(sel);
        if (item?.oldest_batch_id != null && item.oldest_batch_id === selId) {
            return toInt(item.oldest_calculated_quantity);
        }
        return undefined;
    }

    _cart = {
        subscribe: cartStore.subscribe,
        set: cartStore.set,
        update: cartStore.update,

        add: (cartItem, amount = 1) => {
            // Use the selectedBatchId that's already in the cartItem
            const batchId = cartItem.selected_batch_id;

            cartStore.update((cart: CartProduct[]) => {
                const existingIndex = cart.findIndex((ci) => ci.selected_batch_id === batchId);
                const existing = existingIndex !== -1 ? cart[existingIndex] : undefined;

                const uvc = cartItem.uvc > 0 ? cartItem.uvc : 1;
                const availableBottles = cartItem.selected_calculated_quantity;
                const maxCases = availableBottles != null ? Math.floor(availableBottles / uvc) : undefined;
                const currentCases = existing ? existing.quantity : 0;

                let actualAdd = amount;
                if (maxCases != null) {
                    const remainingCases = maxCases - currentCases;
                    if (remainingCases <= 0) return cart;
                    actualAdd = Math.min(amount, remainingCases);
                }

                if (existing) {
                    return cart.map((ci, i) =>
                        i === existingIndex ? { ...ci, quantity: ci.quantity + actualAdd } : ci
                    );
                } else {
                    const newEntry: CartProduct = {
                        ...cartItem,
                        quantity: actualAdd
                    };
                    return [...cart, newEntry];
                }
            });
        },

        remove: (selected_batch_id: string, amount: number = 1) => {
            cartStore.update((cart: CartProduct[]) => {
                const id = selected_batch_id;
                const index = cart.findIndex((ci) => ci.selected_batch_id === id);
                if (index === -1) return cart;

                const ci = cart[index];
                if (ci.quantity > amount) {
                    return cart.map((c, i) => (i === index ? { ...c, quantity: c.quantity - amount } : c));
                } else {
                    return cart.filter((_, i) => i !== index);
                }
            });
        },

        removeCompletely: (selected_batch_id: string) => {
            const id = selected_batch_id;
            cartStore.update((cart: CartProduct[]) => cart.filter((ci) => ci.selected_batch_id !== id));
        },

        clear: () => {
            cartStore.set([]);
            if (typeof window !== 'undefined') localStorage.removeItem('cart');
        }
    };

    return _cart;
}

export const cart = createCart();

// total units safeguard for missing uvc
export const totalItems = derived(cart, ($cart) =>
    $cart.reduce((acc, item) => acc + item.quantity * ((item as any)?.uvc > 0 ? (item as any).uvc : 1), 0)
);

// quantity of a specific batch
export function getItemQuantityStore(selectedBatchId: string | number) {
    const id = String(selectedBatchId);
    return derived(cart, ($cart) => {
        const item = $cart.find((i) => String(i.selected_batch_id) === id);
        return item ? item.quantity : 0;
    });
}

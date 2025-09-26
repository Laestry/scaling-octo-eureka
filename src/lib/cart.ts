import { writable, derived, type Writable } from 'svelte/store';
import type { AlcoholProduct } from '$lib/models/pocketbase';

// Cart entry is keyed by selectedBatchId; batch implies the parent vin.
type CartProduct = AlcoholProduct & { quantity: number; selectedBatchId: string };
type Cart = CartProduct[];

// Define store types
type CartStore = Writable<Cart> & {
    add: (item: AlcoholProduct, selectedBatchId: string, amount?: number) => void;
    remove: (selectedBatchId: string, amount?: number) => void;
    removeCompletely: (selectedBatchId: string) => void;
    clear: () => void;
};

// Create a global variable to store our cart instance
let _cart: CartStore | undefined;

export function createCart(): CartStore {
    if (_cart) return _cart;

    const getInitialCart = (): Cart => {
        if (typeof window === 'undefined') return [];
        const storedCart = localStorage.getItem('cart');
        return storedCart ? (JSON.parse(storedCart) as Cart) : [];
    };

    const cartStore = writable<Cart>(getInitialCart());

    if (typeof window !== 'undefined') {
        cartStore.subscribe((cart: Cart) => {
            localStorage.setItem('cart', JSON.stringify(cart));
        });
    }

    _cart = {
        subscribe: cartStore.subscribe,
        set: cartStore.set,
        update: cartStore.update,
        add: (item: AlcoholProduct, selectedBatchId: string, amount: number = 1) => {
            if (!selectedBatchId) {
                throw new Error('selectedBatchId is required to add to cart');
            }
            const batchId = String(selectedBatchId);

            cartStore.update((cart: CartProduct[]) => {
                const existingIndex = cart.findIndex((ci) => String(ci.selectedBatchId) === batchId);
                const existing = existingIndex !== -1 ? cart[existingIndex] : undefined;

                // find the selected batch on the vin
                const batch: any = (item as any).alcohol_batches?.find((b: any) => String(b.id) === batchId);
                if (!batch) {
                    console.warn(`Selected batch ${batchId} not found on item`, item);
                    return cart; // could throw instead if you want stricter behavior
                }

                const uvc = (item as any).uvc || 1;
                const availableBottles = batch.calculated_quantity ?? batch.quantity ?? 0;
                const maxCases = uvc > 0 ? Math.floor(availableBottles / uvc) : 0;
                const currentCases = existing ? existing.quantity : 0;
                const remainingCases = maxCases - currentCases;

                if (remainingCases <= 0) {
                    // nothing left to add
                    return cart;
                }

                const actualAdd = Math.min(amount, remainingCases);

                if (existing) {
                    return cart.map((ci, i) =>
                        i === existingIndex ? { ...ci, quantity: ci.quantity + actualAdd } : ci
                    );
                } else {
                    const newEntry: CartProduct = { ...item, selectedBatchId: batchId, quantity: actualAdd };
                    return [...cart, newEntry];
                }
            });
        },
        remove: (selectedBatchId: string, amount: number = 1) => {
            cartStore.update((cart: CartProduct[]) => {
                const index = cart.findIndex((ci) => String(ci.selectedBatchId) === String(selectedBatchId));
                console.log('cart remove ', index, String(selectedBatchId));
                if (index === -1) return cart;

                const ci = cart[index];
                if (ci.quantity > amount) {
                    return cart.map((c, i) => (i === index ? { ...c, quantity: c.quantity - amount } : c));
                } else {
                    return cart.filter((_, i) => i !== index);
                }
            });
        },
        removeCompletely: (selectedBatchId: string) => {
            cartStore.update((cart: CartProduct[]) =>
                cart.filter((ci) => String(ci.selectedBatchId) !== String(selectedBatchId))
            );
        },
        clear: () => {
            cartStore.set([]);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart');
            }
        }
    };

    return _cart;
}

export const cart = createCart();

// total number of units (e.g., bottles) in cart
export const totalItems = derived(cart, ($cart) => $cart.reduce((acc, item) => acc + item.quantity * item.uvc, 0));

/**
 * Get the quantity of a specific batch in the cart
 * @param {string} selectedBatchId
 * @returns derived store with quantity (or 0)
 */
export function getItemQuantityStore(selectedBatchId: string | number) {
    return derived(cart, ($cart) => {
        const item = $cart.find((item) => String(item.selectedBatchId) === String(selectedBatchId));
        return item ? item.quantity : 0;
    });
}

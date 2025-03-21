// cart.ts
import { writable, derived, type Writable } from 'svelte/store';
import type { AlcoholProduct } from '$lib/models/pocketbase';

// Define a type for products in cart
type CartProduct = AlcoholProduct & { quantity: number };
type Cart = CartProduct[];

// Define store types
type CartStore = Writable<Cart> & {
    add: (item: AlcoholProduct, amount?: number) => void;
    remove: (itemId: string) => void;
    removeCompletely: (itemId: string) => void;
    clear: () => void;
};

// Create a global variable to store our cart instance
let _cart: CartStore | undefined;

// Create a writable store that initializes from localStorage if available
export function createCart(): CartStore {
    // If the cart already exists, return it
    if (_cart) return _cart;

    // Safe access to localStorage (handles SSR)
    const getInitialCart = (): Cart => {
        if (typeof window === 'undefined') return [];
        const storedCart = localStorage.getItem('cart');
        return storedCart ? (JSON.parse(storedCart) as Cart) : [];
    };

    // Create a writable store with the initial cart data
    const cartStore = writable<Cart>(getInitialCart());

    // Set up localStorage sync only in browser environment
    if (typeof window !== 'undefined') {
        cartStore.subscribe((cart: Cart) => {
            localStorage.setItem('cart', JSON.stringify(cart));
        });
    }

    // Create the cart store with additional methods
    _cart = {
        subscribe: cartStore.subscribe,
        set: cartStore.set,
        update: cartStore.update,
        add: (item: AlcoholProduct, amount: number = 1) => {
            cartStore.update((cart) => {
                const index = cart.findIndex((cartItem) => cartItem.id === item.id);
                if (index !== -1) {
                    return cart.map((cartItem, i) =>
                        i === index ? { ...cartItem, quantity: cartItem.quantity + amount } : cartItem
                    );
                } else {
                    return [...cart, { ...item, quantity: amount }];
                }
            });
        },
        remove: (itemId: string) => {
            cartStore.update((cart) => {
                const index = cart.findIndex((item) => item.id === itemId);
                if (index === -1) return cart;

                const item = cart[index];
                if (item && item.quantity > 1) {
                    return cart.map((cartItem, i) =>
                        i === index ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
                    );
                } else {
                    return cart.filter((_, i) => i !== index);
                }
            });
        },
        // New function to remove a product completely regardless of quantity
        removeCompletely: (itemId: string) => {
            cartStore.update((cart) => cart.filter((item) => item.id !== itemId));
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

// Export the cart store - this will be the same instance everywhere it's imported
export const cart = createCart();

// Derived store to calculate the total number of items in the cart
export const totalItems = derived(cart, ($cart) => $cart.reduce((acc, item) => acc + item.quantity, 0));

/**
 * Get the quantity of a specific item in the cart
 * @param {string} itemId - The ID of the item to check
 * @returns {number} - The quantity of the item in the cart, or 0 if not present
 */
export function getItemQuantityStore(itemId: string) {
    return derived(cart, ($cart) => {
        const item = $cart.find((item) => item.id === itemId);
        return item ? item.quantity : 0;
    });
}

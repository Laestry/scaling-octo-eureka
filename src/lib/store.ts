import { writable } from 'svelte/store';
import type { CartItem } from '$lib/cart';

export const cartStore = writable<CartItem[]>([]);

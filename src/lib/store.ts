import { writable } from 'svelte/store';

export const cartStore = writable();

cartStore.subscribe((value) => {
	console.log('cartstore', value);
}); // logs '0'

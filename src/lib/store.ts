import { writable } from 'svelte/store';

// Portaus only takes perso orders from the website, so the site always shows perso prices. Kept as a
// store so the price components keep one switch if resto ever comes back.
export let isPrixResto = writable(false);
export let isGrid = writable(true);

import { writable } from 'svelte/store';

// Resto/Perso price switch in the header. It also picks the checkout: perso orders are created and
// paid through Portaus, resto orders are emailed to the team.
export let isPrixResto = writable(true);
export let isGrid = writable(true);

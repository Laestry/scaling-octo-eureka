import { get, writable } from 'svelte/store';

export let isPrixResto = writable(true);
export let isGrid = writable(true);

isPrixResto.subscribe(() => {
    console.log(get(isPrixResto));
});

<script lang="ts">
	import type { Products } from '$lib/models/shopifyTypes';
	import ProductCard from './ProductCard.svelte';
	import { fade } from 'svelte/transition';
	export let products: Products | null = null;
</script>

<div class={$$props.class}>
	{#if products}
		<div in:fade class="flex flex-wrap gap-x-[16px] gap-y-[80px]">
			{#each products.edges as { node: product }}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<p class="absolute top-[50%] right-[50%]">Loading...</p>
	{/if}
</div>

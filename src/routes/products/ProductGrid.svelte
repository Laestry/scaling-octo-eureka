<script lang="ts">
	import type { Products } from '$lib/models/shopifyTypes';
	import ProductCard from './ProductCard.svelte';
	import { fade } from 'svelte/transition';
	export let searchResults: Products | null = null;
</script>

<div class={$$props.class}>
	<div in:fade class="flex flex-wrap gap-x-[16px] gap-y-[80px]">
		{#each searchResults.edges as { node: product }}
			<ProductCard {product} />
		{/each}
	</div>
</div>

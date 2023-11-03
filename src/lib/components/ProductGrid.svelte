<script lang="ts">
	import { onMount } from 'svelte';
	import { getProducts } from '$lib/shopify';
	import type { Products } from '$lib/models/shopifyTypes';
	import ProductCard from '$lib/components/ProductCard.svelte';

	let products: Products | null = null;

	onMount(async () => {
		products = await getProducts();
		console.log('productgrid', products);
	});
</script>

<div>
	{#if products}
		<div class="flex flex-wrap gap-x-[16px] gap-y-[80px] mt-[32px]">
			{#each products.edges as { node: product }}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<p>Loading...</p>
	{/if}
</div>

<script lang="ts">
	import ProductGrid from './ProductGrid.svelte';
	import FilterBar from '$lib/components/Filters/FilterBar.svelte';
	import SearchBar from '$lib/components/Filters/SearchBar.svelte';
	import { onMount } from 'svelte';
	import { getProducts } from '$lib/shopify';
	import type { Products } from '$lib/models/shopifyTypes';

	let products: Products | null = null;

	onMount(async () => {
		products = await getProducts();
		console.log('productgrid', products);
	});

	let enabledFilters;
</script>

<div class="uppercase">
	<SearchBar class="mt-[59px]" bind:enabledFilters />
	<FilterBar class="mt-[24px]" bind:enabledFilters />
	<ProductGrid class="mt-[32px]" bind:products />
</div>

<script lang="ts">
	import ProductGrid from './ProductGrid.svelte';
	import FilterBar from '$lib/components/Filters/FilterBar.svelte';
	import SearchBar from '$lib/components/Filters/SearchBar.svelte';
	import type { Products } from '$lib/models/shopifyTypes';
	import SearchResults from './SearchResults.svelte';

	export let data: Products | null = null;

	let enabledFilters;
	let searchResults: Products | null = null;
</script>

<div class="uppercase">
	<SearchBar class="mt-[59px]" bind:enabledFilters bind:searchResults />
	<FilterBar class="mt-[24px]" bind:enabledFilters />
	{#if searchResults}
		<SearchResults {searchResults} />
	{:else}
		<ProductGrid class="mt-[32px]" bind:products={data} />
	{/if}
</div>

<script lang="ts">
	import ProductGrid from './ProductGrid.svelte';
	import SearchBar from './Filters/SearchBar.svelte';
	import type { Products } from '$lib/models/shopifyTypes';
	import SearchResults from './SearchResults.svelte';

	export let data: Products | null = null;

	let enabledFilters;
	let defaultResult: Products | null = data;
	let searchResults: Products | null = data;
	let isGrid = true;
	console.log('first search', searchResults);
</script>

<div class="uppercase">
	<SearchBar bind:enabledFilters bind:searchResults {defaultResult} />
	{#if searchResults?.edges?.length}
		{#if isGrid}
			<ProductGrid class="mt-[32px]" {searchResults} />
		{:else}
			<SearchResults {searchResults} />
		{/if}
	{:else if searchResults.edges.length === 0}
		<div class="mt-[100px]">No Wines found under that search</div>
	{/if}
</div>

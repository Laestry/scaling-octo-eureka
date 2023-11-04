<script lang="ts">
	import { searchProducts } from '$lib/shopify';
	import { debounce } from '$lib/utils';
	import type { Products } from '$lib/models/shopifyTypes';

	export let enabledFilters;
	let searchString = '';
	let searchResults: Products | null = null;

	const debouncedSearch = debounce(async (query: string) => {
		if (searchString === '') {
			searchResults = null;
			return;
		}
		searchResults = await searchProducts(query);
		console.log(searchResults);
	}, 500);

	function clearFilters() {
		searchString = '';
		searchResults = null;
		enabledFilters = [];
	}
</script>

<div class="flex items-end gap-[8px] h-[32px] {$$props.class}">
	<div>Search</div>
	<div class="flex flex-1">
		<div class="flex-1 flex">
			<input
				class="flex-1 border-b focus:outline-none"
				bind:value={searchString}
				on:input={() => {
					debouncedSearch(searchString);
				}}
			/>
		</div>

		{#if searchResults && searchResults.edges.length > 0}
			<div class="absolute">
				<div class="relative bg-white border top-[25px]">
					{#each searchResults.edges as { node: product }}
						<div>{product.title}</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
	<img src="/icons/search.svg" alt="" class="h-[24px]" />
</div>
<div class="flex justify-between mt-[24px]">
	<div>All Wines</div>
	<div on:click={clearFilters}>Clear Filter</div>
</div>

<script lang="ts">
	import { searchProducts } from '$lib/shopify';
	import { debounce } from '$lib/utils';
	import type { Products } from '$lib/models/shopifyTypes';

	export let enabledFilters;
	export let defaultResult;
	export let searchString = '';
	export let searchResults: Products | null = null;

	const debouncedSearch = debounce(async (query: string) => {
		if (searchString === '') {
			searchResults = defaultResult;
			return;
		}
		searchResults = await searchProducts(query);

		console.log('search', searchResults);
		console.log('search', searchResults.edges);
	}, 500);

	function clearFilters() {
		searchString = '';
		searchResults = null;
		enabledFilters = [];
	}
</script>

<div>
	<div class="flex items-end gap-[8px] h-[40px] bg-[#fff] border-b mt-[56px]">
		<div class="flex flex-1">
			<div class="flex-1 flex">
				<input
					class="flex-1 focus:outline-none"
					bind:value={searchString}
					on:input={() => {
						debouncedSearch(searchString);
					}}
				/>
			</div>
		</div>
		<img src="/icons/search.svg" alt="" class="h-[24px] mb-[7px] mr-[8px]" />
	</div>
</div>
<!--<div class="flex justify-between mt-[24px]">-->
<!--	<div class="h4">All Wines</div>-->
<!--	<button on:click={clearFilters} class="h4">Clear Filter</button>-->
<!--</div>-->

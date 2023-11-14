<script>
	import Filter from '$lib/components/Filters/Filter.svelte';

	export let enabledFilters = [];
</script>

<div class="flex flex-wrap justify-between flex-1 gap-y-[16px] {$$props.class}">
	<Filter>Style +</Filter>
	<Filter>Color +</Filter>
	<Filter>Varietal +</Filter>
	<Filter>Producer +</Filter>
	<Filter>Region +</Filter>
	<Filter>Price +</Filter>
</div>

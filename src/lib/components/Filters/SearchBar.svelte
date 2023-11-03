<script lang="ts">
	let search = '';
</script>

<div class="flex items-end gap-[8px] h-[32px] {$$props.class}">
	<div>Search</div>
	<input class="flex-1 border-b focus:outline-none" bind:value={search} />
	<img src="/icons/search.svg" alt="" class="h-[24px]" />
</div>
<div class="flex justify-between mt-[24px]">
	<div>All Wines</div>
	<div>Clear Filter</div>
</div>

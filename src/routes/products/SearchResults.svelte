<script lang="ts">
	import { getNumberFromId } from '$lib/utils.js';
	import type { Products } from '$lib/models/shopifyTypes';
	import { fade } from 'svelte/transition';

	export let searchResults: Products | null = null;

	function navigateToProduct(productId) {
		const numberId = getNumberFromId(productId);
		window.location.href = `/products/${numberId}`;
	}
</script>

<div in:fade class="mt-[28px]">
	{#if searchResults && searchResults.edges.length > 0}
		<table class="">
			<tr>
				<th class="w-[40px]" />
				<th class="w-[206px]">Product</th>
				<th class="w-[100px]">Vintage</th>
				<th class="w-[218px]">Winemaker</th>
				<th class="w-[114px]">Color</th>
				<th class="w-[202px]">Region</th>
				<th class="w-[109px]">PPbtl</th>
				<th class="w-[93px]">ml/btl</th>
				<th class="w-[40px]" />
			</tr>
			{#each searchResults.edges as { node: product }}
				<tr on:click={() => navigateToProduct(product.id)} class="cursor-pointer">
					<td class="!p-0 flex items-center justify-center">
						<img height="24" src="/icons/searchzoomin.svg" alt="" />
					</td>
					<td class=" truncate">{product.title}</td>
					<td>{product.year?.value ?? ''}</td>
					<td>{product.producer?.value ?? ''}</td>
					<td>{product.color?.value ?? ''}</td>
					<td>{product.region?.value ?? ''}</td>
					<td
						>{Number.parseFloat(product.variants.edges[0]?.node?.priceV2?.amount).toFixed(0) ??
							''}$</td
					>
					<td class=" lowercase"> {product.ml?.value ?? ''}ml</td>
					<td class="!p-0 flex items-center justify-center">
						<img height="24" src="/icons/heart.svg" alt="" />
					</td>
				</tr>
			{/each}
		</table>
	{:else if searchResults.edges.length === 0}
		<div class="mt-[100px]">No Wines found under that search</div>
	{/if}
</div>

<style>
	table {
		table-layout: fixed;
		width: 100%; /* Adjust as needed */
	}

	th {
		text-align: start;
		font-size: 16px;
		font-weight: 500;
		line-height: 100%;
		padding: 8px 16px;
		border-bottom: 1px solid var(--border--02);
		height: 48px;
	}

	td {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-transform: capitalize;
		font-size: 16px;
		font-weight: 300;
		line-height: 100%;
		padding: 8px 16px;
		border-bottom: 1px solid var(--border--02);
		height: 48px;
	}
</style>

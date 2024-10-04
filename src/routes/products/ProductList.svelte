<script lang="ts">
	import { getNumberFromId } from '$lib/utils.js';
	import type { Products } from '$lib/models/shopifyTypes';
	import { fade } from 'svelte/transition';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';

	export let searchResults: Products | null = null;

	function navigateToProduct(productId) {
		const numberId = getNumberFromId(productId);
		window.location.href = `/products/${numberId}`;
	}
</script>

<div in:fade class="mt-[32px]">
	{#if searchResults && searchResults.edges.length > 0}
		<table class="">
			<tr>
				<th class="w-[289px]">
					Nom
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M12.0465 9.61998L7.99979 13.6666L3.95312 9.61998M7.99979 2.33331V13.5533"
							stroke="black"
							stroke-width="1.5"
							stroke-miterlimit="10"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</th>
				<th class="w-[193p]">
					Vigneron
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M12.0465 9.61998L7.99979 13.6666L3.95312 9.61998M7.99979 2.33331V13.5533"
							stroke="black"
							stroke-width="1.5"
							stroke-miterlimit="10"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</th>
				<th class="w-[94px]">
					Mil.
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M12.0465 9.61998L7.99979 13.6666L3.95312 9.61998M7.99979 2.33331V13.5533"
							stroke="black"
							stroke-width="1.5"
							stroke-miterlimit="10"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</th>
				<th class="w-[98px]">
					Type
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M12.0465 9.61998L7.99979 13.6666L3.95312 9.61998M7.99979 2.33331V13.5533"
							stroke="black"
							stroke-width="1.5"
							stroke-miterlimit="10"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</th>
				<th class="w-[191px]">
					Regrion
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M12.0465 9.61998L7.99979 13.6666L3.95312 9.61998M7.99979 2.33331V13.5533"
							stroke="black"
							stroke-width="1.5"
							stroke-miterlimit="10"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</th>
				<th class="w-[96px]">Format</th>
				<th class="w-[175px]">$</th>
			</tr>
			{#each searchResults.edges as { node: product }}
				<tr on:click={() => navigateToProduct(product.id)} class="cursor-pointer">
					<td class="truncate">{product.title}</td>
					<td>{product.producer?.value ?? ''}</td>
					<td>{product.year?.value ?? ''}</td>
					<td>{product.color?.value ?? ''}</td>
					<td>{product.region?.value ?? ''}</td>
					<td>
						{('count' in product ? product.count : undefined) || ''} x {product.ml?.value ?? ''}ml
					</td>
					<td>
						{Number.parseFloat(product.variants.edges[0]?.node?.priceV2?.amount).toFixed(0) ?? ''}$ /C
						<br />
						<span class="gray">
							{Math.round(parseFloat(product.variants.edges[0]?.node?.priceV2?.amount) / 6) || ''}$ /B
						</span>
					</td>
				</tr>
			{/each}
		</table>
	{/if}
</div>

<style>
	table {
		table-layout: fixed;
		width: 100%; /* Adjust as needed */
		background: white;
	}
	tr {
		border-bottom: 1px solid var(--border--02);
	}
	th {
		color: #000;
		font-size: 12px;
		font-style: normal;
		font-weight: 500;
		line-height: 100%; /* 12px */
		padding: 16px 0;
		text-align: left;
	}

	th > svg {
		margin-left: 8px;
		display: inline;
	}
	th:first-child,
	td:first-child {
		padding-left: 8px;
	}
	th:last-child,
	td:last-child {
		padding-right: 8px;
		text-align: right;
	}

	td > span.gray {
		color: #949494;
	}

	td {
		color: #000;
		font-size: 16px;
		font-style: normal;
		padding: 16px 0;
		font-weight: 400;
		line-height: 100%; /* 16px */
	}
</style>

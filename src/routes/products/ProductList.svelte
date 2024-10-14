<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Product } from '$lib/server/prisma';
	import { goto } from '$app/navigation';
	import { originFormat, priceFormat, volumeFormat } from '../product/[slug]/utils';

	export let products: Product[];
</script>

<div in:fade class="mt-[32px]">
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
		{#each products as product (product.id)}
			<tr on:click={() => goto(`/products/${product.slug}`)} class="cursor-pointer">
				<td class="truncate">{product.name || '-'}</td>
				<td>
					{#if product.providerName}
						{#if product.providerSite}
							<a href={product.providerSite || '#'}>{product.providerName}</a>
						{:else}
							{product.providerName}
						{/if}
					{/if}
				</td>
				<td>{product.vintage || '-'}</td>
				<td>{product.specificCategory || '-'}</td>
				<td>{originFormat(product)}</td>
				<td>
					{product.quantity} x {volumeFormat(product)}
				</td>
				<td>
					{priceFormat(product)} / C
					<br />
					<span class="gray">
						{priceFormat(product)} / B
					</span>
				</td>
			</tr>
		{/each}
	</table>
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

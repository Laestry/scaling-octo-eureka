<script lang="ts">
	import type { PageData } from './$types';
	import { alcoholFormat, volumeFormat, priceFormat, originFormat } from './utils';

	export let data: PageData;
	$: console.log('data', data);
	$: product = data.product;
</script>

<div class="product">
	<div>no image</div>
	{#if product.name}
		<div>name: {product.name}</div>
	{/if}
	<div>alcohol: {alcoholFormat(product)}</div>
	<div>unit: {product.unit}</div>
	<div>quantity: {product.quantity}</div>
	<div>volume: {volumeFormat(product)}</div>
	<div>price: {priceFormat(product)}</div>
	{#if product.providerName}
		<div>
			provider:
			<a href={product.providerSite || '#'}>{product.providerName}</a>
		</div>
	{/if}
	{#if product.shortDescription}
		<div>shortDescription: {product.shortDescription}</div>
	{/if}
	{#if product.fullDescription}
		<div>fullDescription: {@html product.fullDescription}</div>
	{/if}
	<div>origin: {originFormat(product)}</div>
	{#if product.category}
		<div>category: {product.category}</div>
	{/if}
	{#if product.specificCategory}
		<div>specificCategory: {product.specificCategory}</div>
	{/if}
</div>

<style>
	.product {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}
</style>

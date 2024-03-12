<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';
	import { getNumberFromId } from '$lib/utils.js';
	import { addToCart } from '$lib/cart';

	export let product: ProductNode;
	export let size = 's';
</script>

<div title={product.title} class="{size}w">
	<a href="/products/{getNumberFromId(product.id)}">
		<img
			class="bg-no-repeat object-cover bg-center {size} "
			src={product.images.edges[0].node.originalSrc}
			alt="Wine"
		/>
		<div class="flex justify-between mt-[7px]">
			<div class="flex flex-col product-name uppercase w-full" style="width: calc(100% - 80px)">
				<b> {product.title}</b>
				<div>
					{product?.producer?.value ?? 'N/A'}, {product?.year?.value ?? 'N/A'}
				</div>
			</div>
			<div class="flex flex-col items-end">
				<div class="product-price">${parseInt(product.variants.edges[0].node.priceV2.amount)}</div>
				<button
					class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap"
					on:click|preventDefault={() => {
						addToCart(product, 1);
					}}>ADD +</button
				>
			</div>
		</div>
		<!-- <div class="flex justify-between mt-[7px]">
		</div>
		<div class="flex justify-between mt-[7px] product-name">

		</div> -->
	</a>
</div>

<style>
	.s {
		width: 176px;
		height: 243px;
	}
	.m {
		width: 272px;
		height: 376px;
	}
	.l {
		width: 368px;
		height: 505px;
	}

	.sw {
		width: 176px;
	}
	.mw {
		width: 272px;
	}
	.lw {
		width: 368px;
	}

	.product-name {
		font-family: Overpass, sans-serif;
		font-size: 14px;
		font-style: normal;
		font-weight: 400;
		line-height: 150%; /* 18px */
		text-transform: capitalize;
	}

	.product-price {
		font-family: Overpass, sans-serif;
		font-size: 14px;
		font-style: normal;
		font-weight: 700;
		line-height: 150%; /* 18px */
		text-transform: capitalize;
	}

	.product-name b {
		font-weight: 700;
	}
</style>

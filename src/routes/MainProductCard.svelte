<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';
	import { getNumberFromId } from '$lib/utils.js';

	export let product: ProductNode;
	export let big = false;
</script>

<div class={big ? 'w-[560px] ' : 'w-[272px] '} title={product.title}>
	<a href="/products/{getNumberFromId(product.id)}">
		<img
			class="bg-no-repeat object-cover bg-center {big
				? 'w-[560px] h-[814px]'
				: 'w-[272px] h-[376px]'} "
			src={product.images.edges[0].node.originalSrc}
			alt="Wine"
		/>
		<div
			class="flex flex-col items-center
	  				 mt-[7px]"
		>
			<div class="product-name t1 uppercase truncate w-full text-center">{product.title}</div>
			<div class="product-price">${parseInt(product.variants.edges[0].node.priceV2.amount)}</div>
		</div>
	</a>
</div>

<style>
	.product-name {
		font-family: Overpass, sans-serif;
		font-size: 12px;
		font-style: normal;
		font-weight: 400;
		line-height: 150%; /* 18px */
		text-transform: capitalize;
	}

	.product-price {
		font-family: Overpass, sans-serif;
		font-size: 12px;
		font-style: normal;
		font-weight: 700;
		line-height: 150%; /* 18px */
		text-transform: capitalize;
	}
</style>

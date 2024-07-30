<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';
	import { getNumberFromId } from '$lib/utils.js';
	import { addToCart } from '$lib/cart';

	export let contacts = false;
	export let product: ProductNode | any;
	export let size = 's';
</script>

<div title={contacts ? '@wardetassocies' : product.title} class="{size}w {$$props.class} card {contacts ? 'card--contacts' : ''}">
	<a href="{contacts ? '#' : `/products/${getNumberFromId(product.id)}`}">
		<img
			class="bg-no-repeat object-cover bg-center {size} "
			src={contacts ? '/images/thirstyPerson.png' : product.images.edges[0].node.originalSrc}
			alt="Wine"
		/>
		<div class="flex justify-between mt-[7px]">
			<div class="flex flex-col product-name uppercase w-full" style="width: calc(100% - 80px)">
				{#if !contacts}
				<b> {product.title}</b>
				<div>
					{product?.producer?.value ?? 'N/A'}, {product?.year?.value ?? 'N/A'}
				</div>
				{:else}
				<b>@wardetassocies</b>
				<div>
					Insert one line caption if you want
				</div>
				{/if}
			</div>
			{#if !contacts}
				<div class="flex flex-col items-end">
					<div class="product-price">${parseInt(product.variants.edges[0].node.priceV2.amount)}</div>
					<button
						class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap"
						on:click|preventDefault={() => {
							addToCart(product, 1);
						}}>ADD +</button
					>
				</div>
			{/if}
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
	@media (max-width: 1119px) {
		.s {
			width: 118px;
			height: 156px;
		}
		.m {
			width: 181px;
			height: 241px;
		}
		.l {
			width: 245px;
			height: 328px;
		}
		.sw {
			width: 118px;
			height: 224px;
		}
		.mw {
			width: 181px;
			height: 283px;
		}
		.lw {
			width: 245px;
			height: 370px;
		}
		.product-name {
			font-size: 11px;
		}
		.product-price {
			font-size: 11px;
		}
	}
	@media (max-width: 767px) {
		.s {
			width: 94px;
			height: 125px;
		}
		.m {
			width: 145px;
			height: 193px;
		}
		.l {
			width: 196px;
			height: 262px;
		}
		.sw {
			width: 94px;
			height: auto;
		}
		.mw {
			width: 145px;
			height: auto;
		}
		.lw {
			width: 196px;
			height: auto;
		}
	}
</style>

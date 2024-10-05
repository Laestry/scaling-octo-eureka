<script lang="ts">
	import type { Product } from '$lib/server/db';
	import { alcoholFormat, volumeFormat, priceFormat, originFormat } from '../../routes/product/[slug]/utils';

	export let product: Product;
	export let size: 's' | 'm' | 'l' = 's';

	function add() {}
</script>

<div class="product {size}">
	<img
		class="bg-no-repeat object-cover bg-center img {size}"
		src={'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_fb1c9cb7-8ab1-4037-a915-913d2c638b8a.png?v=1706118993'}
		alt="Wine"
	/>
	<div class="flex justify-between mt-[7px] w-full">
		<div class="flex flex-col uppercase w-full product-name" style="width: calc(100% - 80px)">
			<b>{product.name || '-'}</b>
			<div class="flex">
				{#if product.providerName}
					{#if product.providerSite}
						<a href={product.providerSite || '#'}>{product.providerName}</a>
					{:else}
						<div>{product.providerName}</div>
					{/if}
				{/if}
				{#if product.vintage}
					,
					<span>{product.vintage}</span>
				{/if}
			</div>
		</div>
		<div class="flex flex-col items-end">
			<div class="product-price">
				{priceFormat(product)}
			</div>
			<button class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap" on:click={() => add()}>
				ADD +
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.product {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;

		&.s {
			width: 176px;
			@media (max-width: 1119px) {
				width: 118px;
				height: 224px;
			}
			@media (max-width: 767px) {
				width: 94px;
				height: auto;
			}
		}
		&.m {
			width: 272px;
			@media (max-width: 1119px) {
				width: 181px;
				height: 283px;
			}
			@media (max-width: 767px) {
				width: 145px;
				height: auto;
			}
		}
		&.l {
			width: 368px;
			@media (max-width: 1119px) {
				width: 245px;
				height: 370px;
			}
			@media (max-width: 767px) {
				width: 196px;
				height: auto;
			}
		}

		.img {
			&.s {
				width: 176px;
				height: 243px;
				@media (max-width: 1119px) {
					width: 118px;
					height: 156px;
				}
				@media (max-width: 767px) {
					width: 94px;
					height: 125px;
				}
			}
			&.m {
				width: 272px;
				height: 376px;
				@media (max-width: 1119px) {
					width: 181px;
					height: 241px;
				}
				@media (max-width: 767px) {
					width: 145px;
					height: 193px;
				}
			}
			&.l {
				width: 368px;
				height: 505px;
				@media (max-width: 1119px) {
					width: 245px;
					height: 328px;
				}
				@media (max-width: 767px) {
					width: 196px;
					height: 262px;
				}
			}
		}

		.product-name {
			font-family: 'Riposte', sans-serif;
			font-size: 14px;
			font-style: normal;
			font-weight: 400;
			line-height: 150%; /* 18px */
			text-transform: capitalize;

			b {
				font-weight: 700;
			}

			@media (max-width: 1119px) {
				font-size: 11px;
			}
		}

		.product-price {
			font-family: 'Riposte', sans-serif;
			font-size: 14px;
			font-style: normal;
			font-weight: 700;
			line-height: 150%; /* 18px */
			text-transform: capitalize;

			@media (max-width: 1119px) {
				font-size: 11px;
			}
		}
	}
</style>

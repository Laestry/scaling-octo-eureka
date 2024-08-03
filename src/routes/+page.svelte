<script lang="ts">
	import type { Products, ProductData } from '$lib/models/shopifyTypes';
	import MainProductCard from './MainProductCard.svelte';
	import Header from '$lib/components/Header.svelte';

	export let data: ProductData;
	let products: Products = data.products;
	console.log('products', products);
</script>

<!-- <Header page="main" color="#DE6643" class="absolute top-0 left-2/4 translate-x-[-50%] z-10" /> -->
<!-- <div class="backdrops">
</div> -->

<div class="flex flex-col items-center">
	<div class="flex flex-col min-h-[90vh] w-full lg:max-w-[1212px] px-[38px] md:max-w-[836px] max-w-[376px]">
		<div class="md:flex-row flex-col-reverse flex md:mt-[134px] gap-[20px] my-[80px] md:mb-[137px]">
			<div class="h3 description max-w-[844px] text-color1">
				Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus
				quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
			</div>
			<div class="flex gap-[14px]">
				<div class=" w-[15px] h-[15px] min-w-[15px] rounded-full bg-color1"></div>
				<div class=" w-[15px] h-[15px] min-w-[15px] rounded-full bg-colorPurple"></div>
				<div class=" w-[15px] h-[15px] min-w-[15px] rounded-full bg-colorBlue"></div>
			</div>
		</div>

		<div class="title mb-[19px]">Nos vins</div>
		<div class="card__row flex lg:gap-x-[16px] gap-x-[10px] md:gap-x-[11px] gap-y-[20px] lg:mb-[39px] mb-[20px] flex-wrap">
			<MainProductCard product={products.edges[0].node} size="m" />
			<MainProductCard product={products.edges[1].node} size="s" />
			<MainProductCard product={products.edges[2].node} size="l" />
			<MainProductCard product={products.edges[3].node} size="m" />
		</div>

		<div class="card__row card__row--reverse flex lg:gap-x-[16px] gap-x-[10px] md:gap-x-[11px] gap-y-[20px] lg:mb-[39px] mb-[20px] flex-wrap">
			<MainProductCard product={products.edges[5].node} size="l" />
			<MainProductCard product={products.edges[6].node} size="m" />
			<MainProductCard product={products.edges[7].node} size="s" />
			<MainProductCard product={products.edges[8].node} size="m" />
		</div>

		<div class="card__row flex lg:gap-x-[16px] gap-x-[10px] md:gap-x-[11px] gap-y-[20px] flex-wrap">
			<MainProductCard product={products.edges[9].node} size="m" />
			<MainProductCard product={products.edges[10].node} size="s" />
			<MainProductCard contacts size="l" />
			<MainProductCard product={products.edges[11].node} size="m" />
		</div>

		<div class="description2 lg:mt-[113px] lg:mb-[180px] my-[80px] text-color1">
			We place human values at the heart of our experience and in the origin of the importLeo justo
			enim et in. Aliquam at feugiat tortor purus quis eu ultrices quis tincidunt.
		</div>

		<div class="card__row card__row--reverse flex lg:gap-x-[16px] gap-x-[10px] md:gap-x-[11px] gap-y-[20px] flex-wrap mb-[62px]">
			<MainProductCard product={products.edges[12].node} size="l" />
			<MainProductCard product={products.edges[13].node} size="m" />
			<MainProductCard product={products.edges[14].node} size="s" />
			<MainProductCard product={products.edges[15].node} size="m" />
		</div>
<!--
		<a href="/products" class="main-page-button self-end">
			Encore plus <span class="text-color5">+</span>
		</a> -->
	</div>
	<div class="instablock" >
		<div class="lg:max-w-[1212px] px-[38px] md:max-w-[836px] max-w-[376px] mx-auto container">
			<button class="instablock__button">@wardetassocies</button>
			<p class="instablock__title">
				Never miss a drop. <br>
				Follow us and find out about tasting events, parties, drops, team and winemakers.
			</p>
		</div>
	</div>
</div>

<style lang="scss">
	.instablock {
		margin-bottom: -53px;
		background: #DA5899;
		width: 100%;
		padding: 64px 0;
		&__button {
			color: #000;
			text-align: center;
			font-size: 12px;
			font-style: normal;
			font-weight: 500;
			line-height: 150%; /* 18px */
			letter-spacing: -0.132px;
			padding: 4px 12px;
			border-radius: 12px;
			background: white;
		}
		.container {
			display: flex;
			align-items: flex-start;
			gap: 32px;
			flex-direction: column-reverse;
		}
		&__title {
			color: #F6F1F2;
			font-size: 50px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
		}
	}
	.card {
		&__text {
			width: 100%;
			font-size: 12px;
			line-height: 18px;
			b {
				font-weight: 700;
			}
		}
	}
	.description {
		font-family: 'Riposte', sans-serif;
		font-size: 32px;
		font-style: normal;
		font-weight: 400;
		line-height: 42px;
	}

	.title {
		font-family: 'Riposte', sans-serif;
		font-size: 30px;
		font-style: normal;
		font-weight: 700;
		line-height: 125%;
	}

	.description2 {
		font-family: 'Riposte', sans-serif;
		font-size: 52px;
		font-style: normal;
		font-weight: 500;
		line-height: 62px;
	}

	.main-page-button {
		font-family: 'Riposte', sans-serif;
		font-size: 30px;
		font-style: normal;
		font-weight: 700;
		line-height: 125%;
	}
	@media (max-width: 1119px) {
		.description {
			font-size: 20px;
			line-height: 125%;
		}
		.description2 {
			font-size: 35px;
			line-height: 42px;
		}
		.instablock {
			&__title {
				font-size: 35px;
			}
		}
	}
	@media (max-width: 767px) {
		.instablock {
			padding: 40px 0;
			&__title {
				font-size: 24px;
			}
		}
		.card {
			&__row {
			:global(.card:nth-child(1)) {
				order: 1;
			}
			:global(.card:nth-child(2)) {
				order: 4;
			}

			:global(.card:nth-child(3)) {
				order: 3;
			}

			:global(.card:nth-child(4)) {
				order: 2;
			}
			&--reverse {
				:global(.card:nth-child(1)) {
					order: 4;
				}
				:global(.card:nth-child(2)) {
					order: 1;
				}

				:global(.card:nth-child(3)) {
					order: 3;
				}

				:global(.card:nth-child(4)) {
					order: 2;
				}
			}
		}
		}
	}
</style>

<script lang="ts">
	import type { Products, ProductData } from '$lib/models/shopifyTypes';
	import MainProductCard from './MainProductCard.svelte';
	import Header from '$lib/components/Header.svelte';

	export let data: ProductData;
	let products: Products = data.products;
	console.log('products', products);
</script>

<Header page="main" color="#DE6643" class="absolute top-0 left-2/4 translate-x-[-50%] z-10" />
<!-- <div class="backdrops">
</div> -->

<div class="flex flex-col items-center">
	<div class="flex flex-col min-h-[90vh] lg:w-[1136px] md:w-[680px] w-[358px]">
		<div class="flex mt-[134px] mb-[137px]">
			<div class="h3 description max-w-[844px] text-color1">
				Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus
				quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
			</div>
			<div class="ml-auto mt-2 w-[15px] h-[15px] rounded-full bg-color1"></div>
			<div class="ml-[14px] mt-2 w-[15px] h-[15px] rounded-full bg-colorPurple"></div>
			<div class="ml-[14px] mt-2 w-[15px] h-[15px] rounded-full bg-colorBlue"></div>
		</div>

		<div class="title mb-[19px]">Nos vins</div>
		<div class="flex gap-x-[16px] mb-[39px] flex-wrap">
			<MainProductCard product={products.edges[0].node} size="m" />
			<MainProductCard product={products.edges[1].node} size="s" />
			<MainProductCard product={products.edges[2].node} size="l" />
			<MainProductCard product={products.edges[3].node} size="m" />
		</div>

		<div class="flex gap-x-[16px] mb-[39px] flex-wrap">
			<MainProductCard product={products.edges[5].node} size="l" />
			<MainProductCard product={products.edges[6].node} size="m" />
			<MainProductCard product={products.edges[7].node} size="s" />
			<MainProductCard product={products.edges[8].node} size="m" />
		</div>

		<div class="flex gap-x-[16px] mb-[171px]">
			<MainProductCard product={products.edges[9].node} size="m" />
			<MainProductCard product={products.edges[10].node} size="s" />
			<img
				class="w-[367px] h-[517px]"
				src="/images/thirstyPerson.png"
				alt="person drowsed in wine"
			/>
			<MainProductCard product={products.edges[11].node} size="m" />
		</div>

		<div class="description2 mt-[113px] mb-[180px] text-color1">
			We place human values at the heart of our experience and in the origin of the importLeo justo
			enim et in. Aliquam at feugiat tortor purus quis eu ultrices quis tincidunt.
		</div>

		<div class="flex gap-x-[16px] flex-wrap mb-[62px]">
			<MainProductCard product={products.edges[12].node} size="l" />
			<MainProductCard product={products.edges[13].node} size="m" />
			<MainProductCard product={products.edges[14].node} size="s" />
			<MainProductCard product={products.edges[15].node} size="m" />
		</div>

		<a href="/products" class="main-page-button self-end">
			Encore plus <span class="text-color5">+</span>
		</a>
	</div>
</div>

<style>
	.description {
		font-family: Overpass, sans-serif;
		font-size: 32px;
		font-style: normal;
		font-weight: 400;
		line-height: 42px;
	}

	.title {
		font-family: Overpass, sans-serif;
		font-size: 30px;
		font-style: normal;
		font-weight: 700;
		line-height: 125%;
	}

	.description2 {
		font-family: Overpass, sans-serif;
		font-size: 52px;
		font-style: normal;
		font-weight: 500;
		line-height: 62px;
	}

	.main-page-button {
		font-family: Overpass, sans-serif;
		font-size: 30px;
		font-style: normal;
		font-weight: 700;
		line-height: 125%;
	}
</style>

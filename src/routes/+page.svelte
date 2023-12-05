<script lang="ts">
	import type { Products } from '$lib/models/shopifyTypes';
	import MainProductCard from './MainProductCard.svelte';
	import Header from '$lib/components/Header.svelte';

	export let data: Products;
	let products: Products = data.products;
	console.log('products', products.edges[0]);
</script>

<Header color="#DE6643" class="-mb-[176px]" />
<div class="backdrop" />

<div class="flex flex-col items-center">
	<div class="min-h-[90vh] lg:w-[1136px] md:w-[680px] w-[358px]">
		<div class="h3 description mt-[61px] mb-[71px]">
			Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus
			quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
		</div>

		<div class="title mb-[15px]">Our Wines</div>
		<div class="flex gap-x-[16px]">
			<div class="flex-1">
				<MainProductCard product={products.edges[0].node} big={true} />
			</div>
			<div class="flex flex-wrap gap-x-[16px] gap-y-[20px]">
				<MainProductCard product={products.edges[1].node} />
				<MainProductCard product={products.edges[2].node} />
				<MainProductCard product={products.edges[3].node} />
				<MainProductCard product={products.edges[4].node} />
			</div>
		</div>

		<div class="description2 mt-[113px] mb-[126px]">
			We place human values at the heart of our experience and in the origin of the import.
		</div>
		<div class="flex gap-x-[16px]">
			<div class="flex flex-wrap gap-x-[16px] gap-y-[20px]">
				<MainProductCard product={products.edges[5].node} />
				<MainProductCard product={products.edges[6].node} />
				<MainProductCard product={products.edges[7].node} />
				<MainProductCard product={products.edges[8].node} />
			</div>
			<img
				class="w-[560px] h-[814px]"
				src="/images/thirstyPerson.png"
				alt="person drowsed in wine"
			/>
		</div>

		<div class="flex gap-x-[16px] mt-[62px] mb-[52px]">
			<div class="flex-1">
				<MainProductCard product={products.edges[9].node} big={true} />
			</div>
			<div class="flex flex-wrap gap-x-[16px] gap-y-[20px]">
				<MainProductCard product={products.edges[10].node} />
				<MainProductCard product={products.edges[11].node} />
				<MainProductCard product={products.edges[12].node} />
				<MainProductCard product={products.edges[13].node} />
			</div>
		</div>

		<a href="/products" class="main-page-button">
			Find more <span class="text-color5">+</span>
		</a>
	</div>
</div>

<style>
	.backdrop {
		width: 100%;
		height: 772px;
		background-image: url('/images/mainbackdrop.png');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
	}

	.description {
		font-family: Overpass, sans-serif;
		font-size: 32px;
		font-style: normal;
		font-weight: 400;
		line-height: 42px;
	}

	.title {
		font-family: Overpass, sans-serif;
		font-size: 32px;
		font-style: normal;
		font-weight: 500;
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
		font-weight: 500;
		line-height: 125%;
	}
</style>

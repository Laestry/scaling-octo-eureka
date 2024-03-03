<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';
	import Accordion from '$lib/components/Accordion.svelte';
	import ProductTags from './ProductTags.svelte';
	import { onMount } from 'svelte';
	import MiniProductCard from '$lib/components/MiniProductCard.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import { cartStore } from '$lib/store';
	import { addToCart } from '$lib/cart';
	import ProductCard from '../ProductCard.svelte';

	export let data;
	let product: ProductNode;
	$: product = data.product;
	$: activeSlide = 0;
	$: allText = false;
	$: count = 0
	let recommendedProducts;

	onMount(async () => {
		console.log(product);
		const productId = product.id;
		const response = await fetch('/api/getRecommendedProducts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ productId })
		});

		recommendedProducts = await response.json();
		if(recommendedProducts.length === undefined) {
			recommendedProducts = null
			console.log(recommendedProducts)
		}
	});

	console.log(product);
</script>

<div class="mt-[40px]">
	<div>
		<!-- <a href="/products">
			<button><img src="/icons/arrow.svg" alt="back" /></button>
		</a> -->

		<div class="flex gap-[32px] mt-[16px] items-end">
			<div class="relative min-w-[462px] w-[462px] h-[639px]">
				<button 
					class="absolute z-[1] left-0 bottom-0 w-[271px] h-[375px]"
					class:z-[4]={activeSlide === 0}
					on:click={() => (activeSlide = 0)}
				>
					<img
						class="object-cover w-full h-full"
						src={product?.images?.edges[0]?.node?.originalSrc}
						alt="Wine"
					/>
				</button>
				<button 
					class="absolute z-[2] left-[12px] bottom-0 w-[450px] h-[591px]"
					class:z-[4]={activeSlide === 2}
					on:click={() => (activeSlide = 2)}
				>
					<img
						class="object-cover w-full h-full"
						src={product?.images?.edges[0]?.node?.originalSrc}
						alt="Wine"
					/>
				</button>
				<button 
					class="absolute z-[3] left-[12px] bottom-0 w-[374px] h-[639px]"
					class:z-[4]={activeSlide === 1}
					on:click={() => (activeSlide = 1)}
				>
					<img
						class="object-cover w-full h-full"
						src={product?.images?.edges[0]?.node?.originalSrc}
						alt="Wine"
					/>
				</button>
			</div>

			<div class="flex flex-col">
				<ProductTags {product} />
				<h1 class="product-title mt-[12px]">{product.title}</h1>
				<div class="product-description mt-4 h-[125px] max-w-[366px] overflow-auto">
					{@html allText ? product?.descriptionHtml || '' : product?.descriptionHtml?.slice(0, 168) + '...' || ''}
					{#if !allText} 
						<button on:click={() => (allText = true)}>+</button>
					{/if}
					<!-- {product?.descriptionHtml} -->
				</div>
				<!-- <div class="od my-[16px] h-[304px] w-[448px] overflow-hidden">
				</div> -->
				<!-- <div class="flex gap-[42px] items-center">
					<div class="tpr p-[8px] w-fit" style="border-bottom: 1px solid var(--border--02);">
						<div>
							<span class="tpb">R</span>
							{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount / 6) ?? 'N/A'}$/btl
						</div>
						<div class="text-contents">
							<span class="tpb">P</span>
							{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount) ?? 'N/A'}$/btl
						</div>
					</div>
					<button
						on:click={() => {
							addToCart(product, 1);
						}}
						class="button px-[9px] py-[12px] rounded-[4px] border"
					>
						add to cart
					</button>
					<FavoriteButton />
				</div> -->
				<div class="w-[464px] mt-4">
					<div class="flex product-table " >
						<div class="flex flex-col min-w-[280px] w-[280px] border-r-[1px] border-r-[#E859EB]">
							<p class="product-table__type">Type de vin</p>
							<p class="product-table__description">
								<b class="font-bold">{product.title ?? 'N/A'}</b>
								<br>
								{product?.varietal?.value ?? 'N/A'}
								<br>
								{product?.year?.value ?? 'N/A'}
								<br>
								{product?.count ?? 'N/A'} x {product?.ml?.value ?? 'N/A'}
							</p>
						</div>
						<div class="flex flex-col py-2 w-full">
							<p class="product-table__price">{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount / 6) ?? 'N/A'} $ / B</p>
							<p class="product-table__price">{parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount) ?? 'N/A'} $ / C</p>
						</div>
					</div>
					<div class="flex pt-4 pb-8 border-b-[1px] border-b-[#DE6643] relative justify-between">
						<div class="flex flex-col gap-2">
							<p class="product-table__count">Quantité /caisse de 6</p>
							<div class="product-table-counter">
								<p class="product-table-counter__value">{count}</p>
								<div class="flex flex-col">
									<button class="product-table-counter__button" on:click={() => count++}>+</button>
									<button class="product-table-counter__button" on:click={() => count > 0 ? count-- : count}>-</button>
								</div>
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<button class="product-table__button">Ajouter à ma liste</button>
							<button class="product-table__button">Ajouter au panier</button>
						</div>
						<p class="absolute text-[16px] bg-[#F6F1F2] text-[#DE6643] bottom-[-12px] pr-1">*</p>
						<button class="product-table__favorite">
							<svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M5.75514 14.4777C4.92965 13.7961 3.91602 12.88 3.06162 11.8219C2.35851 10.9511 0.999901 9.07663 1 6.62155C1.00013 3.51674 3.71008 0.999883 7.05285 1C9.44853 1.00008 11.5191 2.29293 12.5 4.1684C13.481 2.29286 15.5516 1 17.9474 1C21.2901 1 24 3.51695 24 6.62176C24 9.07676 22.6414 10.9512 21.9383 11.8219C21.0839 12.88 20.0703 13.7961 19.2448 14.4777C15.7624 17.3527 15.5953 17.0834 12.5 19C10.1847 17.5664 7.84151 16.2002 5.75514 14.4777Z" fill="white" stroke="#F04F30" stroke-linejoin="round"/>
							</svg>
						</button>
					</div>
					<p class="product-table__description">
						Le prix inclut les taxes et le frais d’agent de 16%.
						<br>
						<a href="#">C’est quoi le 16%?</a>
						<br>
						<a href="#">Je paie combien, à qui, quand?</a>
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-[20px] flex flex-col gap-[13px]">
		{#if recommendedProducts}
			<div class="flex flex-col pt-[13px] px-[13px] border-t-[1px] border-t-[#000]">
				<p class="recommended__title">Si vous aimez ceci, vous aimerez aussi...</p>
				<div class="flex gap-4">
					{#each recommendedProducts?.slice(0, 4) as p}
						<ProductCard product={p} />
					{/each}
				</div>
			</div>
		{/if}
		<!-- <Accordion title="You might also like">
			{#if recommendedProducts}
				<div class="flex gap-[32px] mt-[16px]">
					{#each recommendedProducts.slice(0, 4) as p}
						<MiniProductCard title={p.handle} image={p.featured_image} id={p.id} />
					{/each}
				</div>
			{/if}
		</Accordion> -->
		<Accordion title="Du même producteur">
			<div>body</div>
		</Accordion>
		<Accordion title="De la même région">
			<div>body</div>
		</Accordion>
		<Accordion title="Vu récemment">
			<div>body</div>
		</Accordion>
	</div>
</div>
<style>
.product-title {
	color: #191C1C;
	font-size: 32px;
	font-style: normal;
	font-weight: 400;
	line-height: 42px; /* 131.25% */
}
.product-description {
	color: #191C1C;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%; /* 19.2px */
}
.product-description button {
	color: #DE6643;
}
.product-description :global(p) {
	display: inline;
}
.product-table {
	border-top: 1px solid #4975B8;
	border-bottom: 1px solid #000;
}
.product-table__price {
	color: #1E1E1E;
	text-align: right;
	font-size: 16px;
	font-style: normal;
	font-weight: 700;
	line-height: 120%; /* 19.2px */
	text-transform: capitalize;
}
.product-table__type {
	color: #1E1E1E;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%; /* 19.2px */
	padding: 8px 0px;
	border-bottom: 1px solid #DE6643;
}
.product-table__description {
	color: #1E1E1E;
	padding: 8px 0px;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%;
}
.product-table__description a {
	color: #4975B8;
	font-family: Overpass;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%;
	text-decoration-line: underline;
}
.product-table__button {
	border-radius: 12px;
	background: rgba(45, 99, 176, 0.50);
	width: 176px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #F6F1F2;
	text-align: center;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%; /* 19.2px */
}
.product-table__button:last-child {
	background: #2D63B0;
}
.product-table__count {
	color: #1E1E1E;
	font-family: Overpass;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%; /* 19.2px */
}
.product-table__favorite {
	top: 20px;
	left: calc(100% + 70px);
	position: absolute;
}
.product-table-counter {
	margin-top: 14px;
	display: flex;
	gap: 5px;
	align-items: center;
}
.product-table-counter__value {
	color: #F6F1F2;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: Overpass;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%; /* 19.2px */
	border-radius: 12px;
	background: #2D63B0;
	width: 46px;
	height: 24px;
}
.product-table-counter__button {
	width: 17px;
	height: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: #1E1E1E;
	text-align: center;
	font-family: Overpass;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 120%; /* 19.2px */
}
</style>
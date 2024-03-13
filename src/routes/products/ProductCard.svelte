<script lang="ts">
	import Tag from './Tag.svelte';
	import type { ProductNode, VariantNode } from '$lib/models/shopifyTypes';
	import { getNumberFromId } from '$lib/utils.js';

	export let product: ProductNode;

	// Assuming the first variant is the bottle and the second variant is the case
	const bottleVariant: VariantNode | undefined = product.variants.edges[0]?.node;
	const caseVariant: VariantNode | undefined = product.variants.edges[1]?.node;

	const bottlePrice: number = bottleVariant ? bottleVariant.priceV2.amount : 'N/A';

	console.log(product);
</script>

<a href="/products/{getNumberFromId(product.id)}">
	<div class="lg:w-[272px] md:max-w-none max-w-[272px]">
		<img
			src={product.images.edges[0]?.node.originalSrc || '/defaultImages/product-image.png'}
			alt="product"
			class="h-[376px] mb-[4px] w-full bg-no-repeat object-cover"
			style="object-fit: cover;"
		/>
		<div class="flex justify-between pt-4 gap-4">
			<div class="flex flex-col">
				<p class="type">
					Type de vin
					<br><br>
					<b class="font-bold">{product.title ?? 'N/A'}</b>
					<br>
					{product?.varietal?.value ?? 'N/A'}, {product?.region?.value ?? 'N/A'},
					<br>
					6 x {product?.ml?.value ?? 'N/A'}
				</p>
			</div>
			<div class="flex flex-col">
				<p class="price">{parseInt(bottlePrice / 6) ?? 'N/A'} $ / B</p>
				<p class="price">{parseInt(bottlePrice) ?? 'N/A'} $ / C</p>
			</div>
		</div>
		<!-- <div class="border-y-2 px-[16px] py-[8px]">
			<div class="t1">{product.title}</div>
			<div class="flex flex-wrap justify-between gap-y-[14px] mt-[12px]">
				<Tag>{product?.producer?.value ?? 'N/A'}</Tag>
				<Tag>{product?.color?.value ?? 'N/A'}</Tag>
				<Tag>{product?.ml?.value ?? 'N/A'}ml</Tag> 
				<div class="flex justify-between w-full">
					<Tag>{Math.trunc(bottlePrice)} CAD/Btl.</Tag>
					<Tag>{Math.trunc(bottlePrice * 6)} CAD/Caisse</Tag>
				</div>
			</div>
		</div> -->
	</div>
</a>

<style>
.price {
	color: #1E1E1E;
	text-align: right;
	font-size: 12px;
	font-style: normal;
	font-weight: 700;
	line-height: 150%; /* 18px */
	text-transform: capitalize;
}
.type {
	color: #1E1E1E;
	font-family: Overpass;
	font-size: 12px;
	font-style: normal;
	line-height: 150%; /* 18px */
}
</style>

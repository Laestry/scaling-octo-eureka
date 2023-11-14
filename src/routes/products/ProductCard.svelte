<script lang="ts">
	import Tag from './Tag.svelte';
	import type { ProductNode, VariantNode } from '$lib/models/shopifyTypes';
	import { getNumberFromId } from '$lib/utils.js';

	export let product: ProductNode;

	// Assuming the first variant is the bottle and the second variant is the case
	const bottleVariant: VariantNode | undefined = product.variants.edges[0]?.node;
	const caseVariant: VariantNode | undefined = product.variants.edges[1]?.node;

	const bottlePrice: number = bottleVariant ? bottleVariant.priceV2.amount : 'N/A';
</script>

<a href="/products/{getNumberFromId(product.id)}">
	<div class="lg:w-[362px] md:w-[332px] md:max-w-none max-w-[358px]">
		<img
			src={product.images.edges[0]?.node.originalSrc || '/defaultImages/product-image.png'}
			alt="product"
			class="h-[469px] mb-[4px] w-full bg-no-repeat object-cover"
			style="object-fit: cover;"
		/>
		<div class="border-y-2 px-[16px] py-[8px]">
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
		</div>
	</div>
</a>

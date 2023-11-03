<script lang="ts">
	import Tag from '$lib/components/Tag.svelte';
	import type { MoneyValue, ProductNode } from '$lib/models/shopifyTypes';

	export let product: ProductNode;

	let parsedCasePrice: MoneyValue | null = null;
	if (product?.case_price?.value) {
		try {
			parsedCasePrice = JSON.parse(product.case_price.value);
		} catch (e) {
			console.error('Error parsing case_price.value:', e);
		}
	}
</script>

<div class="lg:w-[362px] md:w-[332px] md:max-w-none max-w-[358px]">
	<img
		src={product.images.edges[0]?.node.originalSrc || '/defaultImages/product-image.png'}
		alt="product"
		class="h-[469px] mb-[4px]"
	/>
	<div class="border-y-2 px-[16px] py-[8px]">
		<div class="uppercase">{product.title}</div>
		<div class="flex flex-wrap gap-x-[23px]">
			<Tag>{product?.brand?.value ?? 'N/A'}</Tag>
			<Tag>{product?.color?.value ?? 'N/A'}</Tag>
			<Tag>Nbr. x {product?.ml?.value ?? 'N/A'}ml</Tag>
			<Tag>PPB.00 CAD / Btl.</Tag>
			<Tag>Btl.{parsedCasePrice?.amount ?? 'N/A'} CAD / Caisse</Tag>
		</div>
	</div>
</div>

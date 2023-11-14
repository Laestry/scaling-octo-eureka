<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';

	export let product: ProductNode;
</script>

<div class="cop">
	<div class="flex gap-[8px]">
		<div class="productTag uppercase">{product?.title ?? 'N/A'}</div>
		<div class="productTag">{product?.varietal?.value ?? 'N/A'}</div>
		<div class="productTag">{product?.region?.value ?? 'N/A'}</div>
	</div>
	<div class="flex gap-[8px]">
		<div class="productTag">{product?.year?.value ?? 'N/A'}</div>
		<div class="productTag">{product?.color?.value ?? 'N/A'}</div>
		<div class="productTag">{product?.producer?.value ?? 'N/A'}</div>
	</div>
	<div class="flex gap-[8px]">
		<div class="productTag">{product?.ml?.value ?? 'N/A'}ml</div>
		<div class="productTag">6 bottles per case</div>
	</div>
</div>

<style>
	.productTag {
		padding: 16px 8px;
		border-bottom: 1px solid var(--border--02);
	}
</style>

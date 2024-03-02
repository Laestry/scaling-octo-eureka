<script lang="ts">
	import type { ProductNode } from '$lib/models/shopifyTypes';

	export let product: ProductNode;
</script>

<div class="flex justify-between">
	<p class="flex flex-wrap max-w-[368px] productTag">
		Tag {product?.title ?? 'N/A'},
		Tag {product?.varietal?.value ?? 'N/A'},
		Tag {product?.region?.value ?? 'N/A'},
		Tag {product?.year?.value ?? 'N/A'},
		Tag {product?.color?.value ?? 'N/A'},
		Tag {product?.producer?.value ?? 'N/A'},
		Tag {product?.ml?.value ?? 'N/A'}ml,
		Tag 6 bottles per case
	</p>
	<a href="#" class="passport">Fiche technique complète</a>
</div>

<style>
.productTag {
	color: #2D63B0;
	font-family: Overpass;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: 150%; 
}
.passport {
	color: #2D63B0;
	text-align: right;
	font-family: Overpass;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: 150%; /* 18px */
	text-decoration-line: underline;
}
</style>

<script lang="ts">
	import Tag from '$lib/components/Tag.svelte';
	import type { ProductNode } from '$lib/models/shopifyTypes';

	export let product: ProductNode;
</script>

<div class="lg:w-[362px] md:w-[332px] md:max-w-none max-w-[358px]">
	<img src="/defaultImages/product-image.png" alt="product" class="h-[469px] mb-[4px]" />
	<div class="border-y-2 px-[16px] py-[8px]">
		<div class="uppercase">{product.title}</div>

		<div class="flex flex-wrap gap-x-[23px]">
			{#each Array(5) as _}
				<Tag class="my-[5px]" />
			{/each}
		</div>
	</div>
</div>

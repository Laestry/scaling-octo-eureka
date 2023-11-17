<script lang="ts">
	import type { Collections } from '$lib/models/shopifyTypes';
	import MiniProductCard from '$lib/components/MiniProductCard.svelte';
	import { getNumberFromId } from '$lib/utils.js';

	export let data: Collections;

	console.log(data);
</script>

<div>
	<div class="h-[450px]">
		<h1 class="ml-[97px] mt-[20px]">
			<span>WARD &</span> <br />
			<span>ASSOCIés</span>
		</h1>
	</div>
	<div class="bg-secondary px-[192px] py-[147px]">
		<h2>Welcome</h2>
		<div class="h3 mt-[18px]">
			Lorem ipsum dolor sit amet consectetur. Leo justo enim et in. Aliquam at feugiat tortor purus
			quis eu ultrices quis tincidunt. Tellus integer egestas lectus ac.
		</div>
	</div>

	<div class="flex flex-col gap-[96px] mt-[96px]">
		{#each data.edges as { node: collection }, i}
			<div class={i % 2 ? 'self-end' : ''}>
				<h3>{collection.title}</h3>
				<div class="flex gap-[43px] mt-[18px]">
					{#each collection.products.edges as { node: p }}
						<MiniProductCard
							title={p.title}
							image={p.images.edges[0].node.originalSrc}
							id={getNumberFromId(p.id)}
						/>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

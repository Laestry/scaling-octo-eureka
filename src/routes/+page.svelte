<script lang="ts">
	import { onMount } from 'svelte';
	import { getProducts } from '$lib/shopify';
	import type { Products } from '$lib/models/shopifyTypes';

	let products: Products | null = null;

	onMount(async () => {
		products = await getProducts();
	});
</script>

{#if products}
	<ul>
		{#each products.edges as { node: product }}
			<li>
				<h2>{product.title}</h2>
			</li>
		{/each}
	</ul>
{:else}
	<p>Loading...</p>
{/if}

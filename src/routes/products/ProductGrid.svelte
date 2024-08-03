<script lang="ts">
	import type { Products } from '$lib/models/shopifyTypes';
	import ProductCard from './ProductCard.svelte';
	import { fade } from 'svelte/transition';
	export let searchResults: Products | null = null;
</script>

<div class={$$props.class}>
	<div in:fade class="products-grid">
		{#each searchResults.edges as { node: product }}
			<ProductCard {product} />
		{/each}
	</div>
</div>

<style lang="scss">
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
    gap: 20px 12px;
  }
  @media screen and (max-width: 1199px) {
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }

  @media screen and (max-width: 767px) {
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
  }
</style>

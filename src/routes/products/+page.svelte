<script lang="ts">
    import ProductGrid from './ProductGrid.svelte';
    import ProductList from './ProductList.svelte';
    import Filters from './Filters/Filters.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    $: products = data.products.items;

    $: console.log('products', products);

    let isGrid = true;
</script>

<div>
    <Filters bind:isGrid />
    {#if products.length === 0}
        <div class="mt-[100px]">No Wines found under that search</div>
    {:else if isGrid}
        <ProductGrid class="mt-[32px]" {products} />
    {:else}
        <ProductList {products} />
    {/if}
</div>

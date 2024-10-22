<script lang="ts">
    import ProductCardNew from '$lib/components/ProductCardNew.svelte';
    import type { Product } from '$lib/server/prisma';
    import { fade } from 'svelte/transition';

    export let products: Product[];
</script>

<div class={$$props.class}>
    <div in:fade class="products-grid">
        {#each products as product (product.id)}
            <ProductCardNew {product} />
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

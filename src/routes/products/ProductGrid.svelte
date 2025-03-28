<script lang="ts">
    import ProductCard from './ProductCard.svelte';
    import { fade } from 'svelte/transition';

    export let products: any[];
</script>

<div class={$$props.class}>
    <div in:fade class="products-grid">
        {#each products as product}
            <ProductCard {product} size="v" />
        {/each}
    </div>
</div>

<style lang="scss">
    .products-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        row-gap: 40px;
        justify-content: space-between;
        @media screen and (max-width: 1136px) {
            row-gap: 20px;
        }
    }
    @media screen and (max-width: 1136px) {
        .products-grid {
            //grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
    }

    @media screen and (max-width: 767px) {
        .products-grid {
            //grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
    }
</style>

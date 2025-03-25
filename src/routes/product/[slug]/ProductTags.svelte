<script lang="ts">
    import type { AlcoholProduct } from '$lib/models/pocketbase';

    export let product: AlcoholProduct;
</script>

<div class="flex justify-between {$$props.class}">
    <p class="flex flex-wrap max-w-[368px] gap-1 productTag">
        {#if product.tags.length === 0}
            no tags
        {:else}
            {#each product.tags as tag}
                <a href="/products?tag={tag}">{tag}</a>
            {/each}
        {/if}
        {#if product.originRegion}
            <a href="/products?region={product.originRegion}">{product.originRegion}</a>
        {/if}
    </p>
    <a href="#" class="passport">Fiche technique complète</a>
</div>

<style lang="scss">
    .productTag a {
        text-decoration: underline;
    }
    .productTag {
        color: #2d63b0;
        font-family: 'Riposte';
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%;
    }
    .passport {
        color: #2d63b0;
        text-align: right;
        font-family: 'Riposte';
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 18px */
        text-decoration-line: underline;
    }
</style>

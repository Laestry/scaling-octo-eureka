<script lang="ts">
    import type { AlcoholProduct } from '$lib/models/pocketbase';

    export let product: AlcoholProduct;
</script>

<div class="flex justify-between {$$props.class}">
    <p class="tags flex flex-wrap max-w-[368px] gap-1 productTag">
        {#if product.tags.length > 0}
            {#each product.tags as tag}
                <a href="/products?tag={tag}">{tag}</a>
            {/each}
        {/if}

        {#if product.providerName}
            <a href="/products?producer={product.providerName}">{product.providerName}</a>
        {/if}

        {#if product.originRegion}
            <a href="/products?region={product.originRegion}">{product.originRegion}</a>
        {/if}

        {#if product.specificCategory}
            <a href="/products?specificCategory={product.specificCategory}">{product.specificCategory}</a>
        {/if}

        {#if product.lblFormat}
            <a href="/products?lblFormat={product.lblFormat}">{product.lblFormat}</a>
        {/if}

        {#if product.vintage}
            <a href="/products?vintage={product.vintage}">{product.vintage}</a>
        {/if}
    </p>

    <a href="#" class="passport">Fiche technique complète</a>
</div>

<style lang="scss">
    .tags a {
        text-transform: uppercase;
    }
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

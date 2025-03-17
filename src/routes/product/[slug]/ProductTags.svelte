<script lang="ts">
    import type { Product } from '$lib/server/prisma';

    export let product: Product;
</script>

<div class="flex justify-between">
    <p class="flex flex-wrap max-w-[368px] gap-1 productTag">
        {#if product.tags.length === 0}
            no tags
        {:else}
            {#each product.tags as tag}
                <a href="/products?{tag}">{tag}</a>
            {/each}
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

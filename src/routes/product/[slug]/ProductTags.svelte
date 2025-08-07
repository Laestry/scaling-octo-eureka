<script lang="ts">
    import type { AlcoholProduct } from '$lib/models/pocketbase';

    // helper to URI-encode JSON values exactly the way the filters expect
    const j = (o: any) => encodeURIComponent(typeof o === 'string' ? o : JSON.stringify(o));

    export let product: AlcoholProduct;

    /* ------------------------------------------------------------------
     * Build links that match the new short-key filter scheme:
     *   p  – producer      (stringified {"id", "name"})
     *   r  – region        (stringified {"country_id","region_name"})
     *   cat – category     "category_specificCategory"
     *   f  – format/volume (stringified {"volume","format"})
     *   v  – vintage       number
     * ------------------------------------------------------------------*/

    // Producer
    $: producerHref = product?.parties
        ? `/products?p=${j({ id: product.parties.id, name: product.parties.display_name })}`
        : undefined;

    // Region
    $: regionHref =
        product?.country_id != null || product?.region_name != null
            ? `/products?r=${j({ country_id: product.country_id, region_name: product.region_name })}`
            : undefined;

    // Category / specificCategory
    $: categoryHref =
        product?.category != null && product?.specific_category != null
            ? `/products?cat=${product.category}_${product.specific_category}`
            : undefined;

    // Format / volume
    $: formatHref =
        product?.volume != null || product?.format != null
            ? `/products?f=${j({ volume: product.volume, format: product.format })}`
            : undefined;

    // Vintage
    $: vintageHref = product?.vintage ? `/products?v=${product.vintage}` : undefined;
</script>

<div class="flex justify-between md:flex-row flex-col md:gap-0 gap-2.5 {$$props.class}">
    <p class="tags flex flex-wrap gap-1 productTag justify-start lg:max-w-[368px] max-w-[253px]">
        <!-- keep your original optional tags block here if/when you re-enable it -->

        {#if producerHref}
            <a href={producerHref}>{product.parties?.display_name}</a>
        {/if}

        {#if regionHref}
            <a href={regionHref}>{product.originRegion}</a>
        {/if}

        <!--{#if categoryHref}-->
        <!--    <a href={categoryHref}>{product.specificCategory}</a>-->
        <!--{/if}-->

        <!--        {#if formatHref}-->
        <!--            <a href={formatHref}>{product.lblFormat}</a>-->
        <!--        {/if}-->

        {#if vintageHref}
            <a href={vintageHref}>{product.vintage}</a>
        {/if}
    </p>

    <a href="#" class="passport whitespace-nowrap"> Fiche technique complète </a>
</div>

<style lang="scss">
    .tags a {
        text-transform: uppercase;
        white-space: nowrap;
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

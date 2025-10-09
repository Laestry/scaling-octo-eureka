<!--src/routes/vins/ProductList.svelte-->
<script lang="ts">
    import { fade } from 'svelte/transition';
    import { isPrixResto } from '$lib/store';
    import ProductRow from './ProductRow.svelte';
    import type { AlcoholProduct } from '$lib/cart';
    import { onMount } from 'svelte';

    export let isPDF = false;
    export let products: AlcoholProduct[];

    let wrap: HTMLDivElement;
    const SCALE = 0.656934;
    onMount(() => {
        if (!isPDF) return;
        // measure unscaled height then set a scaled placeholder height
        const h = wrap.scrollHeight;
        wrap.style.height = `${h * SCALE}px`;
    });
</script>

<div bind:this={wrap} class="relative" style={`${isPDF ? 'position:relative; overflow:hidden;' : ''}`}>
    <div
        id="pdfContent"
        in:fade
        class=" productTable {$$props['class']}"
        class:mt-[32px]={!isPDF}
        style={`${isPDF ? 'transform:scale(0.656934); transform-origin:0 0; width:1096px;' : ''}`}
    >
        <table class="">
            <tr class="border-b border-[#181C1C33]">
                <th class="w-[151px]"> Region </th>
                <th class="w-[193px]"> Vigneron </th>
                <th class="w-[289px]"> Vin </th>
                <th class="w-[94px]"> Mil. </th>
                <th class="w-[98px]"> Type </th>
                <th class="w-[96px]"> Format </th>
                <th class="w-[175px] !text-end !pr-[5px]" style="font-family: 'Riposte', 'serif'">
                    $ {$isPrixResto ? 'Resto' : 'Perso'}
                </th>
                {#if !isPDF}
                    <th class="w-[40px]" />
                {/if}
            </tr>

            {#each products as product}
                <ProductRow {isPDF} {product} class="productRow" />
            {/each}
        </table>
    </div>
</div>

<style lang="scss">
    :global(.productTable:not(:has(th:hover)):has(tr:hover) tr:not(:hover)) {
        filter: blur(0.8px);
    }

    :global(.productRow tr) {
        transition: filter 0.3s ease;
    }

    table {
        table-layout: fixed;
        width: 100%; /* Adjust as needed */
        background: white;
    }

    th {
        height: 48px;
        color: #000;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 100%; /* 12px */
        padding: 16px 0;
        text-align: left;
    }

    th > :global(.icon) {
        margin-left: 8px;
        display: inline;
    }

    :global(td) {
        color: #000;
        font-size: 16px;
        font-style: normal;
        padding: 16px 0;
        font-weight: 400;
        line-height: 100%; /* 16px */
    }
</style>

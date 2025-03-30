<script lang="ts">
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { priceFormat } from '../product/[slug]/utils';
    import { IconArrow1 } from '$lib/icons';
    import type { AlcoholProduct } from '$lib/models/pocketbase';
    import { isPrixResto } from '$lib/store';
    import ProductRow from './ProductRow.svelte';

    export let products: AlcoholProduct[];
</script>

<div in:fade class="mt-[32px] productTable">
    <table class="">
        <tr>
            <th class="w-[191px]">
                Region
                <!--                <IconArrow1/>-->
            </th>
            <th class="w-[193px]">
                Vigneron
                <!--                <IconArrow1/>-->
            </th>
            <th class="w-[289px]">
                Vin
                <!--                <IconArrow1/>-->
            </th>
            <th class="w-[94px]">
                Mil.
                <!--                <IconArrow1/>-->
            </th>
            <th class="w-[98px]">
                Type
                <!--                <IconArrow1/>-->
            </th>
            <th class="w-[96px]">
                Format
                <!--                <IconArrow1/>-->
            </th>
            <th class="w-[175px] !text-end !pr-[5px]" style="font-family: 'Riposte', 'serif'">
                $ {$isPrixResto ? 'Resto' : 'Perso'}
            </th>
            <th class="w-[40px]" />
        </tr>

        {#each products as product}
            <ProductRow {product} class="productRow" />
        {/each}
    </table>
</div>

<style lang="scss">
    :global(.productTable:not(:has(th:hover)):has(tr:hover) tr:not(:hover)) {
        filter: blur(2px);
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

    td {
        color: #000;
        font-size: 16px;
        font-style: normal;
        padding: 16px 0;
        font-weight: 400;
        line-height: 100%; /* 16px */
    }
</style>

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

<div in:fade class="mt-[32px]">
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
            <th class="w-[175px]"> $ {$isPrixResto ? 'Resto' : 'Perso'}</th>
        </tr>
        {#each products as product (product.id)}
            <ProductRow {product} />
        {/each}
    </table>
</div>

<style lang="scss">
    table {
        table-layout: fixed;
        width: 100%; /* Adjust as needed */
        background: white;
    }
    tr {
        border-bottom: 1px solid var(--border--02);
    }
    th {
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
    th:first-child,
    td:first-child {
        padding-left: 8px;
    }
    th:last-child,
    td:last-child {
        padding-right: 8px;
        text-align: right;
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

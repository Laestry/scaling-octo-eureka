<script lang="ts">
    import { fade } from 'svelte/transition';
    import type { Product } from '$lib/server/prisma';
    import { goto } from '$app/navigation';
    import { originFormat, priceFormat, volumeFormat } from '../product/[slug]/utils';
    import { IconArrow1 } from '$lib/icons';

    export let products: Product[];
</script>

<div in:fade class="mt-[32px]">
    <table class="">
        <tr>
            <th class="w-[289px]">
                Nom
                <IconArrow1></IconArrow1>
            </th>
            <th class="w-[193p]">
                Vigneron
                <IconArrow1></IconArrow1>
            </th>
            <th class="w-[94px]">
                Mil.
                <IconArrow1></IconArrow1>
            </th>
            <th class="w-[98px]">
                Type
                <IconArrow1></IconArrow1>
            </th>
            <th class="w-[191px]">
                Regrion
                <IconArrow1></IconArrow1>
            </th>
            <th class="w-[96px]">Format</th>
            <th class="w-[175px]">$</th>
        </tr>
        {#each products as product (product.id)}
            <tr on:click={() => goto(`/products/${product.slug}`)} class="cursor-pointer">
                <td class="truncate">{product.name || '-'}</td>
                <td>
                    {#if product.providerName}
                        {#if product.providerSite}
                            <a href={product.providerSite || '#'}>{product.providerName}</a>
                        {:else}
                            {product.providerName}
                        {/if}
                    {/if}
                </td>
                <td>{product.vintage || '-'}</td>
                <td>{product.specificCategory || '-'}</td>
                <td>{originFormat(product)}</td>
                <td>
                    {product.quantity} x {volumeFormat(product)}
                </td>
                <td>
                    {priceFormat(product)} / C
                    <br />
                    <span class="gray">
                        {priceFormat(product)} / B
                    </span>
                </td>
            </tr>
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

    td > span.gray {
        color: #949494;
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

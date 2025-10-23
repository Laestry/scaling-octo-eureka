<script lang="ts">
    import { getCategory, priceFormat } from '../vin/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import Minus from '$lib/icons/Minus.svelte';
    import Plus from '$lib/icons/Plus.svelte';
    import { getVinsImage } from '$lib/utils/images';

    // cart item with selected_* fields
    export let selectedBatch; // alcohol_view row + cart quantity

    let img = '';
    $: {
        selectedBatch;
        img = getVinsImage(selectedBatch);
    }

    // selected batch resolution is not needed anymore; we already have the cart item

    // maximum cases available from selected_* quantities
    $: maxCases = (() => {
        if (!selectedBatch) return 0;
        const availableBottles = selectedBatch.selected_calculated_quantity ?? selectedBatch.total_quantity ?? 0;
        return selectedBatch.uvc > 0 ? Math.floor(availableBottles / selectedBatch.uvc) : 0;
    })();

    // quantity store keyed by selectedBatchId
    let itemQuantity = getItemQuantityStore(selectedBatch?.selectedBatchId);
    $: if (selectedBatch) itemQuantity = getItemQuantityStore(selectedBatch.selectedBatchId);

    $: isAtLimit = $itemQuantity >= maxCases;

    function goToProduct() {
        const slug = selectedBatch?.website_slug ?? 'noslug';
        goto(`/vin/${slug}`);
    }

    let name: string;
    $: if (selectedBatch && selectedBatch.alcohol_website && selectedBatch.alcohol_website[0]?.name) {
        name = selectedBatch.alcohol_website[0]?.name;
    } else {
        name = selectedBatch?.name;
    }
</script>

{#if selectedBatch}
    <div class="lg:flex hidden h-[142px] border-b border-wblue mb-[11px]">
        <button class="flex justify-end h-full w-[106px] ml-8" on:click={goToProduct}>
            <div class="absolute">
                <button
                    class="hover:translate-y-0.5 transition-transform rotate-45 text-5xl"
                    style="line-height: 24px"
                    on:click|preventDefault|stopPropagation={() => cart.removeCompletely(selectedBatch.selectedBatchId)}
                >
                    +
                </button>
            </div>
            <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
        </button>

        <div class="max-w-[326px] flex-1 my-4 flex items-end ml-[54px] border-r border-wblue">
            <div>
                <b>{name}</b>
                <div>{selectedBatch.provider_display_name ?? ''}</div>
                <div>{selectedBatch?.selected_vintage ?? ''}</div>
            </div>
        </div>

        <div class="max-w-[190px] flex-1 my-4 flex pl-[16px] border-r border-wred">
            <div>
                <div class="text-xs mb-[20px] mt-[9px]">Format</div>
                <div>{selectedBatch.uvc} x {selectedBatch.volume}</div>
            </div>
        </div>

        <div class="max-w-[290px] flex-1 my-4 flex justify-end pr-[79px] border-r border-wpink">
            <div class="mt-[9px] flex flex-col items-end">
                <div class="text-xs mb-[12px]">Bouteilles ({selectedBatch.uvc}/caisse)</div>
                <div class="flex items-center w-fit h-fit mr-[2px]">
                    <p class="product-table-counter__value ml-[2px]">{$itemQuantity * selectedBatch.uvc}</p>
                    <div class="flex flex-col justify-center items-center">
                        <button
                            class="abutton product-table-counter__button {isAtLimit
                                ? '!text-gray-300 cursor-not-allowed'
                                : ''}"
                            disabled={isAtLimit}
                            on:click={() => {
                                if (!isAtLimit) cart.add(selectedBatch);
                            }}
                        >
                            <Plus />
                        </button>
                        <button
                            class="abutton product-table-counter__button {$itemQuantity > 1
                                ? ''
                                : '!text-gray-300 cursor-not-allowed'}"
                            on:click={() => {
                                if ($itemQuantity > 1) cart.remove(selectedBatch.selected_batch_id);
                            }}
                        >
                            <Minus />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-[192px] flex-1 w-full my-4 flex items-center justify-end pr-1.5">
            <div>{((Number($itemQuantity) || 1) * Number(selectedBatch?.selected_price ?? 0)).toFixed(2)} $</div>
        </div>
    </div>

    <!-- mobile -->
    <div class="cartProduct lg:hidden flex !w-[220px]" transition:fade>
        <button class="flex justify-end" on:click={goToProduct}>
            <div class="absolute">
                <button
                    class="rotate-45 text-5xl"
                    style="line-height: 24px"
                    on:click|preventDefault|stopPropagation={() => cart.removeCompletely(selectedBatch.selectedBatchId)}
                >
                    +
                </button>
            </div>
            <img class="bg-no-repeat object-cover bg-center img mb-[7px]" src={img} alt="Wine" />
        </button>

        <a href="/vin/{selectedBatch.website_slug}" class="flex justify-between w-full">
            <div class="flex flex-col w-full product-name" style="width: calc(100% - 100px)">
                <div class="description">
                    <div>{getCategory(selectedBatch)}</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="product-price">
                    {$priceFormat(
                        {
                            price: selectedBatch?.selected_price,
                            price_tax_in: selectedBatch?.selected_price_tax_in,
                            uvc: selectedBatch.uvc
                        },
                        true,
                        { none: true }
                    )}
                </div>
                <div class="product-price {selectedBatch.uvc > 1 ? '' : 'text-transparent'}">
                    {$priceFormat(
                        {
                            price: selectedBatch?.selected_price,
                            price_tax_in: selectedBatch?.selected_price_tax_in,
                            uvc: selectedBatch.uvc
                        },
                        false,
                        { none: true }
                    )}
                </div>
            </div>
        </a>

        <a href="/vin/{selectedBatch.website_slug}" class="flex flex-col items-start justify-start w-full product-name">
            <b class="truncate w-full">{selectedBatch.name || '-'}</b>
            <div class="w-full flex">
                <div class="truncate" style="max-width: calc(100% - 37px)">
                    {selectedBatch.provider_display_name ?? ''}
                </div>
                <span>
                    {#if selectedBatch.provider_display_name && selectedBatch?.selected_vintage},{/if}{selectedBatch?.selected_vintage ??
                        ''}
                </span>
            </div>
        </a>

        <div class="flex justify-between items-end w-full">
            <a href="/vin/{selectedBatch.website_slug}" class="product-name description">
                {selectedBatch.uvc} <span class="lowercase">x</span>
                {selectedBatch.volume}
            </a>

            <div class="flex items-center w-fit h-fit self-end mt-2">
                <button
                    class="abutton product-table-counter__button {$itemQuantity > 1 ? '' : '!text-gray-300'}"
                    style="line-height: 16px"
                    on:click={() => {
                        if ($itemQuantity > 1) cart.remove(selectedBatch.selected_batch_id);
                    }}
                >
                    -
                </button>
                <p class="product-table-counter__value">{$itemQuantity * selectedBatch.uvc}</p>
                <button
                    class="abutton product-table-counter__button {$itemQuantity > 1
                        ? ''
                        : '!text-gray-300 cursor-not-allowed'}"
                    style="line-height: 16px"
                    disabled={isAtLimit}
                    on:click={() => cart.add(selectedBatch, selectedBatch.selected_batch_id)}
                >
                    +
                </button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .product-table-counter__button {
        width: 17px;
        height: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #1e1e1e;
        text-align: center;
        font-family: 'Riposte';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
    }
    .product-table__count {
        color: #1e1e1e;
        font-family: 'Riposte';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
    }
    .product-table-counter {
        display: flex;
        gap: 5px;
        align-items: center;
    }
    .product-table-counter__value {
        color: #f6f1f2;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Riposte';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
        border-radius: 12px;
        background: #2d63b0;
        width: 78px;
        height: 24px;
    }
    .product {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .cartProduct {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 272px;
    }
</style>

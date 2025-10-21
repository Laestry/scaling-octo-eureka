<script lang="ts">
    import { getCategory, priceFormat } from '../vin/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { afterNavigate, goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import Minus from '$lib/icons/Minus.svelte';
    import Plus from '$lib/icons/Plus.svelte';
    import { onMount } from 'svelte';
    import { getVinImage } from '$lib/utils/images';

    export let product; // alcohol_view row + { selectedBatchId: string|number }

    let img = '';
    $: {
        product;
        img = getVinImage(product, 0);
    }

    // Build a pseudo-batch from the view when we only have oldest_* fields
    function asViewBatch(p: any) {
        if (!p) return null;
        return p.oldest_batch_id == null
            ? null
            : {
                  id: p.oldest_batch_id,
                  vintage: p.oldest_vintage,
                  price: p.oldest_price,
                  price_tax_in: p.oldest_price_tax_in,
                  calculated_quantity: p.oldest_calculated_quantity
              };
    }

    // selected batch resolution:
    // 1) if the product carries an inlined list (legacy), try to find by selectedBatchId
    // 2) else fall back to the view's oldest_* batch, but only if ids match selectedBatchId
    $: selectedBatch =
        product?.alcohol_batches?.find?.((b: any) => String(b.id) === String(product?.selectedBatchId)) ??
        (String(product?.oldest_batch_id) === String(product?.selectedBatchId) ? asViewBatch(product) : null);

    let isMounted = false;
    afterNavigate(() => {
        selectedBatch =
            product?.alcohol_batches?.find?.((b: any) => String(b.id) === String(product?.selectedBatchId)) ??
            (String(product?.oldest_batch_id) === String(product?.selectedBatchId) ? asViewBatch(product) : null);
        isMounted = true;
    });
    onMount(() => {
        selectedBatch =
            product?.alcohol_batches?.find?.((b: any) => String(b.id) === String(product?.selectedBatchId)) ??
            (String(product?.oldest_batch_id) === String(product?.selectedBatchId) ? asViewBatch(product) : null);
        isMounted = true;
    });

    $: maxCases = (() => {
        if (!selectedBatch) return 0;
        const availableBottles =
            selectedBatch.calculated_quantity ?? selectedBatch.quantity ?? product?.oldest_calculated_quantity ?? 0;
        return product.uvc > 0 ? Math.floor(availableBottles / product.uvc) : 0;
    })();

    let itemQuantity = getItemQuantityStore(product.selectedBatchId);
    $: if (selectedBatch) itemQuantity = getItemQuantityStore(product.selectedBatchId);
    $: isAtLimit = $itemQuantity >= maxCases;

    function goToProduct() {
        const slug = product?.website_slug ?? 'noslug';
        goto(`/vin/${slug}`);
    }
    let name: string;
    $: if (product && product.alcohol_website && product.alcohol_website[0]?.name) {
        name = product.alcohol_website[0]?.name;
    } else {
        name = product.name;
    }
</script>

{#if isMounted && selectedBatch}
    <div class="lg:flex hidden h-[142px] border-b border-wblue mb-[11px]">
        <button class="flex justify-end h-full w-[106px] ml-8" on:click={goToProduct}>
            <div class="absolute">
                <button
                    class="hover:translate-y-0.5 transition-transform rotate-45 text-5xl"
                    style="line-height: 24px"
                    on:click|preventDefault|stopPropagation={() => cart.removeCompletely(product.selectedBatchId)}
                >
                    +
                </button>
            </div>
            <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
        </button>

        <div class="max-w-[326px] flex-1 my-4 flex items-end ml-[54px] border-r border-wblue">
            <div>
                <b>{name}</b>
                <div>{product.provider_display_name ?? ''}</div>
                <div>{selectedBatch?.vintage ?? ''}</div>
            </div>
        </div>

        <div class="max-w-[190px] flex-1 my-4 flex pl-[16px] border-r border-wred">
            <div>
                <div class="text-xs mb-[20px] mt-[9px]">Format</div>
                <div>{product.uvc} x {product.volume}</div>
            </div>
        </div>

        <div class="max-w-[290px] flex-1 my-4 flex justify-end pr-[79px] border-r border-wpink">
            <div class="mt-[9px] flex flex-col items-end">
                <div class="text-xs mb-[12px]">Bouteilles ({product.uvc}/caisse)</div>
                <div class="flex items-center w-fit h-fit mr-[2px]">
                    <p class="product-table-counter__value ml-[2px]">{$itemQuantity * product.uvc}</p>
                    <div class="flex flex-col justify-center items-center">
                        <button
                            class="abutton product-table-counter__button {isAtLimit
                                ? '!text-gray-300 cursor-not-allowed'
                                : ''}"
                            disabled={isAtLimit}
                            on:click={() => {
                                if (!isAtLimit) cart.add(product, selectedBatch.id);
                            }}
                        >
                            <Plus />
                        </button>
                        <button
                            class="abutton product-table-counter__button {$itemQuantity > 1
                                ? ''
                                : '!text-gray-300 cursor-not-allowed'}"
                            on:click={() => {
                                if ($itemQuantity > 1) cart.remove(selectedBatch.id);
                            }}
                        >
                            <Minus />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-[192px] flex-1 w-full my-4 flex items-center justify-end pr-1.5">
            <div>{((Number($itemQuantity) || 1) * Number(selectedBatch?.price ?? 0)).toFixed(2)} $</div>
        </div>
    </div>

    <!-- mobile -->
    <div class="cartProduct lg:hidden flex !w-[220px]" transition:fade>
        <button class="flex justify-end" on:click={goToProduct}>
            <div class="absolute">
                <button
                    class="rotate-45 text-5xl"
                    style="line-height: 24px"
                    on:click|preventDefault|stopPropagation={() => cart.removeCompletely(product.selectedBatchId)}
                >
                    +
                </button>
            </div>
            <img class="bg-no-repeat object-cover bg-center img mb-[7px]" src={img} alt="Wine" />
        </button>

        <a href="/vin/{product.website_slug}" class="flex justify-between w-full">
            <div class="flex flex-col w-full product-name" style="width: calc(100% - 100px)">
                <div class="description">
                    <div>{getCategory(product)}</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="product-price">
                    {$priceFormat(
                        { price: selectedBatch?.price, price_tax_in: selectedBatch?.price_tax_in, uvc: product.uvc },
                        true,
                        { none: true }
                    )}
                </div>
                <div class="product-price {product.uvc > 1 ? '' : 'text-transparent'}">
                    {$priceFormat(
                        { price: selectedBatch?.price, price_tax_in: selectedBatch?.price_tax_in, uvc: product.uvc },
                        false,
                        { none: true }
                    )}
                </div>
            </div>
        </a>

        <a href="/vin/{product.website_slug}" class="flex flex-col items-start justify-start w-full product-name">
            <b class="truncate w-full">{product.name || '-'}</b>
            <div class="w-full flex">
                <div class="truncate" style="max-width: calc(100% - 37px)">{product.provider_display_name ?? ''}</div>
                <span>
                    {#if product.provider_display_name && selectedBatch?.vintage},{/if}{selectedBatch?.vintage ?? ''}
                </span>
            </div>
        </a>
        <div class="flex justify-between items-end w-full">
            <a href="/vin/{product.website_slug}" class="product-name description">
                {product.uvc} <span class="lowercase">x</span>
                {product.volume}
            </a>

            <div class="flex items-center w-fit h-fit self-end mt-2">
                <button
                    class="abutton product-table-counter__button {$itemQuantity > 1 ? '' : '!text-gray-300'}"
                    style="line-height: 16px"
                    on:click={() => {
                        if ($itemQuantity > 1) cart.remove(selectedBatch.id);
                    }}
                    >-
                </button>

                <p class="product-table-counter__value">{$itemQuantity * product.uvc}</p>
                <button
                    class="abutton product-table-counter__button {$itemQuantity > 1
                        ? ''
                        : '!text-gray-300 cursor-not-allowed'}"
                    style="line-height: 16px"
                    disabled={isAtLimit}
                    on:click={() => cart.add(product, selectedBatch.id)}
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

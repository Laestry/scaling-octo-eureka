<!-- src/routes/vins/ProductCard.svelte -->
<script lang="ts">
    import { getCategory, priceFormat } from '../vin/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { fly } from 'svelte/transition';
    import Plus from '$lib/icons/Plus.svelte';
    import { getOldestBatch, transformVinsToCartObject } from './utils';
    import { getVinsImage } from '$lib/utils/images.js';

    export let product: any;
    export let size: 's' | 'm' | 'l' | 'v' = 's';
    export let isMain = false;
    // console.log('product', product);
    let img = '';
    $: {
        product;
        img = getVinsImage(product);
    }

    let animations: { id: number }[] = [];

    function asViewBatch(p: any) {
        if (p?.oldest_batch_id == null) return null;
        return {
            id: p.oldest_batch_id,
            vintage: p.oldest_vintage,
            price: p.oldest_price,
            price_tax_in: p.oldest_price_tax_in,
            calculated_quantity: p.oldest_calculated_quantity
        };
    }

    $: selectedBatch = getOldestBatch(product) ?? asViewBatch(product);
    let itemQuantity;
    $: if (selectedBatch) {
        itemQuantity = getItemQuantityStore(selectedBatch.id);
    }

    function handleAdd() {
        console.log('handleAdd', selectedBatch);
        if (!selectedBatch) return;
        if ($itemQuantity >= maxCases) return;
        console.log('handleAdd', $itemQuantity, maxCases);

        const cartItem = transformVinsToCartObject(product);
        console.log('handleAdd cartItem', cartItem);

        cart.add(cartItem);
        const id = Date.now();
        const duration = 600;
        animations = [...animations, { id }];
        setTimeout(() => {
            animations = animations.filter((anim) => anim.id !== id);
        }, duration + 200);
    }

    const providerName = product.provider_display_name ?? '';

    $: maxCases = (() => {
        if (!selectedBatch) return 0;
        const availableBottles = selectedBatch.calculated_quantity ?? 0;
        return product.uvc > 0 ? Math.floor(availableBottles / product.uvc) : 0;
    })();

    $: isAtLimit = $itemQuantity >= maxCases;
</script>

{#if isMain}
    <div class="product {size} cursor-blue-dot">
        <a href="/vin/{product.website_slug ?? 'noslug'}">
            <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
        </a>
        <div class="flex justify-between mt-[7px] w-full">
            <a
                href="/vin/{product.website_slug ?? 'noslug'}"
                class="flex flex-col uppercase w-full product-name"
                style="width: calc(100% - 100px)"
            >
                <b>{product.name || '-'}</b>
                <div class="description">
                    <div class="w-full {selectedBatch?.vintage ? '' : 'text-transparent'}">
                        {providerName}{#if selectedBatch?.vintage},&nbsp;{selectedBatch.vintage}{/if}
                    </div>
                </div>
            </a>

            <div class="flex flex-col items-end" style="position: relative; overflow: visible;">
                <div class="product-price">
                    {#if selectedBatch}
                        {$priceFormat(
                            { price: selectedBatch.price, price_tax_in: selectedBatch.price_tax_in, uvc: product.uvc },
                            true,
                            { none: true }
                        )}
                    {:else}
                        —
                    {/if}
                </div>
                <button
                    class="abutton text-color5 md:text-[13px] font-bold cursor-cell whitespace-nowrap {isAtLimit
                        ? 'opacity-50 cursor-not-allowed'
                        : ''}"
                    disabled={isAtLimit}
                    on:click|preventDefault|stopPropagation={handleAdd}
                >
                    <Plus size="18" />
                </button>
                {#each animations as anim (anim.id)}
                    <div
                        class="fly-animation"
                        in:fly={{ y: 25, duration: 600 }}
                        out:fly={{ y: -30, duration: 600 }}
                        style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%); pointer-events: none; z-index: 10;"
                    >
                        {$itemQuantity > 0 ? $itemQuantity * product.uvc : ''}s
                    </div>
                {/each}
            </div>
        </div>
    </div>
{:else}
    <div class="product {size} cursor-blue-dot">
        <a href="/vin/{product.website_slug ?? 'noslug'}">
            <img class="bg-no-repeat object-cover bg-center img mb-[15px]" src={img} alt="Wine" />
        </a>
        <a href="/vin/{product.website_slug ?? 'noslug'}" class="flex justify-between w-full">
            <div class="flex flex-col w-full product-name" style="width: calc(100% - 100px)">
                <div class="description">
                    <div>{getCategory(product)}</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="product-price">
                    {#if selectedBatch}
                        {$priceFormat({
                            price: selectedBatch.price,
                            price_tax_in: selectedBatch.price_tax_in,
                            uvc: product.uvc
                        })}
                    {:else}
                        —
                    {/if}
                </div>
                <div class="product-price {product.uvc > 1 ? '' : 'text-transparent'}">
                    {#if selectedBatch}
                        {$priceFormat(
                            { price: selectedBatch.price, price_tax_in: selectedBatch.price_tax_in, uvc: product.uvc },
                            false
                        )}
                    {:else}
                        —
                    {/if}
                </div>
            </div>
        </a>
        <a
            href="/vin/{product.website_slug ?? 'noslug'}"
            class="flex flex-col items-start justify-start w-full product-name"
        >
            <b class="truncate w-full">{product.name || '-'}</b>
            <div class="w-full flex">
                <div class="truncate" style="max-width: calc(100% - 37px)">{providerName}</div>
                <span>
                    {#if providerName && selectedBatch?.vintage},{/if}
                    {selectedBatch?.vintage ?? ''}
                </span>
            </div>
        </a>
        <div class="flex justify-between items-end w-full">
            <a href="/vin/{product.website_slug ?? 'noslug'}" class="product-name description">
                {product.uvc} <span class="lowercase">x</span>
                {product.volume}
            </a>

            <div class="flex flex-col items-end" style="position: relative; overflow: visible;">
                <button
                    class="abutton text-color5 md:text-[13px] font-bold cursor-cell whitespace-nowrap {isAtLimit
                        ? 'opacity-50 cursor-not-allowed'
                        : ''}"
                    disabled={isAtLimit}
                    on:click|preventDefault|stopPropagation={handleAdd}
                >
                    <Plus size="18" />
                </button>
                {#each animations as anim (anim.id)}
                    <div
                        class="fly-animation"
                        in:fly={{ y: 25, duration: 600 }}
                        out:fly={{ y: -30, duration: 600 }}
                        style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%); pointer-events: none; z-index: 10;"
                    >
                        {$itemQuantity > 0 ? $itemQuantity * product.uvc : ''}
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .product-table__count {
        color: #1e1e1e;
        font-family: 'Riposte';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 19.2px */
    }

    /* Plus button hover effect - change from blue to pink */
    button:hover {
        color: #da5899 !important; /* Pink color */
        transition: color 0.2s ease;
    }
    .product-table-counter {
        //margin-top: 14px;
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
        line-height: 120%; /* 19.2px */
        border-radius: 12px;
        background: #666;
        width: 46px;
        height: 24px;

        @media (max-width: 1162px) {
            font-size: 14px;
            width: 40px;
            height: 18px;
        }
        @media (max-width: 767px) {
            font-size: 12px;
            width: 38px;
            height: 16px;
        }
    }

    .product {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &.s {
            max-width: 176px;
            @media (max-width: 1162px) {
                width: 118px;
            }
            @media (max-width: 767px) {
                width: 94px;
            }

            .img {
                width: 176px;
                height: 245px;
                @media (max-width: 1162px) {
                    width: 118px;
                    height: 156px;
                }
                @media (max-width: 767px) {
                    width: 94px;
                    height: 125px;
                }
            }
        }
        &.m {
            width: 272px;
            @media (max-width: 1162px) {
                width: 181px;
            }
            @media (max-width: 767px) {
                width: 145px;
            }

            .img {
                width: 272px;
                height: 376px;
                @media (max-width: 1162px) {
                    width: 181px;
                    height: 241px;
                }
                @media (max-width: 767px) {
                    width: 145px;
                    height: 193px;
                }
            }
        }
        &.l {
            width: 368px;
            @media (max-width: 1162px) {
                width: 245px;
            }
            @media (max-width: 767px) {
                width: 196px;
            }

            .img {
                width: 368px;
                height: 505px;
                @media (max-width: 1162px) {
                    width: 245px;
                    height: 328px;
                }
                @media (max-width: 767px) {
                    width: 196px;
                    height: 262px;
                }
            }
        }
        &.v {
            width: 272px;
            height: 486px;
            @media (max-width: 1136px) {
                width: 181px;
                height: 354px;
            }
            @media (max-width: 760px) {
                width: 145px;
                height: auto;
            }

            .img {
                height: 362px;
                @media (max-width: 1136px) {
                    height: 240px;
                }
                @media (max-width: 760px) {
                    height: 193px;
                }
            }
        }

        .product-name {
            font-family: 'Riposte', sans-serif;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 150%; /* 18px */
            text-transform: capitalize c;

            b {
                font-weight: 700;
            }

            @media (max-width: 1162px) {
                font-size: 11px;
            }
        }

        .product-price {
            font-family: 'Riposte', sans-serif;
            font-size: 14px;
            font-style: normal;
            font-weight: 700;
            line-height: 150%; /* 18px */
            text-transform: capitalize;

            @media (max-width: 1162px) {
                font-size: 11px;
            }
        }
    }

    .cartProduct {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 272px;
        @media (max-width: 1162px) {
            width: 181px;
            height: 350px;
        }
        @media (max-width: 767px) {
            width: 145px;
            height: auto;
        }

        .img {
            width: 272px;
            height: 376px;
            @media (max-width: 1162px) {
                width: 181px;
                height: 241px;
            }
            @media (max-width: 767px) {
                width: 145px;
                height: 193px;
            }
        }

        .product-name {
            font-family: 'Riposte', sans-serif;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 150%; /* 18px */
            text-transform: capitalize !important;

            b {
                font-weight: 700;
            }

            @media (max-width: 1162px) {
                font-size: 11px;
            }
        }

        .product-price {
            font-family: 'Riposte', sans-serif;
            font-size: 14px;
            font-style: normal;
            font-weight: 700;
            line-height: 150%; /* 18px */
            text-transform: capitalize;

            @media (max-width: 1162px) {
                font-size: 11px;
            }
        }
    }
</style>

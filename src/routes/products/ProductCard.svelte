<script lang="ts">
    import { getCategory, priceFormat } from '../product/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { fly } from 'svelte/transition';
    // import type { AlcoholProduct, AlcoholBatch } from '$lib/models/pocketbase';
    import Plus from '$lib/icons/Plus.svelte';

    export let product: any;
    export let size: 's' | 'm' | 'l' | 'v' = 's';
    export let isMain = false;

    // IMAGE SELECTION (unchanged)
    const images = new Array(8).fill('').map((_, i) => `/images/example_wines/${i + 1}.jpg`);
    function getRandomNumber() {
        const n1 = parseInt(product.sku);
        return !Number.isNaN(n1) ? n1 : typeof product.id === 'number' ? product.id : parseInt(String(product.id)) || 0;
    }
    function getImage() {
        const n = getRandomNumber();
        return images[n % images.length]!;
    }
    let img = '';
    $: {
        product;
        img = getImage();
    }

    // CART ANIMATION
    let animations: { id: number }[] = [];

    // SELECT OLDEST BATCH
    function getOldestBatch(): any | null {
        return (
            product.alcohol_batches
                ?.filter((b) => !b.is_archived && b.quantity > 0)
                .sort((a, b) => {
                    const aT = a.sell_before_date ? new Date(a.sell_before_date).getTime() : Infinity;
                    const bT = b.sell_before_date ? new Date(b.sell_before_date).getTime() : Infinity;
                    return aT - bT;
                })[0] ?? null
        );
    }
    // keep this up to date if product changes
    $: selectedBatch = getOldestBatch();
    let itemQuantity;

    $: if (selectedBatch) {
        itemQuantity = getItemQuantityStore(selectedBatch.id);
    }

    function handleAdd() {
        if (!selectedBatch) return;
        console.log('ProductCard handleAdd');
        console.log(product, selectedBatch.id);
        cart.add(product, selectedBatch.id);

        const id = Date.now();
        const duration = 600;
        animations = [...animations, { id }];
        setTimeout(() => {
            animations = animations.filter((anim) => anim.id !== id);
        }, duration + 200);
    }

    // FALLBACK FOR PROVIDER NAME
    const providerName = product.parties?.display_name ?? '';
</script>

{#if isMain}
    <div class="product {size}">
        <a href="/product/{product.alcohol_website[0]?.slug ?? 'noslug'}">
            <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
        </a>
        <div class="flex justify-between mt-[7px] w-full">
            <a
                href="/product/{product.alcohol_website[0]?.slug ?? 'noslug'}"
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
                    class="abutton text-color5 md:text-[13px] font-bold cursor-cell whitespace-nowrap"
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
    <div class="product {size}">
        <a href="/product/{product.alcohol_website[0]?.slug ?? 'noslug'}">
            <img class="bg-no-repeat object-cover bg-center img mb-[15px]" src={img} alt="Wine" />
        </a>
        <a href="/product/{product.alcohol_website[0]?.slug ?? 'noslug'}" class="flex justify-between w-full">
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
            href="/product/{product.alcohol_website[0]?.slug ?? 'noslug'}"
            class="flex flex-col items-start justify-start w-full product-name"
        >
            <b class="truncate w-full">{product.name || '-'}</b>
            <div class="w-full flex">
                <div class="truncate" style="max-width: calc(100% - 37px)">{providerName}</div>
                <span>
                    {#if providerName && selectedBatch?.vintage},
                    {/if}
                    {selectedBatch?.vintage ?? ''}
                </span>
            </div>
        </a>
        <div class="flex justify-between items-end w-full">
            <a href="/product/{product.alcohol_website[0]?.slug ?? 'noslug'}" class="product-name description">
                {product.uvc} <span class="lowercase">x</span>
                {product.volume}
            </a>

            <div class="flex flex-col items-end" style="position: relative; overflow: visible;">
                <button
                    class="abutton text-color5 md:text-[13px] font-bold cursor-cell whitespace-nowrap"
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
        background: #2d63b0;
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
            text-transform: capitalize;

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
            text-transform: capitalize;

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

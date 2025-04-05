<script lang="ts">
    import { priceFormat } from '../product/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import Minus from '$lib/icons/Minus.svelte';
    import Plus from '$lib/icons/Plus.svelte';
    export let product;

    const images = new Array(8).fill('').map((_, i) => `/images/example_wines/${i + 1}.jpg`);
    function getRandomNumber() {
        const n1 = parseInt(product.sku);
        if (!Number.isNaN(n1)) {
            return n1;
        }
        const n2 = product.external_id.split('').find((x) => !Number.isNaN(parseInt(x))) || '0';
        return parseInt(n2);
    }
    function getImage() {
        const n = getRandomNumber();
        const i = n % images.length;
        return images[i]!;
    }
    let img = '';
    $: {
        product;
        img = getImage();
    }

    const itemQuantity = getItemQuantityStore(product.id);
</script>

<div class="lg:flex hidden h-[142px] border-b border-wblue mb-[11px]">
    <button
        class="flex justify-end h-full w-[106px] ml-8"
        on:click={() => {
            goto(`/product/${product.slug}`);
        }}
    >
        <div class="absolute">
            <button
                class="hover:translate-y-0.5 transition-transform rotate-45 text-5xl"
                style="line-height: 24px"
                on:click|preventDefault|stopPropagation={() => cart.removeCompletely(product.id)}
            >
                +
            </button>
        </div>
        <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
    </button>

    <div class="max-w-[326px] flex-1 my-4 flex items-end ml-[54px] border-r border-wblue">
        <div>
            <b>{product.name}</b>
            <div>{product.providerName}</div>
            <div>{product.vintage}</div>
        </div>
    </div>

    <div class="max-w-[190px] flex-1 my-4 flex pl-[16px] border-r border-wred">
        <div>
            <div class="text-xs mb-[20px] mt-[9px]">Format</div>
            <div>{product.uvc} x {product.lblFormat}</div>
        </div>
    </div>

    <div class="max-w-[290px] flex-1 my-4 flex justify-end pr-[79px] border-r border-wpink">
        <div class="mt-[9px] flex flex-col items-end">
            <div class="text-xs mb-[12px]">Bouteilles ({product.uvc}/caisse)</div>
            <div class="flex items-center w-fit h-fit mr-[2px]">
                <p class="product-table-counter__value ml-[2px]">{$itemQuantity * product.uvc}</p>
                <div class="flex flex-col justify-center items-center">
                    <button class="abutton product-table-counter__button" on:click={() => cart.add(product)}>
                        <Plus />
                    </button>
                    <button
                        class="abutton product-table-counter__button {$itemQuantity > 1 ? '' : '!text-gray-300'}"
                        on:click={() => {
                            if ($itemQuantity > 1) cart.remove(product.id);
                        }}
                    >
                        <Minus />
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-[192px] flex-1 w-full my-4 flex items-center justify-end pr-1.5">
        <div>{((Number(itemQuantity) || 1) * Number(product.price)).toFixed(2)} $</div>
    </div>
</div>

<!--mobile cart-->
<div class="cartProduct lg:hidden flex" transition:fade|global>
    <button
        class="flex justify-end"
        on:click={() => {
            goto(`/product/${product.slug}`);
        }}
    >
        <div class="absolute">
            <button
                class="rotate-45 text-5xl"
                style="line-height: 24px"
                on:click|preventDefault|stopPropagation={() => cart.removeCompletely(product.id)}
                >+
            </button>
        </div>
        <img class="bg-no-repeat object-cover bg-center img mb-[7px]" src={img} alt="Wine" />
    </button>
    <a href="/product/{product.slug}" class="flex justify-between w-full">
        <div class="flex flex-col w-full product-name" style="width: calc(100% - 100px)">
            <div class="description">
                <div>{product.specificCategory ?? ''}</div>
            </div>
        </div>
        <div class="flex flex-col items-end">
            <div class="product-price">
                {$priceFormat(product)}
            </div>
            <div class="product-price {product.uvc > 1 ? '' : 'text-transparent'}">
                {$priceFormat(product, false)}
            </div>
        </div>
    </a>

    <a href="/product/{product.slug}" class="flex flex-col items-start justify-start w-full product-name">
        <b class="truncate w-full">{product.name || '-'}</b>
        <div class="w-full flex">
            <div class="truncate" style="max-width: calc(100% - 37px)">{product.providerName ?? ''}</div>
            <span>
                {#if product.providerName && product.vintage},
                {/if}
                {product.vintage ?? ''}
            </span>
        </div>
    </a>
    <div class="flex justify-between items-end w-full">
        <a href="/product/{product.slug}" class="product-name description">
            {product.uvc} <span class="lowercase">x</span>
            {product.lblFormat}
        </a>

        <div class="flex items-center w-fit h-fit self-end">
            <button
                class="abutton product-table-counter__button {$itemQuantity > 1 ? '' : 'text-gray-300'}"
                style="line-height: 16px"
                on:click={() => {
                    if ($itemQuantity > 1) cart.remove(product.id);
                }}
                >-
            </button>

            <p class="product-table-counter__value">{$itemQuantity * product.uvc}</p>
            <button
                class="abutton product-table-counter__button"
                style="line-height: 16px"
                on:click={() => cart.add(product)}
                >+
            </button>
        </div>
    </div>
</div>

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
        line-height: 120%; /* 19.2px */
    }

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
        width: 78px;
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
                height: 224px;
            }
            @media (max-width: 767px) {
                width: 94px;
                height: auto;
            }

            .img {
                width: 176px;
                height: 243px;
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
                height: 283px;
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
        }
        &.l {
            width: 368px;
            @media (max-width: 1162px) {
                width: 245px;
                height: 370px;
            }
            @media (max-width: 767px) {
                width: 196px;
                height: auto;
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
            @media (max-width: 1162px) {
                width: 181px;
                height: 354px;
            }
            @media (max-width: 767px) {
                width: 196px;
                height: auto;
            }

            .img {
                width: 368px;
                height: 362px;
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

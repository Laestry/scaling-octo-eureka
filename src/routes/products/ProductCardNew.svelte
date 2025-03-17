<script lang="ts">
    import type { Product } from '$lib/server/prisma';
    import { priceFormat } from '../product/[slug]/utils';

    export let product: Product;
    export let size: 's' | 'm' | 'l' | 'v' = 's';
    export let main = true;

    function add() {}

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
</script>

{#if main}
    <a href="/product/{product.slug}" class="product {size}">
        <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
        <div class="flex justify-between mt-[7px] w-full">
            <div class="flex flex-col uppercase w-full product-name" style="width: calc(100% - 100px)">
                <b>{product.name || '-'}</b>
                <div class="description">
                    <div class=" w-full {product.vintage ? '' : 'text-transparent'}">
                        {product.providerName ?? ''}{#if product.vintage}, &nbsp;{product.vintage}
                        {/if}
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="product-price">
                    {priceFormat(product, false, { none: true })}
                </div>
                <button class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap" on:click={() => add()}>
                    ADD +
                </button>
            </div>
        </div>
    </a>
{:else}
    <a href="/product/{product.slug}" class="product {size}">
        <img class="bg-no-repeat object-cover bg-center img mb-[7px]" src={img} alt="Wine" />
        <div class="flex justify-between w-full">
            <div class="flex flex-col w-full product-name" style="width: calc(100% - 100px)">
                <div class="description">
                    <div>{product.specificCategory ?? ''}</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="product-price">
                    {priceFormat(product)}
                </div>
                <div class="product-price {product.uvc > 1 ? '' : 'text-transparent'}">
                    {priceFormat(product, false)}
                </div>
            </div>
        </div>
        <div class="flex flex-col items-start justify-start w-full product-name">
            <b>{product.name || '-'}</b>
            <div class="truncate w-full {product.providerName ? '' : 'text-transparent'}">
                {product.providerName ?? ''}
            </div>
        </div>
        <div class="flex justify-between items-end w-full">
            <div class="product-name description">
                <div class={product.vintage ? '' : 'text-transparent'}>{product.vintage ?? ''}</div>
                {product.uvc} <span class="lowercase">x</span>
                {product.lblFormat}
            </div>

            <div class="flex flex-col items-end justify-end">
                <button class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap" on:click={() => add()}>
                    ADD +
                </button>
            </div>
        </div>
    </a>
{/if}

<style lang="scss">
    .product {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &.s {
            max-width: 176px;
            @media (max-width: 1119px) {
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
                @media (max-width: 1119px) {
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
            @media (max-width: 1119px) {
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
                @media (max-width: 1119px) {
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
            @media (max-width: 1119px) {
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
                @media (max-width: 1119px) {
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
                width: 196px;
                height: auto;
            }

            .img {
                width: 368px;
                height: 362px;
                @media (max-width: 1136px) {
                    width: 245px;
                    height: 328px;
                }
                @media (max-width: 760px) {
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

            @media (max-width: 1119px) {
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

            @media (max-width: 1119px) {
                font-size: 11px;
            }
        }
    }
</style>

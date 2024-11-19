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
            <div class="flex flex-col uppercase w-full product-name" style="width: calc(100% - 80px)">
                <b>{product.name || '-'}</b>
                <div class="description">
                    {#if product.providerName}
                        {#if product.providerSite}
                            <a href={product.providerSite || '#'}>{product.providerName}</a>
                        {:else}
                            <div>{product.providerName}</div>
                        {/if}
                    {/if}
                    {#if product.vintage}
                        , &nbsp;
                        <div>{product.vintage}</div>
                    {/if}
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
            <div class="flex flex-col w-full product-name" style="width: calc(100% - 80px)">
                <div class="description">
                    <div>{product.specificCategory ?? ''}</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="product-price">
                    {priceFormat(product)}
                </div>
                <div class="product-price">
                    {priceFormat(product, false)}
                </div>
            </div>
        </div>
        <div class="flex justify-between w-full">
            <div class="flex flex-col w-full product-name" style="width: calc(100% - 80px)">
                <b>{product.name || '-'}</b>
                <div class="description">
                    {#if product.providerName}
                        {#if product.providerSite}
                            <a href={product.providerSite || '#'}>{product.providerName}</a>
                        {:else}
                            <div>{product.providerName}</div>
                        {/if}
                    {/if}
                    {#if product.vintage}
                        <div>{product.vintage}</div>
                    {/if}
                </div>
                <div>{product.uvc} <span>x</span> {product.volume}ml</div>
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
        gap: 4px;

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
    .description {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: center;
    }
</style>

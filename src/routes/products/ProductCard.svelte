<script lang="ts">
    import { priceFormat } from '../product/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { fly } from 'svelte/transition';
    export let product;
    export let size: 's' | 'm' | 'l' | 'v' = 's';
    export let isMain = false;

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
    let animations: { id: number }[] = [];

    function handleAdd() {
        // Add the product to the cart
        cart.add(product);
        // Create a new animation instance with a unique id (using timestamp)
        const id = Date.now();
        animations = [...animations, { id }];
        // Remove the animation after the duration of the transition (e.g., 600ms)
        setTimeout(() => {
            animations = animations.filter((anim) => anim.id !== id);
        }, 600);
    }

    export let cartQuantity = 0;
</script>

{#if isMain}
    <div class="product {size}">
        <a href="/product/{product.slug}">
            <img class="bg-no-repeat object-cover bg-center img" src={img} alt="Wine" />
        </a>
        <div class="flex justify-between mt-[7px] w-full">
            <a
                href="/product/{product.slug}"
                class="flex flex-col uppercase w-full product-name"
                style="width: calc(100% - 100px)"
            >
                <b>{product.name || '-'}</b>
                <div class="description">
                    <div class=" w-full {product.vintage ? '' : 'text-transparent'}">
                        {product.providerName ?? ''}{#if product.vintage}, &nbsp;{product.vintage}
                        {/if}
                    </div>
                </div>
            </a>

            <div class="flex flex-col items-end" style="position: relative; overflow: visible;">
                <div class="product-price">
                    {priceFormat(product, false, { none: true })}
                </div>
                <button
                    class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap"
                    on:click|preventDefault|stopPropagation={handleAdd}
                >
                    ADD +
                </button>
                {#each animations as anim (anim.id)}
                    <div
                        class="fly-animation"
                        in:fly={{ y: 25, duration: 600 }}
                        out:fly={{ y: -30, duration: 600 }}
                        style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%); pointer-events: none; z-index: 10;"
                    >
                        {$itemQuantity > 0 ? $itemQuantity : ''}
                    </div>
                {/each}
            </div>
        </div>
    </div>
{:else}
    <div class="product {size}">
        <a href="/product/{product.slug}">
            <img class="bg-no-repeat object-cover bg-center img mb-[7px]" src={img} alt="Wine" />
        </a>
        <a href="/product/{product.slug}" class="flex justify-between w-full">
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
        </a>
        <a href="/product/{product.slug}" class="flex flex-col items-start justify-start w-full product-name">
            <b>{product.name || '-'}</b>
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

            <div class="flex flex-col items-end" style="position: relative; overflow: visible;">
                <button
                    class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap"
                    on:click|preventDefault|stopPropagation={handleAdd}
                >
                    ADD +
                </button>
                {#each animations as anim (anim.id)}
                    <div
                        class="fly-animation"
                        in:fly={{ y: 25, duration: 600 }}
                        out:fly={{ y: -30, duration: 600 }}
                        style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%); pointer-events: none; z-index: 10;"
                    >
                        {$itemQuantity > 0 ? $itemQuantity : ''}
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

        @media (max-width: 1119px) {
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

    .cartProduct {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 272px;
        @media (max-width: 1119px) {
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
            @media (max-width: 1119px) {
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

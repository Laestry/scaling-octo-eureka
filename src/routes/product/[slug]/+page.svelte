<script lang="ts">
    import type { PageData } from './$types';
    import { alcoholFormat, volumeFormat, priceFormat, originFormat } from './utils';
    import Accordion from '$lib/components/Accordion.svelte';
    import ProductTags from './ProductTags.svelte';

    export let data: PageData;
    $: console.log('data', data);
    $: product = data.product;

    let currentSlide = 0;
    let expand_description = false;
    let in_cart = 1;
    function add() {
        in_cart = Math.min(in_cart + 1, product.quantity);
    }
    function remove() {
        if (in_cart !== 0) {
            in_cart--;
        }
    }
    const img =
        'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_fb1c9cb7-8ab1-4037-a915-913d2c638b8a.png?v=1706118993';
</script>

<div class="mt-[40px] lg:max-w-[1162px] md:max-w-[780px] max-w-[320px] mx-auto">
    <div>
        <!-- <a href="/products">
            <button><img src="/icons/arrow.svg" alt="back" /></button>
        </a> -->
        <div class="md:invisible visible">
            <ProductTags {product} />
        </div>
        <div class="md:flex-row flex-col flex gap-[32px] mt-[16px] items-end">
            <div
                class="relative lg:min-w-[462px] lg:w-[462px] lg:h-[639px] md:min-w-[308px] md:w-[308px] md:h-[439px] min-w-[280px] w-[280px] h-[262px]"
            >
                <button
                    class="absolute z-[1] left-0 bottom-0 lg:w-[271px] lg:h-[375px] md:w-[181px] md:h-[241px] w-[94px] h-[125px]"
                    class:z-[4]={currentSlide === 0}
                    on:click={() => (currentSlide = 0)}
                >
                    <img class="object-cover w-full h-full" src={img} alt="Wine" />
                </button>
                <button
                    class="absolute z-[2] md:left-[12px] left-[6px] bottom-0 lg:w-[450px] lg:h-[591px] md:w-[247px] md:h-[439px] w-[196px] h-[262px]"
                    class:z-[4]={currentSlide === 2}
                    on:click={() => (currentSlide = 2)}
                >
                    <img class="object-cover w-full h-full" src={img} alt="Wine" />
                </button>
                <button
                    class="absolute z-[3] md:left-[12px] left-[99px] bottom-0 lg:w-[374px] lg:h-[639px] md:w-[300px] md:h-[401px] w-[181px] h-[240px]"
                    class:z-[4]={currentSlide === 1}
                    on:click={() => (currentSlide = 1)}
                >
                    <img class="object-cover w-full h-full" src={img} alt="Wine" />
                </button>
            </div>

            <div class="flex flex-col">
                <div class="md:visible invisible">
                    <ProductTags {product} />
                </div>
                <h1 class="product-title mt-[12px]">{product.name}</h1>
                <div class="product-description mt-4 h-[125px] max-w-[366px] overflow-auto">
                    {@html product.fullDescription}
                    <!-- <button on:click={() => (expand_description = !expand_description)}>{expand_description ? '-' : '+'}</button> -->
                </div>
                <!-- <div class="od my-[16px] h-[304px] w-[448px] overflow-hidden">
                </div> -->
                <!-- <div class="flex gap-[42px] items-center">
                    <div class="tpr p-[8px] w-fit" style="border-bottom: 1px solid var(--border--02);">
                        <div>
                            <span class="tpb">R</span>
                            {parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount / 6) ?? 'N/A'}$/btl
                        </div>
                        <div class="text-contents">
                            <span class="tpb">P</span>
                            {parseInt(product?.variants?.edges[0]?.node?.priceV2?.amount) ?? 'N/A'}$/btl
                        </div>
                    </div>
                    <button
                        on:click={() => {
                            addToCart(product, 1);
                        }}
                        class="button px-[9px] py-[12px] rounded-[4px] border"
                    >
                        add to cart
                    </button>
                    <FavoriteButton />
                </div> -->
                <div class="lg:w-[464px] md:w-[380px] w-[300px] w-full mt-4">
                    <div class="flex product-table">
                        <div
                            class="flex flex-col md:min-w-[280px] md:w-[280px] min-w-[186px] w-[186px] border-r-[1px] border-r-[#E859EB]"
                        >
                            <p class="product-table__type">Type de vin</p>
                            <p class="product-table__description">
                                <b class="font-bold">{product.name}</b>
                                <br />
                                {product.category}
                                {#if product.specificCategory}
                                    ({product.specificCategory})
                                {/if}
                                <br />
                                {product.vintage}
                                <br />
                                {product.quantity} x {volumeFormat(product)} ({alcoholFormat(product)})
                            </p>
                        </div>
                        <div class="flex flex-col py-2 w-full">
                            <p class="product-table__price">
                                {priceFormat(product)}
                            </p>
                            <p class="product-table__price">
                                {priceFormat(product)}
                            </p>
                            <p class="product-table__type-region">
                                {originFormat(product)}
                                (
                                {#if product.providerSite}
                                    <a href={product.providerSite}>{product.providerName}</a>
                                {:else}
                                    {product.providerName}
                                {/if}
                                )
                            </p>
                            <p />
                        </div>
                    </div>
                    <div
                        class="flex md:flex-row flex-col pt-4 pb-8 border-b-[1px] border-b-[#DE6643] relative justify-between"
                    >
                        {#if data.product.quantity !== 0}
                            <div class="flex md:flex-col flex-row gap-2">
                                <p class="product-table__count">Quantité /caisse de 6</p>
                                <div class="product-table-counter">
                                    <p class="product-table-counter__value">{in_cart}</p>
                                    <div class="md:flex flex-col contents">
                                        <button class="product-table-counter__button order-[-1]" on:click={() => add()}>
                                            +
                                        </button>
                                        <button class="product-table-counter__button" on:click={() => remove()}>
                                            -
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/if}
                        <div class="flex flex-col gap-2 md:mt-0 mt-6">
                            <button class="product-table__button product-table__button--favorite">
                                Liste d’attente
                            </button>
                            <button class="product-table__button">Ajouter au panier</button>
                        </div>
                        <p class="absolute text-[16px] bg-[#F6F1F2] text-[#DE6643] bottom-[-12px] pr-1">*</p>
                    </div>
                    <p class="product-table__description">
                        Le prix inclut les taxes et le frais d’agent de 16%.
                        <br />
                        <a href="#">C’est quoi le 16%?</a>
                        <br />
                        <a href="#">Je paie combien, à qui, quand?</a>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-[20px] flex flex-col gap-[13px]">
        <!-- {#if recommendedProducts}
            <div class="flex flex-col pt-[13px] px-[13px] border-t-[1px] border-t-[#000]">
                <p class="recommended__title">Si vous aimez ceci, vous aimerez aussi...</p>
                <div class="flex gap-4">
                    {#each recommendedProducts?.slice(0, 4) as p}
                        <ProductCard product={p} />
                    {/each}
                </div>
            </div>
        {/if} -->
        <!-- <Accordion title="You might also like">
            {#if recommendedProducts}
                <div class="flex gap-[32px] mt-[16px]">
                    {#each recommendedProducts.slice(0, 4) as p}
                        <MiniProductCard title={p.handle} image={p.featured_image} id={p.id} />
                    {/each}
                </div>
            {/if}
        </Accordion> -->
        <!-- <Accordion title="Vu récemment">
            <ProductGrid class="mt-[32px]" {searchResults} />
        </Accordion>
        <Accordion title="Si vous aimez ceci, vous aimerez aussi...">
            <ProductGrid class="mt-[32px]" {searchResults} />
        </Accordion> -->
        <Accordion title="Du même producteur">
            <div>body</div>
        </Accordion>
        <Accordion title="De la même région">
            <div>body</div>
        </Accordion>
    </div>
</div>

<!-- <div class="product">
    <img
        class="bg-no-repeat object-cover bg-center img"
        src={'https://cdn.shopify.com/s/files/1/0762/7689/1952/files/product-image_fb1c9cb7-8ab1-4037-a915-913d2c638b8a.png?v=1706118993'}
        alt="Wine"
    />
    <div class="flex flex-col justify-between mt-[7px] w-full">
        <div class="flex flex-col uppercase w-full product-name" style="width: calc(100% - 80px)">
            <b>{product.name || '-'}</b>
            <div class="flex">
                {#if product.providerName}
                    {#if product.providerSite}
                        <a href={product.providerSite || '#'}>{product.providerName}</a>
                    {:else}
                        <div>{product.providerName}</div>
                    {/if}
                {/if}
                {#if product.vintage}
                    ,
                    <span>{product.vintage}</span>
                {/if}
            </div>
        </div>
        <div class="flex flex-col items-end">
            <div class="product-price">
                {priceFormat(product)}
            </div>
            <button class="text-color5 text-sm font-bold cursor-cell whitespace-nowrap" on:click={() => add()}>
                ADD +
            </button>
        </div>
        {#if product.shortDescription}
            <div>{product.shortDescription}</div>
        {/if}
        <div>origin: {originFormat(product)}</div>
        <div>alcohol: {alcoholFormat(product)}</div>
        <div>unit: {product.unit}</div>
        <div>volume: {volumeFormat(product)}</div>
        <div>quantity: {product.quantity}</div>
        {#if product.category}
            <div>category: {product.category}</div>
        {/if}
        {#if product.specificCategory}
            <div>specific category: {product.specificCategory}</div>
        {/if}
        {#if product.fullDescription}
            <div>{@html product.fullDescription}</div>
        {/if}
    </div>
</div> -->

<style lang="scss">
    .product-title {
        color: #191c1c;
        font-size: 32px;
        font-style: normal;
        font-weight: 400;
        line-height: 42px; /* 131.25% */
    }
    .product-description {
        color: #191c1c;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 19.2px */
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
    }
    .product-description button {
        color: #de6643;
    }
    .product-description :global(p) {
        display: inline;
    }
    .product-table {
        border-top: 1px solid #4975b8;
        border-bottom: 1px solid #000;
    }
    .product-table__price {
        color: #1e1e1e;
        text-align: right;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 120%; /* 19.2px */
        text-transform: capitalize;
    }
    .product-table__type {
        color: #1e1e1e;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 19.2px */
        padding: 8px 0px;
        border-bottom: 1px solid #de6643;
    }
    .product-table__type-region {
        color: #1e1e1e;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 19.2px */
        padding: 8px 0px;
        border-top: 1px solid #de6643;
        text-align: right;
        margin-top: 29px;
    }
    .product-table__description {
        color: #1e1e1e;
        padding: 8px 0px;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
    }
    .product-table__description a {
        color: #4975b8;
        font-family: 'Riposte';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
        text-decoration-line: underline;
    }
    .product-table__button {
        border-radius: 12px;
        background: rgba(45, 99, 176, 0.5);
        width: 176px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f6f1f2;
        text-align: center;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 19.2px */
    }
    .product-table__button:last-child {
        background: #2d63b0;
    }
    .product-table__button--favorite {
        background: var(--WARD-RED, #f15a38);
    }
    .product-table__count {
        color: #1e1e1e;
        font-family: 'Riposte';
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 19.2px */
    }
    .product-table__favorite {
        top: 20px;
        left: calc(100% + 70px);
        position: absolute;
    }
    .product-table-counter {
        margin-top: 14px;
        display: flex;
        gap: 5px;
        align-items: center;
    }
    @media (max-width: 767px) {
        .product-table-counter {
            margin-top: 0;
            margin-left: auto;
        }
        .product-table__button {
            width: 100%;
        }
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
    }
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
    // .product {
    //     display: flex;
    //     flex-direction: column;
    //     align-items: center;
    //     justify-content: center;
    //     gap: 4px;
    //     margin: 10%;

    //     .img {
    //         width: 368px;
    //         height: 505px;
    //         @media (max-width: 1119px) {
    //             width: 245px;
    //             height: 328px;
    //         }
    //         @media (max-width: 767px) {
    //             width: 196px;
    //             height: 262px;
    //         }
    //     }

    //     .product-name {
    //         font-family: 'Riposte', sans-serif;
    //         font-size: 14px;
    //         font-style: normal;
    //         font-weight: 400;
    //         line-height: 150%; /* 18px */
    //         text-transform: capitalize;

    //         b {
    //             font-weight: 700;
    //         }

    //         @media (max-width: 1119px) {
    //             font-size: 11px;
    //         }
    //     }

    //     .product-price {
    //         font-family: 'Riposte', sans-serif;
    //         font-size: 14px;
    //         font-style: normal;
    //         font-weight: 700;
    //         line-height: 150%; /* 18px */
    //         text-transform: capitalize;

    //         @media (max-width: 1119px) {
    //             font-size: 11px;
    //         }
    //     }
    // }
</style>

<script lang="ts">
    import type { PageData } from './$types';
    import { getCategory, priceFormat } from './utils';
    import Accordion from '$lib/components/Accordion.svelte';
    import ProductTags from './ProductTags.svelte';
    import { cart } from '$lib/cart';
    import Plus from '$lib/icons/Plus.svelte';
    import Minus from '$lib/icons/Minus.svelte';
    import type { AlcoholProduct } from '$lib/models/pocketbase';
    import { Svroller } from 'svrollbar';
    import { fade } from 'svelte/transition';
    import { onMount, tick } from 'svelte';
    import { getSpecificCategoryLabel } from '../../products/Filters/utils';
    import { afterNavigate } from '$app/navigation';

    export let data: PageData;
    console.log('data', data);
    let product: AlcoholProduct;
    $: product = data.product;

    // SELECT OLDEST BATCH (same logic as in the card)
    function getOldestBatch(): any | null {
        if (!product?.alcohol_batches || !Array.isArray(product.alcohol_batches)) return null;
        const valid = product.alcohol_batches.filter((b) => !b.is_archived && b.quantity > 0);
        if (!valid.length) return null;
        valid.sort((a, b) => {
            const aT = a.sell_before_date ? new Date(a.sell_before_date).getTime() : Infinity;
            const bT = b.sell_before_date ? new Date(b.sell_before_date).getTime() : Infinity;
            return aT - bT;
        });
        return valid[0];
    }
    let selectedBatch;
    $: if (product) selectedBatch = getOldestBatch();

    // Format "Acheter avant" based on sell_before_date
    function formatSellBeforeDate(sellBefore: string | null | undefined): string {
        if (!sellBefore) return '';
        const d = new Date(sellBefore);
        const now = new Date();
        const months = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
        if (months < 0) return 'Expiré';
        return `Acheter avant ${months} mois, ${d.getFullYear()}`;
    }

    let currentSlide = 0;
    let expand_description = false;
    let expand_question = false;

    let in_cart = 1;
    $: maxCases = selectedBatch ? Math.floor(selectedBatch.calculated_quantity / product.uvc) : 0;

    // 2. Ensure in_cart is always between 1 and maxCases (or 0 if no stock)
    $: {
        if (maxCases === 0) {
            in_cart = 0;
        } else if (in_cart < 1) {
            in_cart = 1;
        } else if (in_cart > maxCases) {
            in_cart = maxCases;
        }
    }

    function add() {
        // never go above maxCases
        in_cart = Math.min(in_cart + 1, maxCases);
    }

    function remove() {
        // never go below 1 (unless there's no stock)
        in_cart = Math.max(in_cart - 1, maxCases > 0 ? 1 : 0);
    }
    const img1 = '/images/example_wines/SHOP PAGE/Product Shot - stack.png';
    const img = '/images/example_wines/SHOP PAGE/9x1' + '6 Product Shot - stack.png';
    const img2 = '/images/example_wines/SHOP PAGE/In-situ Product Shot - stack.png';

    let sameProducerProducts: AlcoholProduct[] = [];
    let sameRegionProducts: AlcoholProduct[] = [];

    // PROVIDER NAME (fallback)
    let providerName = '';
    $: if (product && product?.parties) providerName = product?.parties?.display_name ?? '';

    onMount(async () => {
        console.log('product data', data, selectedBatch);
    });
</script>

<div
    class="mx-auto
           lg:max-w-[1162px] md:max-w-[780px] max-w-[320px]
           lg:mt-[56px] mt-[48px]"
>
    <div>
        <ProductTags
            {product}
            class="lg:w-[560px] md:w-[442px]
                   lg:ml-[472px] md:ml-[318px]"
        />
        <div class="md:flex-row flex-col flex gap-x-[10px] mt-[10px] items-start">
            <!--images-->
            <div
                class="relative
                lg:w-[462px] md:w-[308px] w-[280px]
                lg:h-[639px] md:h-[439px] h-[262px]
                "
            >
                <button
                    class="absolute z-[1] left-0 bottom-0 lg:w-[271px] lg:h-[375px] md:w-[181px] md:h-[241px] w-[94px] h-[125px]"
                    class:z-[4]={currentSlide === 0}
                    on:click={() => (currentSlide = 0)}
                >
                    <img class="object-cover w-full h-full" src={img1} alt="Wine" />
                </button>
                <button
                    class="absolute z-[2] md:left-[12px] left-[6px] bottom-0 lg:w-[450px] lg:h-[591px] md:w-[247px] md:h-[439px] w-[196px] h-[262px]"
                    class:z-[4]={currentSlide === 2}
                    on:click={() => (currentSlide = 2)}
                >
                    <img class="object-cover w-full h-full" src={img2} alt="Wine" />
                </button>
                <button
                    class="absolute z-[3] md:left-[12px] left-[99px] bottom-0 lg:w-[374px] lg:h-[639px] md:w-[300px] md:h-[401px] w-[181px] h-[240px]"
                    class:z-[4]={currentSlide === 1}
                    on:click={() => (currentSlide = 1)}
                >
                    <img class="object-cover w-full h-full" src={img} alt="Wine" />
                </button>
            </div>

            <div>
                <div
                    class="mt-[12px] flex items-end
                        lg:w-[560px] md:w-[394px] h-full"
                >
                    <h1 class="lg:text-[42px] text-2xl">{product.name}</h1>
                </div>

                <div class="flex flex-col lg:w-[464px] md:w-[380px] h-full">
                    <!--description-->
                    <div class="product-description mt-4 h-[141px] w-full pr-[15px]">
                        <Svroller width="100%" height="100%" margin={{ right: -15 }} alwaysVisible>
                            {@html JSON.parse(product.alcohol_website[0].description_french).fr}
                            <!--                            <button on:click={() => (expand_description = !expand_description)}>-->
                            <!--                                {expand_description ? '-' : '+'}-->
                            <!--                            </button>-->
                        </Svroller>
                    </div>

                    <div class="w-full mt-4">
                        <!--                    facts block-->
                        <div class="flex product-table lg:h-[141px] h-[104px]">
                            <!--                            left-->
                            <div
                                class="flex flex-col border-r-[1px] border-r-[#E859EB]
                                        lg:w-[279px] md:w-[235px] w-[186px]"
                            >
                                <p class="border-b border-wred lg:h-[32px] h-[28px] capitalize flex items-center">
                                    {product.category && product.specific_category ? getCategory(product) : '-'}
                                </p>
                                <div class="flex items-center flex-1">
                                    <div class="w-fit">
                                        <b class="font-bold">{providerName}</b>
                                        <br />
                                        {product.name ?? ''}
                                        <br />
                                        {product.vintage}
                                        <br />
                                        {product.uvc} x {product.format}{product.unit === 1 ? 'L' : 'ml'}
                                    </div>
                                </div>
                            </div>

                            <!--                            right-->
                            <div class="flex flex-col flex-1">
                                <div
                                    class="flex flex-col items-end justify-center
                                        lg:h-[70px] h-[45px] border-b border-wblue"
                                >
                                    <b>
                                        {$priceFormat(
                                            {
                                                price: selectedBatch.price,
                                                price_tax_in: selectedBatch.price_tax_in,
                                                uvc: product.uvc
                                            },
                                            true
                                        )}
                                    </b>
                                    <b>
                                        {$priceFormat(
                                            {
                                                price: selectedBatch.price,
                                                price_tax_in: selectedBatch.price_tax_in,
                                                uvc: product.uvc
                                            },
                                            false
                                        )}
                                    </b>
                                </div>

                                <div class="flex flex-1 items-center justify-end">
                                    Acheter avant <br /> JJ mois, 20XX
                                </div>
                            </div>
                        </div>

                        <!--                        add products-->
                        <div
                            class="flex md:flex-row flex-col pt-4 pb-8 relative justify-between border-b-[1px] border-b-[#DE6643]"
                        >
                            <div class="flex md:flex-col flex-row md:items-start items-center gap-2">
                                <p class="product-table__count">Bouteilles ({product.uvc}/caisse)</p>
                                <div class="product-table-counter">
                                    <p class="product-table-counter__value">{in_cart * product.uvc}</p>
                                    <div class="md:flex flex-col contents">
                                        <button
                                            class="abutton product-table-counter__button order-[-1]"
                                            on:click={() => add()}
                                        >
                                            <Plus />
                                        </button>
                                        <button class="abutton product-table-counter__button" on:click={() => remove()}>
                                            <Minus />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2 md:mt-0 mt-6">
                                <button class="product-table__button product-table__button--favorite abutton">
                                    Liste d’attente
                                </button>
                                <button
                                    class="product-table__button abutton"
                                    on:click={() => cart.add(product, selectedBatch.id)}
                                >
                                    Ajouter au panier
                                </button>
                            </div>
                            <p class="absolute text-[16px] bg-[#F6F1F2] text-[#DE6643] bottom-[-12px] pr-1">*</p>
                        </div>

                        <!--                        question-->
                        <button
                            on:click={() => (expand_description = !expand_description)}
                            class="abutton flex justify-between w-full lg:text-base text-xs mt-2"
                        >
                            <span>
                                Le prix inclut les taxes et
                                <span class="text-wblue underline"> le frais d’agent de 16%. </span>
                            </span>

                            <span class="text-wred">
                                {expand_description ? '-' : '+'}
                            </span>
                        </button>
                        {#if expand_description}
                            <div transition:fade class="question">
                                <ol class="list-decimal ml-[17px]">
                                    <li>
                                        Au moment de finaliser votre commande, vous serez chargé pour les frais d’agence
                                        (soit 16%) sur ce site.
                                    </li>
                                    <li>
                                        Rendez-vous à la SAQ de votre choix, pour récupérer votre commande, et payer le
                                        reste de votre facture.
                                    </li>
                                    <li>Cheeeeers!</li>
                                </ol>
                                <br />
                                Questions? <a href="mailto:info@wardetassocies.com">Ecrivez-nous</a>.
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-[20px] flex flex-col lg:gap-[22px] gap-[10px]">
        <!--{#if product.providerName}-->
        <!--    <Accordion title="Du même producteur">-->
        <!--        {#each sameProducerProducts as producerProduct}-->
        <!--            <ProductCard product={producerProduct} size="m" />-->
        <!--        {/each}-->
        <!--    </Accordion>-->
        <!--{/if}-->

        <!--{#if product.originRegion}-->
        <!--    <Accordion title="De la même région">-->
        <!--        {#each sameRegionProducts as regionProduct}-->
        <!--            <ProductCard product={regionProduct} size="m" />-->
        <!--        {/each}-->
        <!--    </Accordion>-->
        <!--{/if}-->
    </div>
</div>

<style lang="scss">
    @media (max-width: 1136px) {
    }
    @media (max-width: 760px) {
    }

    .question {
        font-size: 16px;
        @media (max-width: 1136px) {
            font-size: 12px;
        }
    }

    .product-description {
        --svrollbar-track-width: 9px !important;
        --svrollbar-track-background: white !important;
        --svrollbar-track-opacity: 1 !important;
        --svrollbar-thumb-width: 9px !important;
        --svrollbar-thumb-background: var(--blue) !important;
        --svrollbar-thumb-opacity: 0.5 !important;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;

        overflow-y: auto;
    }

    .product-description button {
        color: var(--red);
    }

    .product-table {
        font-size: 16px;
        border-top: 1px solid var(--blue);
        border-bottom: 1px solid var(--black);
        @media (max-width: 1136px) {
            font-size: 11px;
        }
    }

    a {
        color: #4975b8;
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
        @media (max-width: 1136px) {
            font-size: 12px;
        }
    }
    .product-table__button:last-child {
        background: #2d63b0;
    }
    .product-table__button--favorite {
        background: var(--WARD-RED, #f15a38);
    }
    .product-table__count {
        font-size: 16px;

        @media (max-width: 1136px) {
            font-size: 12px;
        }
        @media (max-width: 760px) {
            font-size: 12px;
        }
    }
    .product-table__favorite {
        top: 20px;
        left: calc(100% + 70px);
        position: absolute;
    }
    .product-table-counter {
        //margin-top: 14px;
        display: flex;
        gap: 5px;
        align-items: center;
        @media (max-width: 1136px) {
            font-size: 12px;
        }
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
    }
</style>

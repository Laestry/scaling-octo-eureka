<script lang="ts">
    import type { PageData } from './$types';
    import { priceFormat } from './utils';
    import Accordion from '$lib/components/Accordion.svelte';
    import ProductTags from './ProductTags.svelte';
    import { cart } from '$lib/cart';
    import Plus from '$lib/icons/Plus.svelte';
    import Minus from '$lib/icons/Minus.svelte';
    import type { AlcoholProduct } from '$lib/models/pocketbase';
    import { Svroller } from 'svrollbar';
    import { fade } from 'svelte/transition';
    import ProductCard from '../../products/ProductCard.svelte';
    import { onMount } from 'svelte';
    import { pb } from '$lib/pocketbase';

    export let data: PageData;
    $: console.log('data', data);
    let product: AlcoholProduct;
    $: product = data.product;

    let currentSlide = 0;
    let expand_description = false;
    let expand_question = false;

    let in_cart = 1;
    function add() {
        in_cart = Math.min(in_cart + 1);
    }
    function remove() {
        if (in_cart !== 0) {
            in_cart--;
        }
    }
    const img1 = '/images/example_wines/SHOP PAGE/Product Shot - stack.png';
    const img = '/images/example_wines/SHOP PAGE/9x16 Product Shot - stack.png';
    const img2 = '/images/example_wines/SHOP PAGE/In-situ Product Shot - stack.png';

    let sameProducerProducts: AlcoholProduct[] = [];
    let sameRegionProducts: AlcoholProduct[] = [];

    onMount(async () => {
        const producerPromise = product.providerName
            ? pb.collection('alcohol_products').getList(1, 4, {
                  filter: `providerName="${product.providerName}"`,
                  sort: 'quantity'
              })
            : Promise.resolve({ items: [] });

        const regionPromise = product.originRegion
            ? pb.collection('alcohol_products').getList(1, 4, {
                  filter: `originRegion="${product.originRegion}"`,
                  sort: 'quantity'
              })
            : Promise.resolve({ items: [] });

        const [sameProducerProductsRecord, sameRegionProductsRecord] = await Promise.all([
            producerPromise,
            regionPromise
        ]);
        sameProducerProducts = sameProducerProductsRecord.items;
        sameRegionProducts = sameRegionProductsRecord.items;
    });

    $: console.log(sameProducerProducts, sameRegionProducts);
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
                            {@html product.fullDescription}
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
                                    {product.specificCategory}
                                </p>
                                <div class="flex items-center flex-1">
                                    <div class="w-fit">
                                        <b class="font-bold">{product.providerName}</b>
                                        <br />
                                        {product.name ?? ''}
                                        <br />
                                        {product.vintage}
                                        <br />
                                        {product.uvc} x {product.lblFormat}
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
                                        {$priceFormat(product, true)}
                                    </b>
                                    <b>
                                        {$priceFormat(product, false)}
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
                                    on:click={() => cart.add(product, in_cart)}
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
        {#if product.providerName}
            <Accordion title="Du même producteur">
                {#each sameProducerProducts as producerProduct}
                    <ProductCard product={producerProduct} size="m" />
                {/each}
            </Accordion>
        {/if}

        {#if product.originRegion}
            <Accordion title="De la même région">
                {#each sameRegionProducts as regionProduct}
                    <ProductCard product={regionProduct} size="m" />
                {/each}
            </Accordion>
        {/if}
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
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;

        --svrollbar-track-width: 9px;
        --svrollbar-track-background: white;
        --svrollbar-track-opacity: 1;

        --svrollbar-thumb-width: 9px;
        --svrollbar-thumb-background: var(--blue);
        --svrollbar-thumb-opacity: 0.5;
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

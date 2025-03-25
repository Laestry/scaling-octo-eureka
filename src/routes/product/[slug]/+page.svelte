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
    import { fly, slide, fade } from 'svelte/transition';

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
</script>

<div class="mt-[40px] lg:max-w-[1162px] md:max-w-[780px] max-w-[320px] mx-auto">
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

            <!--description-->
            <div>
                <div
                    class="mt-[12px] flex items-end
                        lg:w-[560px] md:w-[394px] h-full"
                >
                    <h1 class="product-title">{product.name}</h1>
                </div>
                <div class="flex flex-col lg:w-[464px] md:w-[380px] h-full">
                    <div class="product-description mt-4 h-[141px] w-full px-[15px]">
                        <Svroller width="100%" height="100%" margin={{ right: -15 }} alwaysVisible>
                            {@html product.fullDescription}
                            <!--                    <button on:click={() => (expand_description = !expand_description)}-->
                            <!--                        >{expand_description ? '-' : '+'}</button-->
                            <!--                    >-->
                        </Svroller>
                    </div>

                    <div class=" w-full mt-4">
                        <div class="flex product-table">
                            <div
                                class="flex flex-col md:min-w-[280px] md:w-[280px] min-w-[186px] w-[186px] border-r-[1px] border-r-[#E859EB]"
                            >
                                <p class="product-table__type capitalize">{product.specificCategory}</p>
                                <p class="product-table__description">
                                    <b class="font-bold">{product.providerName}</b>
                                    <br />
                                    {product.name ?? ''}
                                    <br />
                                    {product.vintage}
                                    <br />
                                    {product.uvc} x {product.lblFormat}
                                </p>
                            </div>
                            <div class="flex flex-col py-2 w-full">
                                <p class="product-table__price">
                                    {priceFormat(product, true)}
                                </p>
                                <p class="product-table__price">
                                    {priceFormat(product, false)}
                                </p>
                                <p class="product-table__type-region">Acheter avant <br /> JJ mois, 20XX</p>
                                <p />
                            </div>
                        </div>
                        <div
                            class="flex md:flex-row flex-col pt-4 pb-8 border-b-[1px] border-b-[#DE6643] relative justify-between"
                        >
                            <div class="flex md:flex-col flex-row gap-2">
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
                        <button
                            on:click={() => (expand_description = !expand_description)}
                            class="abutton product-table__description flex justify-between w-full"
                        >
                            <span
                                >Le prix inclut les taxes et <span class="text-wblue underline"
                                    >le frais d’agent de 16%.</span
                                ></span
                            >

                            <span class="text-wred">
                                {expand_description ? '-' : '+'}
                            </span>
                        </button>
                        {#if expand_description}
                            <div transition:fade>
                                <ol class="list-decimal ml-[17px] text-base">
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
                                Questions? <a href="">Ecrivez-nous</a>.
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-[20px] flex flex-col gap-[13px]">
        <Accordion title="Du même producteur">
            <div>body</div>
        </Accordion>
        <Accordion title="De la même région">
            <div>body</div>
        </Accordion>
    </div>
</div>

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

        --svrollbar-track-width: 9px;
        --svrollbar-track-background: white;
        --svrollbar-track-opacity: 1;

        --svrollbar-thumb-width: 9px;
        --svrollbar-thumb-background: var(--blue);
        --svrollbar-thumb-opacity: 0.5;
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
    a {
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
        //margin-top: 14px;
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
</style>

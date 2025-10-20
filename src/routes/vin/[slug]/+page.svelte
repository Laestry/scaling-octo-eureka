<script lang="ts">
    import type { PageData } from './$types';
    import { getCategory, priceFormat, sellBeforeDate } from './utils';
    import ProductTags from './ProductTags.svelte';
    import { type AlcoholProduct, cart, getItemQuantityStore } from '$lib/cart';
    import { Svroller } from 'svrollbar';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import WaitlistForm from '$lib/components/WaitlistForm.svelte';
    import { supabase } from '$lib/supabase/client';
    import Accordion from '$lib/components/Accordion.svelte';
    import ProductCard from '../../vins/ProductCard.svelte';
    import { getOldestBatch } from '$lib/fullProduct/utils';
    import { getVinImage } from '$lib/utils/images';
    import { afterNavigate } from '$app/navigation';

    //#region props_and_data
    export let data: PageData;
    console.log('data', data);
    let product = data.product;
    //#endregion props_and_data

    //#region SELECT OLDEST BATCH

    let selectedBatch;
    $: if (product) selectedBatch = getOldestBatch(product);

    let itemQuantity;
    $: if (selectedBatch) {
        itemQuantity = getItemQuantityStore(selectedBatch.id);
    }
    $: maxCases = selectedBatch ? Math.floor(selectedBatch.calculated_quantity / product.uvc) : 0;
    $: isAtLimit = $itemQuantity >= maxCases;
    //#endregion batch_selection

    //#region ui_state
    let currentSlide = 0;
    let expand_description = false;
    let expand_question = false;
    let showWaitlistForm = false;
    //#endregion ui_state

    //#region cart_handlers
    function handleAdd() {
        if (!selectedBatch) return;
        if ($itemQuantity >= maxCases) return;
        cart.add(product, selectedBatch.id);
    }
    //#endregion cart_handlers

    //#region images
    let img0 = getVinImage(product, 0);
    let img1 = getVinImage(product, 1);
    let img2 = getVinImage(product, 2);
    //#endregion images

    //#region waitlist_handlers
    function toggleWaitlistForm() {
        showWaitlistForm = !showWaitlistForm;
    }

    //#endregion waitlist_handlers

    //#region related_products
    let sameProducerProducts: AlcoholProduct[] = [];
    let sameRegionProducts: AlcoholProduct[] = [];
    //#endregion related_products

    //#region onMount
    afterNavigate(async () => {
        console.log('vin data', data, selectedBatch);
        product = data.product;

        img0 = getVinImage(product, 0);
        img1 = getVinImage(product, 1);
        img2 = getVinImage(product, 2);

        const requestString = `
            id,
            website_slug,
            name,
            category,
            specific_category,
            provider_display_name,
            uvc,
            volume,
            format,
            unit,
            oldest_batch_id,
            oldest_vintage,
            oldest_price,
            oldest_price_tax_in,
            oldest_calculated_quantity,
            main_image_file
            `;

        let queryRegion = supabase
            .schema('cms_saq')
            .from('alcohol_view')
            .select(requestString)
            .gt('oldest_price', 0)
            .gt('oldest_price_tax_in', 0)
            .eq('region_name', product.region_name)
            .neq('id', product.id)
            .order('oldest_sell_before_date', { ascending: true })
            .order('total_quantity', { ascending: false })
            .limit(4);

        let queryCountry = supabase
            .schema('cms_saq')
            .from('alcohol_view')
            .select(requestString)
            .gt('oldest_price', 0)
            .gt('oldest_price_tax_in', 0)
            .eq('country_id', product.country_id)
            .neq('id', product.id)
            .order('oldest_sell_before_date', { ascending: true })
            .order('total_quantity', { ascending: false })
            .limit(4);

        let queryParties = supabase
            .schema('cms_saq')
            .from('alcohol_view')
            .select(requestString)
            .gt('oldest_price', 0)
            .gt('oldest_price_tax_in', 0)
            .eq('provider_id', product.parties?.id)
            .neq('id', product.id)
            .order('oldest_sell_before_date', { ascending: true })
            .order('total_quantity', { ascending: false })
            .limit(4);

        const queryResponses = await Promise.all([queryRegion, queryCountry, queryParties]);
        console.log('query responses', queryResponses);
        const [regionResponse, countryResponse, partiesResponse] = queryResponses;
        sameRegionProducts = [...(regionResponse.data ?? []), ...(countryResponse.data ?? [])].slice(0, 3);
        sameProducerProducts = partiesResponse.data;

        console.log('related products', sameProducerProducts, sameRegionProducts);
    });
    //#endregion
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
                   lg:ml-[486px] md:ml-[332px]

                  "
        />
        <div class="md:flex-row flex-col flex gap-x-[10px] mt-[10px] items-start">
            <!--region images-->
            <div
                class="relative
                lg:w-[462px] md:w-[308px] w-[280px]
                lg:h-[639px] md:h-[439px] h-[262px]
                mr-[14px]
                "
            >
                <button
                    class="absolute z-[1] left-0 bottom-0 lg:w-[271px] lg:h-[375px] md:w-[181px] md:h-[241px] w-[94px] h-[125px]"
                    class:z-[4]={currentSlide === 0}
                    on:mouseenter={() => (currentSlide = 0)}
                    on:click={() => (currentSlide = 0)}
                >
                    <img class="object-cover w-full h-full" src={img0} alt="Wine" />
                </button>
                <button
                    class="absolute z-[2] md:left-[12px] left-[6px] bottom-0 lg:w-[450px] lg:h-[591px] md:w-[247px] md:h-[439px] w-[196px] h-[262px]"
                    class:z-[4]={currentSlide === 2}
                    on:mouseenter={() => (currentSlide = 2)}
                    on:click={() => (currentSlide = 2)}
                >
                    <img class="object-cover w-full h-full" src={img2} alt="Wine" />
                </button>
                <button
                    class="absolute z-[3] md:left-[12px] left-[99px] bottom-0 lg:w-[374px] lg:h-[639px] md:w-[300px] md:h-[401px] w-[181px] h-[240px]"
                    class:z-[4]={currentSlide === 1}
                    on:mouseenter={() => (currentSlide = 1)}
                    on:click={() => (currentSlide = 1)}
                >
                    <img class="object-cover w-full h-full" src={img1} alt="Wine" />
                </button>
            </div>
            <!--endregion-->

            <div class="lg:w-[560px] md:w-[442px]">
                <!--region title-->
                <div class="mt-[12px] flex items-end h-full">
                    <h1 class="product-name !capitalize lg:text-[42px] text-2xl">{product.name}</h1>
                </div>
                <!--endregion-->

                <!--region subtitle-->
                <div
                    class="product-description mt-[10px] w-full h-auto pr-[15px]
                             md:flex-shrink-0"
                >
                    <p class="tasting-note">
                        {product.alcohol_website[0].subtitle_french ?? 'La courte description va ici'}
                    </p>
                </div>
                <!--endregion-->

                <div class="flex flex-col lg:w-[560px] md:w-[442px] h-full">
                    <!--region description-->
                    <div class="product-description mt-4 h-[141px] w-full pr-[15px]">
                        <Svroller width="100%" height="100%" margin={{ right: -15 }} alwaysVisible>
                            {@html product.alcohol_website[0].description_french ?? 'La description va ici'}
                        </Svroller>
                    </div>
                    <!--endregion-->

                    <div class="w-full mt-4">
                        <!--region facts block-->
                        <div class="flex product-table lg:h-[141px] h-[104px]">
                            <!--                            left-->
                            <div
                                class="flex flex-col border-r-[1px] border-r-[#DA5899]
                                        lg:w-[380px] md:w-[235px] w-[186px]"
                            >
                                <p class="border-b border-wred lg:h-[32px] h-[28px] capitalize flex items-center">
                                    {product.category && product.specific_category ? getCategory(product) : '-'}
                                </p>
                                <div class="flex items-center flex-1">
                                    <div class="w-fit">
                                        <b class="font-normal, color: var(--WARD-BLACK, #181C1C);"
                                            >{product?.parties?.display_name}</b
                                        >
                                        <br />
                                        <span class="text-wpink">{product.name ?? ''}</span>
                                        <br />
                                        {product.vintage ?? ''}
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

                                <div class="flex flex-1 items-center justify-end text-end">
                                    Acheter avant <br />
                                    {sellBeforeDate(selectedBatch.sell_before_date)}
                                </div>
                            </div>
                        </div>
                        <!--endregion-->

                        <!--region add products-->
                        <div class=" mt-4 pb-8 relative border-b-[1px] border-b-[#DE6643]">
                            <div class="items-center flex flex-row justify-between flex-wrap">
                                <div class="text-xs md:w-full w-fit md:mb-4">
                                    Bouteilles ({product.uvc}/caisse)
                                </div>
                                <div class="text-xs product-table-counter__value">
                                    {selectedBatch.calculated_quantity > 0 ? $itemQuantity * product.uvc : '/'}
                                </div>
                                {#if selectedBatch.calculated_quantity}
                                    <button
                                        disabled={isAtLimit}
                                        class="product-table__button abutton md:mt-0 mt-7 lg:mr-[192px]"
                                        on:click={handleAdd}
                                    >
                                        {#if !isAtLimit}
                                            Ajouter au panier
                                        {:else}
                                            Rupture de stock
                                        {/if}
                                    </button>
                                {:else}
                                    <button
                                        class="product-table__button product-table__button--favorite abutton md:mt-0 mt-7"
                                        on:click={toggleWaitlistForm}
                                    >
                                        Liste d'attente
                                    </button>
                                {/if}
                            </div>

                            <p class="absolute text-[16px] bg-[#F6F1F2] text-[#DE6643] bottom-[-12px] pr-1">*</p>
                        </div>
                        <!--endregion-->

                        <!--region question-->
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
                        <!--endregion-->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!--region  suggestions-->
    <div class="mt-[20px] flex flex-col lg:gap-[22px] gap-[10px]">
        {#if sameProducerProducts && sameProducerProducts.length > 0}
            <Accordion title="Du même producteur" closed={false}>
                {#each sameProducerProducts as producerProduct}
                    <ProductCard product={producerProduct} size="m" />
                {/each}
            </Accordion>
        {/if}

        {#if sameRegionProducts && sameRegionProducts.length > 0}
            <Accordion title="De la même région" closed={false}>
                {#each sameRegionProducts as regionProduct}
                    <ProductCard product={regionProduct} size="m" />
                {/each}
            </Accordion>
        {/if}
    </div>
    <!--endregion-->
</div>

{#if showWaitlistForm}
    <WaitlistForm on:submit={handleWaitlistSubmit} on:decline={toggleWaitlistForm} on:close={toggleWaitlistForm} />
{/if}

<style lang="scss">
    @media (max-width: 1136px) {
    }
    @media (max-width: 760px) {
    }

    .product-name {
        color: var(--WARD-RED, #f15a38);
        font-family: Riposte;
        font-size: 32px;
        font-style: normal;
        font-weight: 400;
        line-height: 42px;
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

    .tasting-note {
        color: var(--WARD-BLACK, #181c1c);
        font-family: Riposte, sans-serif;
        font-size: 32px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        z-index: 1000;
    }

    .product-description button {
        color: var(--red);
    }

    .product-description :global(*) {
        font-weight: normal !important;
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
        background: var(--blue);
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

    .product-table__button:disabled {
        background: var(--content---secondary) !important;
    }

    .product-table__button:last-child {
        background: #2d63b0;
    }
    .product-table__button--favorite {
        background: #2d63b0 !important;
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

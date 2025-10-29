<script lang="ts">
    import type { PageData } from './$types';
    import ProductCard from './vins/ProductCard.svelte';

    export let data: PageData;
    // $: console.log('data', data);
    let products = data.products.data;

    let sizeSequence1 = ['m', 's', 'l', 'm', 'l', 'm', 's', 'm'];
    let sizeSequence2 = ['l', 'm', 's', 'm'];

    $: outerWidth = 0;

    $: if (outerWidth < 767) {
        sizeSequence1 = ['m', 'm', 'l'];
        sizeSequence2 = ['m', 'm', 'l'];
    } else {
        sizeSequence1 = ['m', 's', 'l', 'm', 'l', 'm', 's', 'm'];
        sizeSequence2 = ['l', 'm', 's', 'm'];
    }
</script>

<svelte:window bind:outerWidth />

<div class="flex flex-col items-center">
    <div class="flex mx-auto flex-col min-h-[90vh] lg:w-[1136px] md:w-[760px] w-[300px]">
        <div class="justify-between md:flex-row flex-col-reverse flex md:mt-[134px] gap-[20px] my-[80px] md:mb-[137px]">
            <div class="h3 description max-w-[844px] text-color1">
                Bienvenue chez Ward & Associés. Agence indépendante basée à Montréal, spécialisée en vins naturels,
                vivants et libres. On explore, on partage, et on boit avec intention.
            </div>
        </div>

        <div class="title mb-[19px]">Nos vins</div>
        <div
            class="card__row items-start flex lg:gap-x-[16px] gap-x-[10px] md:gap-x-[11px] lg:mb-[39px] mb-[20px] flex-wrap
                   lg:gap-y-[50px] md:gap-y-[40px] gap-y-[20px]"
        >
            {#each products as product, i (product.id)}
                <ProductCard {product} size={sizeSequence1[i % sizeSequence1.length]} />
            {/each}
        </div>

        <div class="description2 lg:mt-[113px] lg:mb-[180px] my-[80px] text-color1">
            Nos vins sont issus d’une viticulture respectueuse et de vinifications sans artifice. Des cuvées sincères,
            parfois imprévisibles, toujours choisies pour leur énergie et leur intégrité.
        </div>

        <div
            class="card__row card__row--reverse items-start flex lg:gap-x-[16px] gap-x-[10px] md:gap-x-[11px] gap-y-[20px] flex-wrap mb-[62px]"
        >
            {#each products as product, i (product.id)}
                {#if i < 4}
                    <ProductCard {product} size={sizeSequence2[i % sizeSequence2.length]} />
                {/if}
            {/each}
        </div>
        <!--
        <a href="/vins" class="isMain-page-button self-end">
            Encore plus <span class="text-color5">+</span>
        </a> -->
    </div>
    <div class="instablock">
        <div class="lg:max-w-[1212px] px-[38px] md:max-w-[836px] max-w-[376px] mx-auto container">
            <p class="instablock__title">
                Ne passez pas à côté. Suivez-nous pour les arrivages qui comptent, les dégustations qui bousculent, et
                les vigneron·ne·s qui font bouger les lignes. <br />
                <a href="https://www.facebook.com/people/Ward-associ%C3%A9s/100063536502149/">
                    <button class="instablock__button">@wardetassocies</button>
                </a>
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    .new {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        width: -webkit-fill-available;
        margin: 5%;
        gap: 16px;
    }
    .instablock {
        margin-bottom: -53px;
        background: #da5899;
        width: 100%;
        padding: 64px 0;
        &__button {
            color: #000;
            text-align: center;
            font-size: 12px;
            font-style: normal;
            font-weight: 500;
            line-height: 150%; /* 18px */
            letter-spacing: -0.132px;
            padding: 4px 12px;
            border-radius: 12px;
            background: white;
        }
        .container {
            display: flex;
            align-items: flex-start;
            gap: 32px;
            flex-direction: column-reverse;
        }
        &__title {
            color: #f6f1f2;
            font-size: 50px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
        }
    }
    .card {
        &__text {
            width: 100%;
            font-size: 12px;
            line-height: 18px;
            b {
                font-weight: 700;
            }
        }
    }
    .description {
        font-size: 32px;
        font-style: normal;
        font-weight: 400;
        line-height: 42px;
    }

    .title {
        font-size: 30px;
        font-style: normal;
        font-weight: 700;
        line-height: 125%;
    }

    .description2 {
        font-size: 52px;
        font-style: normal;
        font-weight: 500;
        line-height: 62px;
    }

    .main-page-button {
        font-size: 30px;
        font-style: normal;
        font-weight: 700;
        line-height: 125%;
    }
    @media (max-width: 1162px) {
        .description {
            font-size: 20px;
            line-height: 125%;
        }
        .description2 {
            font-size: 35px;
            line-height: 42px;
        }
        .instablock {
            &__title {
                font-size: 35px;
            }
        }
    }
    @media (max-width: 767px) {
        .instablock {
            padding: 40px 0;
            &__title {
                font-size: 24px;
            }
        }
        .card {
            &__row {
                :global(.card:nth-child(1)) {
                    order: 1;
                }
                :global(.card:nth-child(2)) {
                    order: 4;
                }

                :global(.card:nth-child(3)) {
                    order: 3;
                }

                :global(.card:nth-child(4)) {
                    order: 2;
                }
                &--reverse {
                    :global(.card:nth-child(1)) {
                        order: 4;
                    }
                    :global(.card:nth-child(2)) {
                        order: 1;
                    }

                    :global(.card:nth-child(3)) {
                        order: 3;
                    }

                    :global(.card:nth-child(4)) {
                        order: 2;
                    }
                }
            }
        }
    }
</style>

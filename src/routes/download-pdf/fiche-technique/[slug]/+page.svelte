<!--src/routes/download-pdf/fiche-technique/[slug]/+page.svelte-->
<script>
    import { IconLogoWithName } from '$lib/icons';
    import { getCategory, priceFormat } from '../../../vin/[slug]/utils';
    import { getOldestBatch } from '$lib/fullProduct/utils';
    import Footer from '../../Footer.svelte';
    import { onMount, tick } from 'svelte';
    import { handleGetPDF } from '../../utils';
    import { getVinImage } from '$lib/utils/images';
    import { isPrixResto } from '$lib/store';
    export let data;
    console.log('data', data);
    $: product = data.product;
    let selectedBatch;
    $: if (product) selectedBatch = getOldestBatch(product);

    onMount(async () => {
        await tick();
        await handleGetPDF(`Ward&Associés ${product.alcohol_website?.[0]?.name} fiche technique`);
        window.close();
    });
</script>

<button
    on:click={() => {
        handleGetPDF(`Ward&Associés ${product.alcohol_website?.[0]?.name} fiche technique`);
    }}
>
    Download PDF
</button>

<div id="pdf" class="sheet flex flex-col justify-between h-full">
    <div>
        <div class="w-[112.64px] flex justify-center items-center">
            <IconLogoWithName />
        </div>

        <div class="flex gap-[13px] h-[170.88px] mt-[50.24px]">
            <img width="128" height="170.88" src={getVinImage(product, 0)} alt="" />
            <div class="w-[381.44px] h-full flex flex-col justify-between">
                <div class="title">{product.alcohol_website?.[0]?.name}</div>

                <div class="body border-t border-wblue flex">
                    <div class="w-[228.8px] border-r border-wpink">
                        <div class="h-[30.08px] pt-[6px] capitalize">{getCategory(product)}</div>
                        <div class="h-[58.56px] border-t border-wred pt-[6px]">
                            <b class="font-normal, color: var(--WARD-BLACK, #181C1C);">
                                {product?.parties?.display_name}
                            </b>
                            <br />
                            {product.alcohol_website.name ?? ''}
                            <br />
                            {product.vintage ?? ''}
                            <br />
                            {product.uvc} x {product.format}{product.unit === 1 ? 'L' : 'ml'}
                        </div>
                    </div>
                    <div class="w-[152.64px] flex flex-col items-end pt-[6px]">
                        <div class="priceTitle">Prix Resto</div>
                        <b>
                            {$priceFormat(
                                {
                                    price: selectedBatch.price,
                                    price_tax_in: selectedBatch.price_tax_in,
                                    uvc: product.uvc,
                                    isPrixResto: true
                                },
                                true
                            )}
                        </b>
                        <b>
                            {$priceFormat(
                                {
                                    price: selectedBatch.price,
                                    price_tax_in: selectedBatch.price_tax_in,
                                    uvc: product.uvc,
                                    isPrixResto: true
                                },
                                false
                            )}
                        </b>
                        <div class="priceTitle mt-[5px]">Prix Perso</div>
                        <b>
                            {$priceFormat(
                                {
                                    price: selectedBatch.price,
                                    price_tax_in: selectedBatch.price_tax_in,
                                    uvc: product.uvc,
                                    isPrixResto: false
                                },
                                true
                            )}
                        </b>
                        <b>
                            {$priceFormat(
                                {
                                    price: selectedBatch.price,
                                    price_tax_in: selectedBatch.price_tax_in,
                                    uvc: product.uvc,
                                    isPrixResto: false
                                },
                                false
                            )}
                        </b>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-[381.44px] ml-[141px] mt-[26px] body">
            {@html product.alcohol_website?.[0]?.description_french ?? 'La description va ici'}
        </div>
    </div>

    <Footer />
</div>

<style>
    .sheet {
        transform-origin: 0 0;
        height: 1056px; /* 3300 → 1056 */
        width: 816px; /* 2550 → 816  */
        background: #fff;
        padding: 48px 27.2px 46.72px 48px; /* 150 85 146 150 */
        box-shadow: 0 3.2px 9.6px rgba(0, 0, 0, 0.12); /* 0 10 30 */
    }

    .title {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 20.48px;
        line-height: 100%;
        letter-spacing: 0%;
    }

    .body {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 11.52px;
        line-height: 120%;
        letter-spacing: 0%;
    }

    .priceTitle {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 8px;
        leading-trim: NONE;
        line-height: 120%;
        letter-spacing: 0%;
        text-align: right;
    }
</style>

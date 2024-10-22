<script lang="ts">
    import Tag from './Tag.svelte';
    import type { ProductNode, VariantNode } from '$lib/models/shopifyTypes';
    import { getNumberFromId } from '$lib/utils.js';

    export let product: ProductNode;

    // Assuming the first variant is the bottle and the second variant is the case
    const bottleVariant: VariantNode | undefined = product.variants.edges[0]?.node;
    const caseVariant: VariantNode | undefined = product.variants.edges[1]?.node;

    const bottlePrice: number = bottleVariant ? bottleVariant.priceV2.amount : 'N/A';

    console.log(product);
</script>

<a href="/products/{getNumberFromId(product.id)}">
    <div class="w-full">
        <img
            src={product.images.edges[0]?.node.originalSrc || '/defaultImages/product-image.png'}
            alt="product"
            class="lg:h-[376px] md:h-[240px] h-[193px] mb-[4px] w-full bg-no-repeat object-cover"
            style="object-fit: cover;"
        />
        <div class="flex flex-col pt-3 gap-3">
            <div class="flex md:flex-row md:gap-0 gap-3 flex-col justify-between">
                <p class="type">Type de vin</p>
                <div class="flex flex-col">
                    <p class="price md:text-right">{parseInt(bottlePrice / 6) ?? 'N/A'} $ / B</p>
                    <p class="price md:text-right">{parseInt(bottlePrice) ?? 'N/A'} $ / C</p>
                </div>
            </div>
            <div class="flex flex-col">
                <p class="type">
                    <b class="font-bold">{product.title ?? 'N/A'}</b>
                    <br />
                    {product?.varietal?.value ?? 'N/A'}, {product?.region?.value ?? 'N/A'},
                    <br />
                </p>
                <div class="flex justify-between">
                    <p class="type">6 x {product?.ml?.value ?? 'N/A'}</p>
                    <button class="add-cart"> ADD + </button>
                </div>
            </div>
        </div>
        <!-- <div class="border-y-2 px-[16px] py-[8px]">
            <div class="t1">{product.title}</div>
            <div class="flex flex-wrap justify-between gap-y-[14px] mt-[12px]">
                <Tag>{product?.producer?.value ?? 'N/A'}</Tag>
                <Tag>{product?.color?.value ?? 'N/A'}</Tag>
                <Tag>{product?.ml?.value ?? 'N/A'}ml</Tag>
                <div class="flex justify-between w-full">
                    <Tag>{Math.trunc(bottlePrice)} CAD/Btl.</Tag>
                    <Tag>{Math.trunc(bottlePrice * 6)} CAD/Caisse</Tag>
                </div>
            </div>
        </div> -->
    </div>
</a>

<style land="scss">
    .add-cart {
        font-size: 11px;
        color: #3777bc;
        text-align: right;
        font-weight: 700;
    }
    .price {
        color: #1e1e1e;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        line-height: 150%; /* 18px */
        text-transform: capitalize;
    }
    .type {
        color: #1e1e1e;
        font-family: 'Riposte';
        font-size: 12px;
        font-style: normal;
        line-height: 150%; /* 18px */
    }
</style>

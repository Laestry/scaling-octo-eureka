<script lang="ts">
    import { goto } from '$app/navigation';
    import { priceFormat, getCategory } from '../vin/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { fly, fade } from 'svelte/transition';
    import Plus from '$lib/icons/Plus.svelte';
    import { getOldestBatch } from './utils';
    import { getImage } from '$lib/utils/images';

    export let product: any;
    export let isPDF = false;

    let delayedImage = '';
    let loadImageTimer: ReturnType<typeof setTimeout>;
    let imgLoaded = false;
    $: if (delayedImage) {
        imgLoaded = false;
        const imageLoader = new Image();
        imageLoader.src = delayedImage;
        imageLoader.onload = () => (imgLoaded = true);
    }

    // hover image positioning
    let mouseX = 0;
    let mouseY = 0;
    let hovered = false;
    function handleMouseMove(e: MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const plusButtonWidth = 90;
        const safeMax = rect.width - plusButtonWidth;
        const rawX = e.clientX - rect.left;
        mouseX = rawX > safeMax ? safeMax : rawX;
        mouseY = e.clientY - rect.top;
    }
    function handleMouseEnter(e: MouseEvent) {
        hovered = true;
        handleMouseMove(e);
        loadImageTimer = setTimeout(() => (delayedImage = getImage(product)), 0);
    }
    function handleMouseLeave() {
        hovered = false;
        clearTimeout(loadImageTimer);
        delayedImage = '';
        imgLoaded = false;
    }

    function handleClick() {
        const slug = product?.website_slug ?? 'noslug';
        goto(`/vin/${slug}`);
    }

    // view -> pseudo-batch fallback
    function asViewBatch(p: any) {
        if (p?.oldest_batch_id == null) return null;
        return {
            id: p.oldest_batch_id,
            vintage: p.oldest_vintage,
            price: p.oldest_price,
            price_tax_in: p.oldest_price_tax_in,
            calculated_quantity: p.oldest_calculated_quantity
        };
    }

    // batches and cart integration
    $: selectedBatch = getOldestBatch(product) ?? asViewBatch(product);

    let itemQuantity;
    $: if (selectedBatch) {
        itemQuantity = getItemQuantityStore(selectedBatch.id);
    }

    $: maxCases = (() => {
        if (!selectedBatch) return 0;
        const availableBottles = selectedBatch.calculated_quantity ?? 0;
        return product?.uvc > 0 ? Math.floor(availableBottles / product.uvc) : 0;
    })();

    function handleAdd() {
        if (!selectedBatch) return;
        if ($itemQuantity >= maxCases) return;
        cart.add(product, selectedBatch.id);

        const id = Date.now();
        animations = [...animations, { id }];
        setTimeout(() => {
            animations = animations.filter((a) => a.id !== id);
        }, 600);
    }

    let animations: { id: number }[] = [];

    // display helpers from view
    const providerName = product?.provider_display_name ?? '';
    $: region = product?.region_name?.trim?.() || '-';
</script>

<tr
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:mousemove={handleMouseMove}
    on:click={handleClick}
    class="relative border-b border-[#181C1C33] cursor-blue-dot {$$props['class']}"
>
    <td>{region}</td>
    <td>{providerName || '-'}</td>
    <td class="truncate">{product?.name || '-'}</td>
    <td>{selectedBatch?.vintage ?? '-'}</td>
    <td class="capitalize">{getCategory(product) || '-'}</td>
    <td>{product?.uvc} x {product?.volume}</td>
    <td class="text-right pr-[5px]">
        {#if selectedBatch}
            {$priceFormat({ price: selectedBatch.price, price_tax_in: selectedBatch.price_tax_in, uvc: product.uvc })}
            <br />
            <span class="text-[#949494] {product?.uvc === 1 ? 'invisible' : ''}">
                {$priceFormat(
                    { price: selectedBatch.price, price_tax_in: selectedBatch.price_tax_in, uvc: product.uvc },
                    false
                )}
            </span>
        {:else}
            —
        {/if}
    </td>

    {#if !isPDF}
        <td class="text-wblue">
            <button
                class="abutton w-full h-full {$itemQuantity >= maxCases ? 'opacity-50 cursor-not-allowed' : ''}"
                style="padding: 18px 16px 17px 12px"
                on:click|stopPropagation={handleAdd}
                disabled={$itemQuantity >= maxCases}
                aria-label="Add to cart"
            >
                <Plus />
            </button>
        </td>
    {/if}

    {#if hovered && imgLoaded && delayedImage}
        <div
            class="absolute pointer-events-none product-row-image"
            style="left: {mouseX}px; top: {mouseY}px; transform: translate(-50%, -50%);"
        >
            {#each animations as anim (anim.id)}
                <div
                    class="fly-animation !text-wblack"
                    in:fly={{ y: 25, duration: 600 }}
                    out:fly={{ y: -30, duration: 600 }}
                    style="position: absolute; left: 50%; top: -20px; transform: translateX(-50%); pointer-events: none; z-index: 10;"
                >
                    {$itemQuantity > 0 ? $itemQuantity * product.uvc : ''}
                </div>
            {/each}
            {#if !isPDF}
                <img transition:fade={{ duration: 300 }} src={delayedImage} alt={product?.name} />
            {/if}
        </div>
    {/if}
</tr>

<style>
    tr.relative:hover {
        background-color: #da58994d;
    }
    tr.relative {
        position: relative;
    }
    .product-row-image {
        width: 100px;
        height: auto;
        pointer-events: none;
        z-index: 10;
    }
    td {
        height: 48px;
    }
</style>

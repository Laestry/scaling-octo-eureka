<script lang="ts">
    import { goto } from '$app/navigation';
    import { priceFormat } from '../product/[slug]/utils';
    import { cart, getItemQuantityStore } from '$lib/cart';
    import { fly, fade } from 'svelte/transition';
    export let product: any;

    // Create an array of example image paths.
    const images = new Array(8).fill('').map((_, i) => `/images/example_wines/${i + 1}.jpg`);

    // Return a number based on product properties.
    function getRandomNumber() {
        const n1 = parseInt(product.sku);
        if (!Number.isNaN(n1)) {
            return n1;
        }
        const n2 = product.external_id.split('').find((x) => !Number.isNaN(parseInt(x))) || '0';
        return parseInt(n2);
    }

    // Determine the image using the random number.
    function getImage() {
        const n = getRandomNumber();
        const i = n % images.length;
        return images[i]!;
    }

    // Instead of loading the image immediately, we'll use a delayed variable.
    let delayedImage = '';
    let loadImageTimer: NodeJS.Timeout;

    // Preload the image and set a flag when it's loaded.
    let imgLoaded = false;
    $: if (delayedImage) {
        imgLoaded = false;
        const imageLoader = new Image();
        imageLoader.src = delayedImage;
        imageLoader.onload = () => {
            imgLoaded = true;
        };
    }

    // Mouse position state relative to the row.
    let mouseX = 0;
    let mouseY = 0;
    let hovered = false;

    function handleMouseMove(e: MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }

    function handleMouseEnter(e: MouseEvent) {
        hovered = true;
        handleMouseMove(e); // update mouse position on enter
        // Start a timer to load the image after 300ms.
        loadImageTimer = setTimeout(() => {
            delayedImage = getImage();
        }, 0);
    }

    function handleMouseLeave(e: MouseEvent) {
        hovered = false;
        // Cancel the image load timer if hover ends too soon.
        clearTimeout(loadImageTimer);
        delayedImage = '';
        imgLoaded = false;
    }

    // We'll use a timer to differentiate between single and double clicks.
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    function handleClick(e: MouseEvent) {
        clickCount++;
        if (clickCount === 1) {
            // Start timer to wait for a potential second click.
            clickTimer = setTimeout(() => {
                // No second click occurred within the delay: single click.
                goto(`/product/${product.slug}`);
                clickCount = 0;
            }, 550);
        } else if (clickCount === 2) {
            // Double click detected: cancel single click.
            clearTimeout(clickTimer);
            clickCount = 0;
            // Execute double-click behavior: add product to cart.
            cart.add(product);
            const id = Date.now();
            animations = [...animations, { id }];
            setTimeout(() => {
                animations = animations.filter((anim) => anim.id !== id);
            }, 600);
        }
    }

    const itemQuantity = getItemQuantityStore(product.id);
    let animations: { id: number }[] = [];

    let region = '';
    $: {
        const r = product.originRegion?.trim() || '';
        const c = product.originCountry?.trim() || '';
        if (r && c) {
            region = `${r}, ${c}`;
        } else if (r) {
            region = r;
        } else if (c) {
            region = c;
        } else {
            region = '-';
        }
    }
</script>

<!-- Attach only the custom click handler (plus mouse events for hover) -->
<tr
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:mousemove={handleMouseMove}
    on:click={handleClick}
    class="relative cursor-pointer border-y border-[#181C1C33]"
>
    <td>{region || '-'}</td>
    <td>{product.providerName || '-'}</td>
    <td class="truncate">{product.name || '-'}</td>
    <td>{product.vintage || '-'}</td>
    <td class="capitalize">{product.specificCategory || '-'}</td>
    <td>{product.uvc} x {product.lblFormat}</td>
    <td class="text-right pr-[5px]">
        {$priceFormat(product)}
        <br />
        <span class="text-[#949494] {product.uvc === 1 ? 'invisible' : ''}">
            {$priceFormat(product, false)}
        </span>
    </td>

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
            <div class="bg-wblack text-white text-xs">2clics = +panier</div>
            <img transition:fade={{ duration: 300 }} src={delayedImage} alt={product.name} />
            <div class="bg-wblack text-white text-xs">1clic = voir produit</div>
        </div>
    {/if}
</tr>

<style>
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
    tr:hover {
        color: #181c1c33;
    }
</style>

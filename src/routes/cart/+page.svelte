<script lang="ts">
    import { cart } from '$lib/cart';
    import ProductCard from '../products/ProductCard.svelte';
    import { fade } from 'svelte/transition';
    async function createCheckout() {
        // Build checkout items from the cart store
        const items = $cart.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity
        }));

        console.log('items', items);

        const response = await fetch('/api/createCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(items)
        });

        const checkoutUrl = await response.json();
        window.location.href = checkoutUrl;
    }

    // Log the cart for debugging
    console.log($cart);
</script>

<div class="mt-[40px] flex flex-col">
    <div class="px-[98px] pt-[48px] flex flex-wrap gap-3">
        {#each $cart as item, i}
            <div transition:fade>
                {#if i + 1 < $cart.length}
                    <ProductCard product={item} isCart size="m" />
                {/if}
            </div>
        {/each}
    </div>
</div>

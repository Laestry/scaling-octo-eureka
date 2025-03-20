<script lang="ts">
    import { cart } from '$lib/cart';
    import IconMinus from '$lib/icons/minus.svg';
    import IconPlus from '$lib/icons/plus.svg';
    import IconArrow1 from '$lib/icons/arrow1.svg';

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
    <a href="/products">
        <button>
            <img src={IconArrow1} alt="back" style="transform: rotate(90deg); width: 1.5rem;" />
        </button>
    </a>

    <div class="px-[98px] pt-[48px] flex flex-col">
        {#each $cart as item, i}
            <div class="">
                <div class="h-[248px] flex flex-wrap justify-between gap-[128px]">
                    <div class="flex gap-[8px] h-[248px]">
                        <img
                            src={item.picture}
                            alt={item.title}
                            class="w-[228px] bg-no-repeat object-cover rounded-[6px]"
                        />
                        <div class="rounded-[6px] bg-primary w-[212px] p-[16px]">
                            <div class="t1">{item.title}</div>
                            <div class="mt-[32px] ml-[8px] coc2">
                                <div>{item.color}</div>
                                <div>{item.style}</div>
                                <div>
                                    PPC{item.price} & PPB{Math.round(parseFloat(item.price) / 6)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex max-w-[448px] flex-1 justify-between items-center">
                        <!-- Remove the item completely -->
                        <button class="button2" on:click={() => cart.remove(item.id)}> remove </button>

                        <div class="flex items-center gap-[14px] oai">
                            <!-- Decrease quantity -->
                            <button on:click={() => cart.remove(item.id)}>
                                <img src={IconMinus} alt="less" />
                            </button>
                            <div>{item.quantity}</div>
                            <!-- Increase quantity -->
                            <button on:click={() => cart.add(item, 1)}>
                                <img src={IconPlus} alt="more" />
                            </button>
                        </div>

                        <div class="button2">
                            ${parseFloat(item.price) * item.quantity}
                        </div>
                    </div>
                </div>

                {#if i + 1 < $cart.length}
                    <div class="my-[32px] border-b w-full" />
                {/if}
            </div>
        {/each}

        <button on:click={createCheckout} class="button max-w-[640px] py-[15px] px-[40px] flex-1 bg-buttonP mt-[167px]">
            Checkout
        </button>
    </div>
</div>

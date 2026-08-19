<script lang="ts">
    import { onMount } from 'svelte';
    import { cart } from '$lib/cart';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import { fade } from 'svelte/transition';
    import { loadStripe } from '@stripe/stripe-js';
    import { PUBLIC_STRIPE_PK_TEST } from '$env/static/public';
    import { clearCheckout } from '$lib/checkout';

    let orderId: string | null = null;
    /** 'ok' once the payment is confirmed, 'pending' while checking, 'failed' if it didn't go through */
    let state: 'ok' | 'pending' | 'failed' = 'pending';
    let failureMessage = '';

    onMount(async () => {
        const url = get(page).url;
        orderId = url.searchParams.get('orderId');

        // Cards that need no extra authentication are confirmed on /pay, which clears the cart
        // and sends us here directly. Flows like 3-D Secure come back through Stripe's
        // return_url instead, so re-check the intent rather than trusting the redirect.
        const clientSecret = url.searchParams.get('payment_intent_client_secret');

        if (!clientSecret) {
            state = 'ok';
            return;
        }

        const stripe = await loadStripe(PUBLIC_STRIPE_PK_TEST);
        const result = await stripe?.retrievePaymentIntent(clientSecret);
        const intent = result?.paymentIntent;

        if (intent?.status === 'succeeded' || intent?.status === 'processing') {
            cart.clear();
            clearCheckout();
            state = 'ok';
            return;
        }

        state = 'failed';
        failureMessage =
            intent?.status === 'requires_payment_method'
                ? 'Le paiement a été refusé ou annulé.'
                : (result?.error?.message ?? 'Le paiement n’a pas pu être confirmé.');
    });
</script>

<div class="flex flex-col items-center h-[60vh] mt-3">
    <div class="lg:w-[800px] md:w-[680px] w-[358px]">
        <div class="h-[96px] mx-auto flex flex-wrap gap-4 justify-between items-end">
            {#if state === 'failed'}
                <div in:fade>
                    <h1 class="!capitalize text-5xl">Paiement non complété</h1>
                    <div>{failureMessage}</div>
                    <a href="/cart" class="underline text-wblue">Retourner au panier</a>
                </div>
            {:else}
                <div>
                    <h1 class="!capitalize text-5xl">Merci!</h1>
                    <div>Le paiement a bien été reçu.</div>
                </div>

                {#if orderId}
                    <div in:fade>
                        <div>Votre commande <strong>n°[{orderId}]</strong> est en cours de traitement.</div>

                        <div>
                            Un courriel vous sera envoyé sous peu pour confirmer la commande et vous indiquer les
                            prochaines étapes.
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
    // Portaus opened the PaymentIntent in THEIR Stripe account, so this key must be Portaus's
    // publishable key — a key for any other account will not find this intent.
    import { PUBLIC_STRIPE_PK_TEST } from '$env/static/public';
    import { readCheckout, clearCheckout, type Checkout } from '$lib/checkout';
    import { cart } from '$lib/cart';
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';

    let checkout: Checkout | null = null;
    let stripe: Stripe | null = null;
    let elements: StripeElements | null = null;

    let ready = false;
    let submitting = false;
    let errorMessage = '';

    onMount(async () => {
        checkout = readCheckout();
        if (!checkout) {
            errorMessage = 'Aucun paiement en cours. Veuillez recommencer votre commande.';
            return;
        }

        stripe = await loadStripe(PUBLIC_STRIPE_PK_TEST);
        if (!stripe) {
            errorMessage = 'Le module de paiement n’a pas pu être chargé. Veuillez réessayer.';
            return;
        }

        elements = stripe.elements({
            clientSecret: checkout.clientSecret,
            appearance: { theme: 'flat', variables: { borderRadius: '24px', fontFamily: 'Inter, sans-serif' } }
        });
        elements
            .create('payment', {
                layout: 'tabs',
                // Stripe geo-guesses the country otherwise; these orders are always CAD/Québec.
                defaultValues: { billingDetails: { address: { country: 'CA' } } }
            })
            .mount('#payment-element');

        ready = true;
    });

    onDestroy(() => {
        elements = null;
        stripe = null;
    });

    async function pay() {
        if (!stripe || !elements || !checkout) return;

        submitting = true;
        errorMessage = '';

        const orderParam = checkout.salesOrderNumber ? `?orderId=${encodeURIComponent(checkout.salesOrderNumber)}` : '';

        // `if_required` keeps plain cards on this page and only leaves for flows that genuinely
        // need it, like 3-D Secure. Those come back to /success, which re-checks the status.
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/success${orderParam}` },
            redirect: 'if_required'
        });

        if (error) {
            errorMessage = error.message ?? 'Le paiement a échoué. Veuillez vérifier vos informations.';
            submitting = false;
            return;
        }

        if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
            cart.clear();
            clearCheckout();
            await goto(`/success${orderParam}`);
            return;
        }

        errorMessage = 'Le paiement n’a pas pu être complété. Veuillez réessayer.';
        submitting = false;
    }
</script>

<svelte:head><title>Paiement — Ward &amp; Associés</title></svelte:head>

<div class="flex flex-col items-center mt-[53px]">
    <div class="lg:w-[800px] md:w-[680px] w-[358px]">
        <h1 class="!capitalize text-5xl mb-2">Paiement</h1>

        {#if checkout}
            <div class="flex flex-col gap-1 mb-6 text-base" in:fade>
                {#if checkout.salesOrderNumber}
                    <div class="flex justify-between">
                        <span>Commande</span><strong>n°{checkout.salesOrderNumber}</strong>
                    </div>
                {/if}
                <div class="flex justify-between">
                    <span>Total de la commande</span><span>{checkout.total.toFixed(2)} $</span>
                </div>
                <div class="flex justify-between">
                    <span>Montant payable maintenant</span>
                    <strong>{checkout.amountBillable.toFixed(2)} $ CAD</strong>
                </div>
                <p class="text-sm mt-2">
                    Seuls les frais d’agence et leurs taxes sont payés ici. Le solde de la commande vous sera facturé
                    par la SAQ.
                </p>
            </div>
        {/if}

        {#if errorMessage}
            <div class="text-wred mb-4" role="alert" in:fade>{errorMessage}</div>
        {/if}

        <form on:submit|preventDefault={pay} class="flex flex-col gap-4">
            <div id="payment-element"></div>

            {#if ready}
                <button
                    type="submit"
                    disabled={submitting}
                    class="abutton bg-wred text-white text-base w-full md:max-w-[271px] rounded-3xl"
                >
                    {#if submitting}Traitement…{:else}Payer {checkout?.amountBillable.toFixed(2)} $ CAD{/if}
                </button>
            {:else if !errorMessage}
                <div class="text-base">Chargement du formulaire de paiement…</div>
            {/if}
        </form>

        <a href="/cart" class="underline text-wblue text-sm mt-6 inline-block">Retour au panier</a>
    </div>
</div>

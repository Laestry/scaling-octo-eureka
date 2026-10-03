<script lang="ts">
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';

    // The cart emails the order to the team (/api/send-order) and lands here with its reference.
    // Nothing is paid online, so there is nothing to check: just thank the customer.
    $: reference = $page.url.searchParams.get('request');
</script>

<div class="flex flex-col items-center h-[60vh] mt-3">
    <div class="lg:w-[800px] md:w-[680px] w-[358px]">
        <div class="h-[96px] mx-auto flex flex-wrap gap-4 justify-between items-end">
            <div>
                <h1 class="!capitalize text-5xl">Merci!</h1>
                <div>Votre commande a bien été envoyée.</div>
            </div>

            <div in:fade>
                {#if reference}
                    <div>Votre référence est <strong>n°[{reference}]</strong>.</div>
                {/if}
                <div>
                    Notre équipe vous contactera sous peu pour confirmer la commande et vous indiquer les prochaines
                    étapes. Aucun paiement n’a été prélevé.
                </div>
            </div>
        </div>
    </div>
</div>

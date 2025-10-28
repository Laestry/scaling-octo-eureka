<script lang="ts">
    import { onMount } from 'svelte';
    import { cart } from '$lib/cart';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import { fade } from 'svelte/transition';

    let orderId;
    onMount(() => {
        // cart.clear();

        orderId = get(page).url.searchParams.get('orderId');
        console.log('orderId:', orderId);
    });
</script>

<div class="flex flex-col items-center h-[60vh] mt-3">
    <div class="lg:w-[800px] md:w-[680px] w-[358px]">
        <div class="h-[96px] mx-auto flex flex-wrap gap-4 justify-between items-end">
            <div>
                <h1 class="!capitalize text-5xl">Merci!</h1>
                <div>Le paiement a bien été reçu.</div>
            </div>

            {#if orderId}
                <div in:fade>
                    <div>Votre commande <strong>n°[{orderId}]</strong> est en cours de traitement.</div>

                    <div>
                        Un courriel vous sera envoyé sous peu pour confirmer la commande et vous indiquer les prochaines
                        étapes.
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- src/routes/cart/+page.svelte-->
<script lang="ts">
    import { cart } from '$lib/cart';
    import { fade, fly } from 'svelte/transition';
    import Input from '$lib/components/Input.svelte';
    import Select from '$lib/components/Select.svelte';
    import { onMount } from 'svelte';
    import { parser } from '@exodus/schemasafe';
    import Toggle from '$lib/components/Toggle.svelte';
    import { goto } from '$app/navigation';
    import CartItem from './CartItem.svelte';
    import { pb } from '$lib/pocketbase';
    import { supabase } from '$lib/supabase/client';
    import { isPrixResto } from '$lib/store';
    import { totalsPerUnit } from '$lib/utils';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { stashCheckout } from '$lib/checkout';

    // Log the cart for debugging

    // Declare options; you may type these if needed.
    let options;
    let restoDeliveryOptions = [
        { label: "Livraison à l'établissement", value: 0 },
        { label: 'Livraison en succursale', value: 3 }
    ];

    onMount(async () => {
        const { data, error } = await supabase.schema('cms_saq').from('saq_branches').select('*');
        options = data.map((x) => ({ value: x.id, label: `${x.city}, ${x.address}` }));
        console.log('branches', options);
        // console.log('cart', $cart);
    });

    let cancelHandled = false;

    async function cancelOrder(orderIdParam: string | null) {
        try {
            const organizationId = 2; // same org as used when creating the order
            const body: Record<string, any> = { organizationId };
            if (orderIdParam) {
                const parsed = parseInt(orderIdParam, 10);
                if (!Number.isNaN(parsed)) body.orderId = parsed;
            }

            const res = await fetch('/api/cancel-external-sales-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                console.error('Failed to cancel external sales order', await res.text());
            } else {
                console.log('External sales order cancelled successfully');
            }
        } catch (e) {
            console.error('Error while cancelling external sales order', e);
        }
    }

    $: if (browser && !cancelHandled) {
        const url = $page.url;
        const cancelPayment = url.searchParams.get('cancelPayment');
        const orderIdParam = url.searchParams.get('orderId');

        if (cancelPayment === '1') {
            cancelHandled = true;
            cancelOrder(orderIdParam);
        }
    }

    const items = Array.from({ length: 500 }).map((_, i) => `item ${i}`);

    let firstNameInput: Input;
    let lastNameInput: Input;
    let addressInput: Input;
    let cityInput: Input;
    let postalCodeInput: Input;
    let phoneInput: Input;
    let emailInput: Input;
    let saqNumberInput: Input;
    let saqSelect: any;
    let saqSelectComponent: any;
    let deliverTypeSelect: any;
    let deliverTypeSelectComponent: any;
    $: formSchema = {
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        type: 'object',
        properties: {
            firstName: { type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' },
            lastName: { type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' },
            address: { type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' },
            city: { type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' },
            postalCode: { type: 'string', minLength: 5, pattern: '^[\\s\\S]*$' },
            phone: { type: 'string', minLength: 10, pattern: '^[\\s\\S]*$' },
            email: {
                type: 'string',
                pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                maxLength: 254
            },
            saqNumber: $isPrixResto ? SAQ_NUMBER_REQUIRED : SAQ_NUMBER_OPTIONAL
        },
        required: [
            'firstName',
            'lastName',
            'address',
            'city',
            'postalCode',
            'phone',
            'email',
            ...($isPrixResto ? ['saqNumber'] : [])
        ],
        additionalProperties: false
    };

    $: parse = parser(formSchema, { includeErrors: true, allErrors: true });

    // Mandatory for restaurants, optional for individuals. These must be *reactive*: Input
    // only clears a previous error when its validator starts passing, so switching to Prix
    // Perso has to loosen the schema — otherwise the red hint from a Prix Resto submit sticks
    // around and the field looks like it is still required.
    const SAQ_NUMBER_REQUIRED = { type: 'string', pattern: '^[0-9]{8}$', minLength: 8, maxLength: 8 };
    const SAQ_NUMBER_OPTIONAL = { type: 'string', pattern: '^([0-9]{8})?$' };
    $: saqNumberSchema = $isPrixResto ? SAQ_NUMBER_REQUIRED : SAQ_NUMBER_OPTIONAL;

    let formData = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        saqNumber: ''
    };
    let errorMessage = '';
    let notifyFr = '';
    let notifyEn = '';
    let toastTimer: ReturnType<typeof setTimeout> | undefined;

    $: if (notifyFr) {
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            notifyFr = '';
            notifyEn = '';
        }, 3000);
    }
    let formEl;

    let loadingHandleSubmit = false;
    async function handleSubmit() {
        notifyFr = '';
        notifyEn = '';

        let selectedBatches = $cart.map((i) => ({
            id: parseInt(i.selected_batch_id),
            caseQuantity: i.quantity
        }));
        console.log('cart items', $cart);
        console.log('saqSelect', saqSelect);
        console.log('selectedBatches', selectedBatches);

        // Trigger validation on each input.
        const errors = [];
        errors.push(firstNameInput.handleValidate());
        errors.push(lastNameInput.handleValidate());
        errors.push(addressInput.handleValidate());
        errors.push(cityInput.handleValidate());
        errors.push(postalCodeInput.handleValidate());
        errors.push(phoneInput.handleValidate());
        errors.push(emailInput.handleValidate());
        errors.push(saqNumberInput.handleValidate());
        if ($isPrixResto) errors.push(deliverTypeSelectComponent.handleValidate());
        if (!$isPrixResto) {
            errors.push(saqSelectComponent.handleValidate());
        }

        // If any input returns an error (non-empty string), don't submit.
        if (errors.some((valid) => valid === false)) {
            goto('#userdata');

            errorMessage = 'Veuillez corriger les champs invalides.';
            console.error('Validation errors:', errors);
            return;
        }

        // Alternatively, you can still run your parser on the overall formData if needed.
        const result = parse(JSON.stringify(formData));
        if (result.valid) {
            console.log('Form is valid:', formData);
            errorMessage = 'Formulaire valide!';
            // ... proceed with further actions
        } else {
            console.log('Validation errors:', result.errors);
            errorMessage = 'Le formulaire contient des erreurs.';
        }
        let res;
        loadingHandleSubmit = true;
        try {
            res = await fetch('/api/portaus/createPersoOrder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: selectedBatches,
                    customer: {
                        resto_delivery_type: $isPrixResto ? deliverTypeSelect : undefined,
                        saq_store_id: !$isPrixResto ? saqSelect : undefined,
                        saq_number: formData.saqNumber,
                        billing_address: {
                            street: formData.address,
                            city: formData.city,
                            postal_code: formData.postalCode
                        },
                        billing_contact: {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            email: formData.email,
                            phone: formData.phone
                        }
                    }
                })
            });

            if (!res.ok) {
                const text = await res.text();

                let payload: any;
                try {
                    payload = JSON.parse(text);
                } catch {
                    payload = null;
                }

                if (payload?.error === 'InsufficientQuantity') {
                    // Portaus answers per line, so name the wines rather than making the
                    // customer guess which row to fix.
                    const stale = (payload.lines ?? []).filter((l: any) => l.reason === 'UnknownProduct');
                    const short = (payload.lines ?? []).filter((l: any) => l.reason !== 'UnknownProduct');

                    if (short.length) {
                        const details = short
                            .map((l: any) => {
                                const item = $cart.find((c) => l.batchIds?.includes(Number(c.selected_batch_id)));
                                const uvc = Number(item?.uvc) > 0 ? Number(item.uvc) : 1;
                                const casesLeft = Math.floor(Number(l.quantityLeft ?? 0) / uvc);
                                return `${l.name} (${casesLeft} caisse${casesLeft === 1 ? '' : 's'} restante${casesLeft === 1 ? '' : 's'})`;
                            })
                            .join(', ');
                        notifyFr = `Stock insuffisant : ${details}. Veuillez ajuster votre panier.`;
                        notifyEn = `Not enough stock: ${details}. Please adjust your cart.`;
                    } else {
                        const names = stale
                            .map((l: any) => l.name)
                            .filter(Boolean)
                            .join(', ');
                        notifyFr = names
                            ? `Ces vins ne sont plus disponibles à la commande : ${names}.`
                            : 'Certains vins ne sont plus disponibles à la commande.';
                        notifyEn = names
                            ? `These wines are no longer available to order: ${names}.`
                            : 'Some wines are no longer available to order.';
                    }
                } else if (payload?.error === 'ProductNotSellable') {
                    const names = (payload.products ?? [])
                        .map((p: any) => p.name)
                        .filter(Boolean)
                        .join(', ');
                    notifyFr = names
                        ? `Ces vins ne peuvent pas être commandés en ligne : ${names}.`
                        : 'Certains vins ne peuvent pas être commandés en ligne.';
                    notifyEn = names
                        ? `These wines cannot be ordered online: ${names}.`
                        : 'Some wines cannot be ordered online.';
                } else if (payload?.error === 'InvalidBatches') {
                    notifyFr = 'Certains vins de votre panier n’existent plus. Veuillez les retirer et réessayer.';
                    notifyEn = 'Some wines in your cart no longer exist. Please remove them and try again.';
                } else if (payload?.error === 'InvalidBranch') {
                    notifyFr = 'La succursale choisie est introuvable. Veuillez en sélectionner une autre.';
                    notifyEn = 'The selected branch could not be found. Please choose another one.';
                } else if (payload?.error === 'EmptyCart') {
                    notifyFr = 'Votre panier est vide.';
                    notifyEn = 'Your cart is empty.';
                } else {
                    notifyFr =
                        'Une erreur s’est produite lors de la validation de votre commande. Veuillez réessayer ou modifier votre panier.';
                    notifyEn = 'An error occurred while validating your order. Please try again or adjust your cart.';
                }

                errorMessage = notifyFr;
                return;
            }

            const data = await res.json();

            // The order now exists in Portaus and Stripe is holding a PaymentIntent for the
            // agency fee. The cart is deliberately left intact — an abandoned payment should
            // still find its wines here. /success clears it once payment actually succeeds.
            stashCheckout({
                clientSecret: data.clientSecret,
                amountBillable: data.amountBillable,
                total: data.total,
                salesOrderNumber: data.salesOrderNumber,
                salesOrderId: data.salesOrderId
            });

            await goto('/pay');
        } catch (err) {
            console.error('Order submission failed:', err);
            notifyFr = 'Problème de réseau. Veuillez réessayer plus tard.';
            notifyEn = 'Network problem. Please try again later.';
            errorMessage = notifyFr;
            return;
        } finally {
            loadingHandleSubmit = false;
        }
    }

    let emailAccount: string;
    let emailAccountInput: Input;
    let existingAccount;
    let foundAccount = false;
    let existingContact;
    let foundContact: boolean = false;
    let checked: boolean = false;
    let checking: boolean = false;
    let isFinalize = true;
    async function handleCheckForAccount() {
        checking = true;
        register = false;
        foundAccount = false;
        foundContact = false;

        if (!emailAccountInput.handleValidate()) return;
        console.log('handleCheckForAccount start');
        try {
            existingAccount = await pb.collection('users').getFirstListItem(`email="${emailAccount}"`);
            console.log('existingAccount', existingAccount);
            foundAccount = true;
        } catch (e) {
            console.log(e, existingAccount);
        }

        if (!foundAccount) {
            try {
                existingContact = await pb.collection('customer_emails').getFirstListItem(`email~"${emailAccount}"`);
                console.log('existingContact', existingContact);
                foundContact = true;
            } catch (e) {
                console.log(e, existingContact);
            }
        }

        if (!foundAccount && !foundContact) {
            register = true;
        }
        checking = false;
    }

    let passwordAccountInput: Input;
    let passwordAccount: string;
    let register = false;

    // taxes 0.05 0.09975

    function round2(value) {
        return Math.round(value * 100) / 100;
    }

    $: total = $cart.reduce((acc, item) => {
        const basePrice = Number($isPrixResto ? item?.selected_price : (item?.selected_price_tax_in ?? 0));

        const agencyFee =
            (Number(item?.selected_price_tax_in ?? 0) * Number(item?.selected_agency_fee_percentage ?? 0)) / 100;

        const perBottle = round2(basePrice + agencyFee);

        return acc + perBottle * Number(item.quantity ?? 0) * Number(item.uvc ?? 0);
    }, 0);

    $: agencyAndTaxesTotal = $cart.reduce((acc, item) => {
        const { agencyWithTaxes } = totalsPerUnit(item, $isPrixResto);
        const perBottle = round2(agencyWithTaxes);
        return acc + perBottle * item.quantity * item.uvc;
    }, 0);
</script>

<!--Courriel-->
<!--Vérifier-->
<!--Si vous avez déjà commandé chez nous, utilisez l’adresse email associée à votre commande.-->
<!--Sinon, entrez votre email pour créer un nouveau compte. J’ai déjà un compte-->
{#if notifyFr}
    <div
        class="toast-global"
        role="button"
        tabindex="0"
        in:fly={{ x: 200, duration: 250 }}
        out:fly={{ x: 200, duration: 200 }}
        on:click={() => {
            notifyFr = '';
            notifyEn = '';
        }}
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                notifyFr = '';
                notifyEn = '';
            }
        }}
    >
        {notifyFr}
    </div>
{/if}

<div class="w-full flex justify-center mt-[53px]">
    <div class="lg:w-[1136px] md:w-[760px] w-[300px]">
        {#if isFinalize}
            <div transition:fly={{ y: -100, duration: 300 }}>
                <!--region login-->
                <!--                <div class="flex gap-4 w-full mb-4">-->
                <!--                    <div class="text-base text-nowrap w-[176px]">Votre Courriel</div>-->

                <!--                    <form class="flex flex-1 flex-wrap gap-y-2 gap-x-4">-->
                <!--                        <div>-->
                <!--                            <Input-->
                <!--                                bind:this={emailAccountInput}-->
                <!--                                bind:value={emailAccount}-->
                <!--                                type="email"-->
                <!--                                autocomplete="email"-->
                <!--                                class="lg:w-[268px] w-full"-->
                <!--                                placeholder="Courriel"-->
                <!--                                hint="Courriel valide requis"-->
                <!--                                validate={{-->
                <!--                                    type: 'string',-->
                <!--                                    pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',-->
                <!--                                    maxLength: 254-->
                <!--                                }}-->
                <!--                            />-->
                <!--                            {#if foundContact || register}-->
                <!--                                <button class="underline text-wblue text-xs" on:click={() => (register = !register)}>-->
                <!--                                    I want to check another email-->
                <!--                                </button>-->
                <!--                            {/if}-->
                <!--                        </div>-->
                <!--                        {#if foundAccount}-->
                <!--                            <Input-->
                <!--                                bind:this={passwordAccountInput}-->
                <!--                                bind:value={passwordAccount}-->
                <!--                                type="password"-->
                <!--                                autocomplete="password"-->
                <!--                                class="lg:max-w-[268px] w-full"-->
                <!--                                placeholder="Mot de passe"-->
                <!--                                hint="Mot de passe"-->
                <!--                                validate={{-->
                <!--                                    type: 'string',-->
                <!--                                    pattern: '',-->
                <!--                                    maxLength: 254-->
                <!--                                }}-->
                <!--                            />-->
                <!--                        {:else if foundContact || register}-->
                <!--                            <Input-->
                <!--                                bind:this={passwordAccountInput}-->
                <!--                                bind:value={passwordAccount}-->
                <!--                                type="password"-->
                <!--                                autocomplete="new-password"-->
                <!--                                class="lg:max-w-[268px] w-full"-->
                <!--                                placeholder="Nouveau mot de passe"-->
                <!--                                hint="Mot de passe"-->
                <!--                                validate={{-->
                <!--                                    type: 'string',-->
                <!--                                    pattern: '',-->
                <!--                                    maxLength: 254-->
                <!--                                }}-->
                <!--                            />-->
                <!--                        {/if}-->

                <!--                        <button-->
                <!--                            on:click={handleCheckForAccount}-->
                <!--                            class="abutton bg-wred text-white text-base w-fit rounded-3xl px-[6px] h-[32px]"-->
                <!--                        >-->
                <!--                            {#if foundContact || register}-->
                <!--                                Create a new account with us-->
                <!--                            {:else if foundAccount}-->
                <!--                                Login-->
                <!--                            {:else}-->
                <!--                                Vérifier-->
                <!--                            {/if}-->
                <!--                        </button>-->
                <!--                    </form>-->
                <!--                </div>-->
                <!--endregion -->

                <hr class=" mb-4 border-wpink" />

                <div id="userdata" class="flex lg:flex-row flex-col w-full md:gap-4 gap-0" bind:this={formEl}>
                    <div class="text-base text-nowrap w-[176px] md:mb-0 mb-2">Pour la commande</div>
                    <form class="flex flex-1 flex-wrap gap-y-2 gap-x-4">
                        <Input
                            placeholder="Prénom"
                            class="w-full"
                            bind:this={firstNameInput}
                            bind:value={formData.firstName}
                            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
                            hint="Prénom requis."
                        />
                        <Input
                            placeholder="Nom"
                            class="w-full"
                            bind:this={lastNameInput}
                            bind:value={formData.lastName}
                            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
                            hint="Nom requis"
                        />
                        <Input
                            placeholder="Adresse"
                            class="lg:max-w-[464px] w-full"
                            bind:this={addressInput}
                            bind:value={formData.address}
                            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
                            hint="Adresse requise"
                        />
                        <Input
                            placeholder="Ville"
                            class="lg:max-w-[272px] w-full md:min-w-0 min-w-[300px] flex-1 "
                            bind:this={cityInput}
                            bind:value={formData.city}
                            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
                            hint="Ville requise"
                        />
                        <Input
                            placeholder="Code postal"
                            class="lg:max-w-[176px] lg:w-full md:w-fit w-full md:flex-none flex-1 "
                            bind:this={postalCodeInput}
                            bind:value={formData.postalCode}
                            validate={{ type: 'string', minLength: 5, pattern: '^[\\s\\S]*$' }}
                            hint="Code postal min. 5 caractères"
                        />
                        <Input
                            placeholder="Téléphone"
                            class="lg:max-w-[272px] w-full "
                            bind:this={phoneInput}
                            bind:value={formData.phone}
                            validate={{ type: 'string', minLength: 11, pattern: '^[\\s\\S]*$' }}
                            hint="Téléphone (min. 10 chiffres avec +)"
                        />
                        <Input
                            placeholder="Courriel"
                            class="lg:max-w-[272px] w-full flex-1 "
                            bind:this={emailInput}
                            bind:value={formData.email}
                            validate={{
                                type: 'string',
                                pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                                maxLength: 254
                            }}
                            hint="Courriel valide requis"
                        />
                        <div class="flex gap-1.5 items-center lg:flex-1 flex-none lg:w-auto w-fit justify-end">
                            <span class="text-xs">Inscrivez-moi à l’infolettre.</span>
                            <Toggle onText="Oui!" offText="Non" />
                        </div>
                    </form>
                </div>

                <div class="flex md:flex-row flex-col w-full md:gap-4 gap-0 md:mt-[40px] mt-[20px]">
                    <div class="text-base text-nowrap w-[176px]">No de SAQ</div>
                    <Input
                        placeholder={$isPrixResto ? 'No de SAQ (obligatoire)' : 'No de SAQ (optionnel)'}
                        class="lg:max-w-[272px] w-full flex-1 "
                        bind:this={saqNumberInput}
                        bind:value={formData.saqNumber}
                        validate={saqNumberSchema}
                        hint="Le numéro de SAQ doit contenir 8 chiffres."
                    />
                </div>

                <div class="flex md:flex-row flex-col w-full md:gap-4 gap-0 md:mt-[40px] mt-[20px]">
                    <div class="text-base text-nowrap w-[176px]">Pour la cueillette</div>

                    {#if !$isPrixResto && options}
                        <Select
                            fontSize="16px"
                            bind:value={saqSelect}
                            class="w-full lg:max-w-[464px] !border-wblue "
                            inputClass="!text-wblack !placeholder-wblue"
                            {options}
                            placeholder="Choisir votre SAQ"
                            hint="Veuillez sélectionner une succursale SAQ"
                            validate={{ type: ['string', 'number'], minLength: 1 }}
                            bind:this={saqSelectComponent}
                        />
                    {:else if $isPrixResto}
                        <Select
                            fontSize="16px"
                            bind:value={deliverTypeSelect}
                            class="w-full lg:max-w-[464px] !border-wblue "
                            inputClass="!text-wblack !placeholder-wblue"
                            options={restoDeliveryOptions}
                            placeholder="Type de livraison"
                            hint="Veuillez sélectionner une type de livraison"
                            validate={{ type: ['string', 'number'], minLength: 1 }}
                            bind:this={deliverTypeSelectComponent}
                        />
                    {/if}
                </div>

                <div class="text-base text-nowrap w-[176px] md:mt-[40px] mt-[20px]">La commande</div>
            </div>
        {/if}

        <hr class="md:block hidden {isFinalize ? 'md:mt-[18px] mt-[0px] ' : ''}" />
        <div class="">
            <div class="  flex lg:flex-col lg:gap-0 flex-wrap md:gap-2 gap-5 justify-between">
                {#each $cart as item}
                    {#key item.id}
                        <div transition:fade>
                            <CartItem selectedBatch={item} />
                        </div>
                    {/key}
                {/each}
            </div>

            <div class="max-w-[464px] w-full ml-auto md:mt-[9px] mt-4">
                <hr class="border-wred mb-[7px]" />
                <div class="flex justify-between">
                    <div class="text-xs">Total</div>
                    <b>
                        <b>${total.toFixed(2)}</b>
                    </b>
                </div>
                <div class="text-xs">Frais d’agence et taxes incluses</div>
                {#if isFinalize}
                    <div transition:fly={{ y: 100 }}>
                        <hr class="border-wred mt-[10px] mb-[7px]" />
                        <div class="flex justify-between">
                            <div class="text-xs">Montant chargé maintenant</div>
                            <b>
                                <b>${agencyAndTaxesTotal.toFixed(2)}</b>
                            </b>
                        </div>
                        <div class="text-xs">*La différence sera chargée au moment de la cueillette</div>
                    </div>
                {/if}
            </div>

            <div class="flex flex-wrap gap-2.5 justify-between md:mt-[58px] mt-6">
                <button
                    on:click={() => goto('/vins')}
                    class="abutton bg-wblue text-white text-base w-full md:max-w-[271px] rounded-3xl"
                >
                    Continuer mes achats
                </button>
                <button
                    class="abutton bg-wred text-white w-full md:max-w-[271px] rounded-3xl"
                    disabled={loadingHandleSubmit}
                    on:click={() => {
                        if (isFinalize) handleSubmit();
                        else {
                            isFinalize = true;
                            goto('#userdata');
                        }
                    }}
                >
                    {#if loadingHandleSubmit}
                        <div class="absolute w-0 h-0 mt-[3px] ml-[7px]">
                            <div class="circle" />
                        </div>
                    {/if}
                    {#if isFinalize}Confirmer la commande{:else}Finaliser ma commande{/if}
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .circle {
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: var(--WARD-BLUE);
        animation: fade 2s infinite ease-in-out;
    }

    @keyframes fade {
        0%,
        100% {
            opacity: 0.2;
        }
        50% {
            opacity: 1;
        }
    }

    .toast-global {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 10000;
        max-width: 260px;
        padding: 8px 12px;
        border-radius: 6px;
        background: rgba(222, 53, 11, 0.98);
        color: #fff;
        font-size: 13px;
        line-height: 1.4;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        cursor: pointer;
    }
</style>

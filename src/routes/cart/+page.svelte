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

    // Log the cart for debugging

    // Declare options; you may type these if needed.
    let options;

    onMount(async () => {
        const { data, error } = await supabase.schema('cms_saq').from('saq_branches').select('*');
        options = data.map((x) => ({ value: x.id, label: `${x.city}, ${x.address}` }));
        // console.log('branches', options);
        console.log('cart', $cart);
    });

    const items = Array.from({ length: 500 }).map((_, i) => `item ${i}`);

    let firstNameInput: Input;
    let lastNameInput: Input;
    let addressInput: Input;
    let cityInput: Input;
    let postalCodeInput: Input;
    let phoneInput: Input;
    let emailInput: Input;
    let saqSelect: Select;

    const formSchema = {
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
            }
        },
        required: ['firstName', 'lastName', 'address', 'city', 'postalCode', 'phone', 'email'],
        additionalProperties: false
    };

    const parse = parser(formSchema, { includeErrors: true, allErrors: true });

    let formData = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: ''
    };
    let errorMessage = '';
    let formEl;

    async function handleSubmit() {
        let selectedBatches = $cart.map((i) => ({
            id: i.selectedBatchId,
            caseQuantity: i.quantity * i.uvc
        }));
        console.log('cart items', $cart);
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
        // errors.push(saqSelect.handleValidate());

        // If any input returns an error (non-empty string), don't submit.
        if (errors.some((valid) => valid === false)) {
            goto('#logo');

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
        try {
            res = await fetch('api/submit-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: 2,
                    items: selectedBatches,
                    customer: {
                        saq_store_id: saqSelect.value,
                        // saq_number: '', // add if needed
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
                // non-2xx status
                throw new Error(`Server returned ${res.status}`);
            }

            const data = await res.json();

            const { url } = JSON.parse(data.body);

            window.location.href = url;
        } catch (err) {
            console.error('Order submission failed:', err);
            errorMessage = 'Une erreur réseau est survenue. Veuillez réessayer plus tard.';
            // optionally bail out or re-throw
            return;
        }
    }

    let isFinalize = true;
    let emailAccount: string;
    let emailAccountInput: Input;
    let existingAccount;
    let foundAccount = false;
    let existingContact;
    let foundContact: boolean = false;
    let checked: boolean = false;
    let checking: boolean = false;

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

    $: total = $cart.reduce((acc, item) => {
        const { lineTotal } = totalsPerUnit(item, $isPrixResto);
        return acc + lineTotal * item.quantity;
    }, 0);

    $: agencyAndTaxesTotal = $cart.reduce((acc, item) => {
        const { agencyWithTaxes } = totalsPerUnit(item, $isPrixResto);
        return acc + agencyWithTaxes * item.quantity;
    }, 0);
</script>

<!--Courriel-->
<!--Vérifier-->
<!--Si vous avez déjà commandé chez nous, utilisez l’adresse email associée à votre commande.-->
<!--Sinon, entrez votre email pour créer un nouveau compte. J’ai déjà un compte-->
<div class="w-full flex justify-center mt-[53px]">
    <div class="lg:w-[1136px] md:w-[760px] w-[300px]">
        {#if isFinalize}
            <div transition:fly={{ y: -100, duration: 300 }}>
                <div class="flex gap-4 w-full mb-4">
                    <div class="text-base text-nowrap w-[176px]">Votre Courriel</div>

                    <form class="flex flex-1 flex-wrap gap-y-2 gap-x-4">
                        <div>
                            <Input
                                bind:this={emailAccountInput}
                                bind:value={emailAccount}
                                type="email"
                                autocomplete="email"
                                class="lg:w-[268px] w-full"
                                placeholder="Courriel"
                                hint="Courriel valide requis"
                                validate={{
                                    type: 'string',
                                    pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                                    maxLength: 254
                                }}
                            />
                            {#if foundContact || register}
                                <button class="underline text-wblue text-xs" on:click={() => (register = !register)}>
                                    I want to check another email
                                </button>
                            {/if}
                        </div>
                        {#if foundAccount}
                            <Input
                                bind:this={passwordAccountInput}
                                bind:value={passwordAccount}
                                type="password"
                                autocomplete="password"
                                class="lg:max-w-[268px] w-full"
                                placeholder="Mot de passe"
                                hint="Mot de passe"
                                validate={{
                                    type: 'string',
                                    pattern: '',
                                    maxLength: 254
                                }}
                            />
                        {:else if foundContact || register}
                            <Input
                                bind:this={passwordAccountInput}
                                bind:value={passwordAccount}
                                type="password"
                                autocomplete="new-password"
                                class="lg:max-w-[268px] w-full"
                                placeholder="Nouveau mot de passe"
                                hint="Mot de passe"
                                validate={{
                                    type: 'string',
                                    pattern: '',
                                    maxLength: 254
                                }}
                            />
                        {/if}

                        <button
                            on:click={handleCheckForAccount}
                            class="abutton bg-wred text-white text-base w-fit rounded-3xl px-[6px] h-[32px]"
                        >
                            {#if foundContact || register}
                                Create a new account with us
                            {:else if foundAccount}
                                Login
                            {:else}
                                Vérifier
                            {/if}
                        </button>
                    </form>
                </div>

                <hr class=" mb-4 border-wpink" />

                <div class="flex lg:flex-row flex-col w-full md:gap-4 gap-0" bind:this={formEl}>
                    <div class="text-base text-nowrap w-[176px]">Pour la commande</div>
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
                            class="lg:max-w-[272px] lg:w-full md:min-w-0 min-w-[300px] flex-1 "
                            bind:this={cityInput}
                            bind:value={formData.city}
                            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
                            hint="Ville requise"
                        />
                        <Input
                            placeholder="Code postal"
                            class="lg:max-w-[176px] lg:w-full w-fit md:flex-none flex-1 "
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
                            class="lg:max-w-[268px] lg:w-full flex-1 "
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
                    <div class="text-base text-nowrap w-[176px]">Pour la cueillette</div>

                    {#if options}
                        <Select
                            fontSize="16px"
                            bind:this={saqSelect}
                            class="w-full lg:max-w-[464px] !border-wblue "
                            inputClass="!text-wblack !placeholder-wblue"
                            {options}
                            placeholder="Choisir votre SAQ"
                            hint="Veuillez sélectionner une succursale SAQ"
                        />
                    {/if}
                </div>

                <div class="text-base text-nowrap w-[176px] md:mt-[40px] mt-[20px]">La commande</div>
            </div>
        {/if}

        <hr class={isFinalize ? 'md:mt-[18px] mt-[0px]' : ''} />
        <div class="">
            <div class="  flex lg:flex-col lg:gap-0 flex-wrap gap-2 justify-between">
                {#each $cart as item}
                    {#key item.id}
                        <div transition:fade>
                            <CartItem product={item} />
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
                    on:click={() => goto('/products')}
                    class="abutton bg-wblue text-white text-base w-full md:max-w-[271px] rounded-3xl"
                >
                    Continuer mes achats
                </button>
                <button
                    class="abutton bg-wred text-white text-base w-full md:max-w-[271px] rounded-3xl"
                    on:click={() => {
                        if (isFinalize) handleSubmit();
                        else {
                            isFinalize = true;
                            goto('#logo');
                        }
                    }}
                >
                    {#if isFinalize}Confirmer la commande{:else}Finaliser ma commande{/if}
                </button>
            </div>
        </div>
    </div>
</div>

<style>
</style>

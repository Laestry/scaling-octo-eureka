<script lang="ts">
    import { cart } from '$lib/cart';
    import ProductCard from '../products/ProductCard.svelte';
    import { fade } from 'svelte/transition';
    import Input from '$lib/components/Input.svelte';
    import Select from '$lib/components/Select.svelte';
    import { onMount } from 'svelte';
    import { parser } from '@exodus/schemasafe';
    import Toggle from '$lib/components/Toggle.svelte';
    import { goto } from '$app/navigation';

    async function createCheckout() {
        // Build checkout items from the cart store
        const items = $cart.map((item) => ({
            quantity: item.quantity
        }));

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

    // Declare options; you may type these if needed.
    let options;

    onMount(async () => {
        const res = await fetch('/saqBranches.json');
        options = await res.json();
        options = options.map((x) => ({ value: x.id, label: x.text }));
        console.log(options);
    });

    const items = Array.from({ length: 500 }).map((_, i) => `item ${i}`);

    let firstNameInput: Input;
    let lastNameInput: Input;
    let addressInput: Input;
    let cityInput: Input;
    let postalCodeInput: Input;
    let phoneInput: Input;
    let emailInput: Input;

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

    function handleSubmit() {
        // Trigger validation on each input.
        const errors = [];
        errors.push(firstNameInput.handleValidate());
        errors.push(lastNameInput.handleValidate());
        errors.push(addressInput.handleValidate());
        errors.push(cityInput.handleValidate());
        errors.push(postalCodeInput.handleValidate());
        errors.push(phoneInput.handleValidate());
        errors.push(emailInput.handleValidate());

        // If any input returns an error (non-empty string), don't submit.
        if (errors.some((e) => e !== '')) {
            formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });

            errorMessage = 'Veuillez corriger les champs invalides.';
            console.log('Validation errors:', errors);
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
    }

    let formEl;
</script>

<div class="flex w-full gap-4" bind:this={formEl}>
    <div class="text-base text-nowrap w-[176px]">Pour la commande</div>
    <div class="flex flex-1 flex-wrap gap-y-2 gap-x-4">
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
            class="max-w-[464px] w-full"
            bind:this={addressInput}
            bind:value={formData.address}
            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
            hint="Adresse requise"
        />
        <Input
            placeholder="Ville"
            class="max-w-[272px] w-full"
            bind:this={cityInput}
            bind:value={formData.city}
            validate={{ type: 'string', minLength: 1, pattern: '^[\\s\\S]*$' }}
            hint="Ville requise"
        />
        <Input
            placeholder="Code postal"
            class="max-w-[176px] w-full"
            bind:this={postalCodeInput}
            bind:value={formData.postalCode}
            validate={{ type: 'string', minLength: 5, pattern: '^[\\s\\S]*$' }}
            hint="Code postal min. 5 caractères"
        />
        <Input
            placeholder="Téléphone"
            class="max-w-[272px] w-full"
            bind:this={phoneInput}
            bind:value={formData.phone}
            validate={{ type: 'string', minLength: 11, pattern: '^[\\s\\S]*$' }}
            hint="Téléphone (min. 10 chiffres avec +)"
        />
        <Input
            placeholder="Courriel"
            class="max-w-[268px] w-full"
            bind:this={emailInput}
            bind:value={formData.email}
            validate={{
                type: 'string',
                pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
                maxLength: 254
            }}
            hint="Courriel valide requis"
        />
        <div class="flex gap-1.5 items-center flex-1 justify-end">
            <span class="text-xs">Inscrivez-moi à l’infolettre.</span>
            <Toggle onText="Oui!" offText="Non" />
        </div>
    </div>
</div>

<div class="flex w-full gap-4 mt-[40px]">
    <div class="text-base text-nowrap w-[176px]">Pour la cueillette</div>

    <Select class="w-full max-w-[464px]" {options} placeholder="Choisir votre SAQ" />
</div>

<div class="mt-[40px]">
    <div class="text-base text-nowrap w-[176px]">La commande</div>

    <div class="px-[98px] pt-[48px] flex flex-wrap gap-3">
        {#each $cart as item (item.id)}
            <div transition:fade>
                <ProductCard product={item} isCart size="m" />
            </div>
        {/each}
    </div>

    <div class="flex justify-between">
        <button
            on:click={() => goto('/products')}
            class="bg-wblue text-white text-base w-full max-w-[271px] rounded-3xl"
            on:click={handleSubmit}
        >
            Continuer mes achats
        </button>
        <button class="bg-wred text-white text-base w-full max-w-[271px] rounded-3xl" on:click={handleSubmit}>
            Confirmer la commande
        </button>
    </div>
</div>

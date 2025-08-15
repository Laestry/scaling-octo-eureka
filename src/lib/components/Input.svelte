<script lang="ts">
    import { validator } from '@exodus/schemasafe';
    export let value: string;
    export let validate: object | undefined;
    export let hint;
    export let placeholder: string;
    export let autocomplete: string = '';
    // export let type: string = 'text';

    let error = false;
    let validateFn;

    // Create the validator function when the schema changes.
    $: if (validate) {
        validateFn = validator(validate);
    }

    $: if (error && validateFn && validateFn(value)) {
        error = false;
    }

    export function handleValidate() {
        console.log('validate', hint);
        // Run validation on blur.
        console.log(value, validateFn(value));
        error = !validateFn(value);
        return !error; // Returns true if validation passes, false otherwise
    }
</script>

<div class={$$props['class'] ?? ''}>
    <input bind:value on:blur={handleValidate} class="w-full" {placeholder} {autocomplete} {...$$restProps} />
    {#if error}
        <div class="error">{hint}</div>
    {/if}
</div>

<style>
    input {
        border-radius: 100px;
        height: 32px;
        padding: 7px 20px;
        font-size: 12px;
        line-height: 150%;
    }
    input::placeholder {
        color: var(--black);
    }
    .error {
        color: red;
        font-size: 12px;
    }
</style>

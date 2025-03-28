<script lang="ts">
    import { teleport, clickOutside } from '$lib/utils';
    import SimpleBar from '@woden/svelte-simplebar';
    import { createEventDispatcher } from 'svelte';

    // Option type for object options
    type Option = { value: number | string; label: number | string };

    export let defaultOption = 'All';
    // Accept either an array of Option objects or an array of strings or numbers.
    export let options: Option[] | (string | number)[] = [];
    export let placeholder: string = '';
    export let inputValue: any = '';
    export let disabled = false;
    // When options are objects, selected will be an Option.
    // When options are simple (string or number), selected will be that type.
    export let selected: Option | string | number | undefined = undefined;
    export let status:
        | 'enabled'
        | 'invalid'
        | 'success'
        | 'loading'
        | 'complete'
        | 'incomplete'
        | 'warning'
        | 'disabled' = 'enabled';
    export let hint: string = '';
    export let validate = false;
    export let fontSize: string = '12px';

    let isOpen = false;
    let userInput = '';
    let wrapperElement: HTMLElement;

    // Convert passed options to a unified Option[] array.
    // If the options are strings or numbers, map them to Option objects.
    const parsedOptions: Option[] =
        Array.isArray(options) &&
        options.length > 0 &&
        (typeof options[0] === 'string' || typeof options[0] === 'number')
            ? (options as (string | number)[]).map((opt) => ({ value: opt, label: opt }))
            : (options as Option[]);

    // Flag to indicate if the passed options were simple (string or number).
    const isSimpleOptions =
        parsedOptions.length > 0 &&
        (typeof parsedOptions[0].label === 'string' || typeof parsedOptions[0].label === 'number') &&
        parsedOptions.every((opt) => typeof opt.label === 'string' || typeof opt.label === 'number');

    // Start with all options visible.
    let optionsFiltered: Option[] = [...parsedOptions];

    function handleOpen() {
        isOpen = true;
        optionsFiltered = [...parsedOptions];
    }

    function handleInput(e: Event) {
        const target = e.target as HTMLInputElement;
        userInput = target.value;
        inputValue = userInput;
        if (!userInput) {
            optionsFiltered = [...parsedOptions];
        } else {
            optionsFiltered = parsedOptions.filter((opt) =>
                String(opt.label).toLowerCase().includes(userInput.toLowerCase())
            );
        }
    }

    $: if (selected !== undefined && !userInput) {
        inputValue = typeof selected === 'object' ? String(selected.label) : String(selected);
    }

    function selectOption(opt: Option) {
        // Display the label as a string in the input field.
        inputValue = String(opt.label);
        // Return the original type for simple options.
        selected = isSimpleOptions ? opt.label : opt;
        handleValidate();
        isOpen = false;
        userInput = '';
    }

    function getStyle() {
        if (!wrapperElement) return '';
        const rect = wrapperElement.getBoundingClientRect();
        const MAX_HEIGHT_OPTIONS = 210;
        const GAP = 5;
        return `
      position: fixed;
      top: ${rect.bottom + GAP}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      max-height: ${MAX_HEIGHT_OPTIONS}px;
    `;
    }

    let error = false;
    export function handleValidate() {
        if (!validate) return;
        error = selected === null || selected === undefined;
        console.log('handleValidate', error, selected);
    }
    export let inputClass = '';
    const dispatch = createEventDispatcher();
    function selectDefault() {
        inputValue = '';
        selected = undefined;
        isOpen = false;
        userInput = '';
        dispatch('defaultSelected');
    }
</script>

<div
    bind:this={wrapperElement}
    class="flex bg-white border-t {$$props.class}"
    style="--font-size: {fontSize}; font-size: var(--font-size);"
>
    <input
        autocomplete="none"
        class="text {selected ? 'text-wblue' : 'text-wblack'} {inputClass}"
        style="width: calc(100% - 21px);"
        bind:value={inputValue}
        {placeholder}
        {disabled}
        on:input={handleInput}
        on:focus={handleOpen}
        on:click={handleOpen}
        on:blur={handleValidate}
    />
    <div class="m-[6px] w-[9px] h-[9px]">
        <svg width="9" height="9" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <line class:rotate={isOpen} class="line" x1="50" y1="10" x2="50" y2="90" stroke-width="10" />
            <line class="line" x1="90" y1="50" x2="10" y2="50" stroke-width="10" />
        </svg>
    </div>
</div>
{#if error}
    <div class="error">
        {hint}
    </div>
{/if}

{#if isOpen && optionsFiltered.length > 0}
    <div
        use:teleport={'body'}
        use:clickOutside
        on:click_outside={() => (isOpen = false)}
        class="select-options"
        style="--font-size: {fontSize}; font-size: var(--font-size); {getStyle()}"
    >
        <div class="select-options__wrapper svrollbar">
            <SimpleBar style="width:100%; height: fit-content; max-height: 210px" forceVisible={true} autoHide={false}>
                <button class="select-options__item text" type="button" on:click={selectDefault}>
                    {defaultOption}
                </button>
                {#each optionsFiltered as opt}
                    <button class="select-options__item text" type="button" on:click={() => selectOption(opt)}>
                        {opt.label}
                        <span> C </span>
                    </button>
                {/each}
            </SimpleBar>
        </div>
    </div>
{/if}

<style lang="scss">
    :global(.simplebar-scrollbar::before) {
        min-height: 50px !important;
        background-color: var(--blue); /* Change to your desired color */
    }

    .error {
        color: red;
        font-size: 12px;
    }
    .line {
        transform: rotate(0deg);
        transform-origin: center;
        transition: transform 0.2s ease-in-out;
        stroke: var(--black);
    }
    .line.rotate {
        transform: rotate(90deg);
    }
    input {
        padding: 3px 8px 9px 8px;
    }
    input::placeholder {
        color: var(--black);
    }

    .select-options {
        width: 100%;
        background: var(--Layer-01, #fff);
        box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        margin: 5px 0;
        transition: var(--transition-duration) var(--transition-timing-function);
        &__wrapper {
            height: fit-content;
            max-height: 210px;
            overflow: auto;
        }
        &__item {
            width: 100%;
            padding: 10px 16px;
            background: var(--Layer-01);
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
            &:hover {
                background: var(--layer-01-hover);
            }
            span {
                display: none;
            }
            &.active {
                span {
                    display: block;
                }
            }
        }
    }
    .input__chevron {
        transition: transform 0.2s;
    }
    .open .input__chevron {
        transform: rotate(-180deg);
    }

    input,
    .select-options,
    .error,
    .line,
    .text {
        font-size: inherit;
    }
    .text {
        text-align: left;
    }
</style>

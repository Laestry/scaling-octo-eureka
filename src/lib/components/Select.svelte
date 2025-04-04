<script lang="ts">
    import { teleport, clickOutside } from '$lib/utils';
    import SimpleBar from '@woden/svelte-simplebar';
    import { createEventDispatcher } from 'svelte';

    // Option type for object options. We add an optional originalIndex.
    type Option = { value: number | string; label: number | string; originalIndex?: number };

    export let defaultOption = 'All';
    // Accept either an array of Option objects or an array of strings or numbers.
    export let options: Option[] | (string | number)[] = [];
    export let placeholder: string = '';
    export let inputValue: any = '';
    export let disabled = false;
    // For multiple selection, selected will be an array or undefined.
    export let selected: Option | string | number | (Option | string | number)[] | undefined = undefined;
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
    export let multiple = false;

    let isOpen = false;
    let userInput = '';
    let wrapperElement: HTMLElement;

    // Convert passed options to a unified Option[] array.
    // Add an originalIndex property so we can restore order.
    const parsedOptions: Option[] =
        Array.isArray(options) &&
        options.length > 0 &&
        (typeof options[0] === 'string' || typeof options[0] === 'number')
            ? (options as (string | number)[]).map((opt, i) => ({ value: opt, label: opt, originalIndex: i }))
            : (options as Option[]).map((opt, i) => ({ ...opt, originalIndex: i }));

    // Flag to indicate if the passed options were simple (string or number).
    const isSimpleOptions =
        parsedOptions.length > 0 &&
        (typeof parsedOptions[0].label === 'string' || typeof parsedOptions[0].label === 'number') &&
        parsedOptions.every((opt) => typeof opt.label === 'string' || typeof opt.label === 'number');

    // Start with all options visible.
    let optionsFiltered: Option[] = [...parsedOptions];

    // Create a reactive sorted list that puts selected options at the top.
    $: sortedOptions = optionsFiltered.slice().sort((a, b) => {
        const aSelected =
            multiple && Array.isArray(selected)
                ? (selected as (Option | string | number)[]).some((item) =>
                      typeof item === 'object' ? item.value === a.value : item === a.label
                  )
                : false;
        const bSelected =
            multiple && Array.isArray(selected)
                ? (selected as (Option | string | number)[]).some((item) =>
                      typeof item === 'object' ? item.value === b.value : item === b.label
                  )
                : false;
        if (aSelected === bSelected) {
            // Preserve original order using originalIndex.
            return (a.originalIndex ?? 0) - (b.originalIndex ?? 0);
        }
        return aSelected ? -1 : 1;
    });

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

    // Reactive statement to update inputValue when not typing.
    $: if (!userInput) {
        if (multiple) {
            const count = Array.isArray(selected) ? selected.length : 0;
            inputValue = count > 0 ? `${placeholder} (${count})` : '';
        } else {
            if (selected !== undefined && selected !== null) {
                inputValue = typeof selected === 'object' ? String(selected.label) : String(selected);
            }
        }
    }

    // Reactive array mapping each option in sortedOptions to whether it's selected.
    $: selectedStates = sortedOptions.map((opt) => {
        if (multiple) {
            return (
                Array.isArray(selected) &&
                (selected as (Option | string | number)[]).some((item) =>
                    typeof item === 'object' ? item.value === opt.value : item === opt.label
                )
            );
        } else {
            return (
                selected !== undefined &&
                selected !== null &&
                (typeof selected === 'object' ? selected.value === opt.value : selected === opt.label)
            );
        }
    });

    function selectOption(opt: Option) {
        if (multiple) {
            // Ensure selected is an array.
            if (!Array.isArray(selected)) {
                selected = [];
            }
            // Check if the option is already selected.
            const index = (selected as (Option | string | number)[]).findIndex((item) =>
                typeof item === 'object' ? item.value === opt.value : item === opt.label
            );
            if (index > -1) {
                // Remove the option.
                (selected as (Option | string | number)[]).splice(index, 1);
            } else {
                // Add the option.
                (selected as (Option | string | number)[]).push(isSimpleOptions ? opt.label : opt);
            }
            // Update count and assign selected accordingly.
            const count = (selected as (Option | string | number)[]).length;
            if (count === 0) {
                selected = undefined;
                inputValue = '';
            } else {
                // Trigger reactivity.
                selected = [...(selected as (Option | string | number)[])];
                inputValue = `${placeholder} (${count})`;
            }
            handleValidate();
            // Keep the dropdown open for multiple selection.
        } else {
            // Single selection behavior.
            inputValue = String(opt.label);
            selected = isSimpleOptions ? opt.label : opt;
            handleValidate();
            isOpen = false;
            userInput = '';
        }
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
        if (multiple) {
            error = !selected;
        } else {
            error = selected === null || selected === undefined;
        }
        console.log('handleValidate', error, selected);
    }

    export let inputClass = '';
    const dispatch = createEventDispatcher();

    function selectDefault() {
        inputValue = '';
        // For multiple selection, reset selected to undefined.
        selected = multiple ? undefined : undefined;
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
        class="text {multiple
            ? Array.isArray(selected) && selected.length > 0
                ? 'text-wblue'
                : 'text-wblack'
            : selected
              ? 'text-wblue'
              : 'text-wblack'} {inputClass}"
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

{#if isOpen && sortedOptions.length > 0}
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
                {#each sortedOptions as opt, index}
                    <button
                        class="select-options__item text {selectedStates[index] ? 'text-wblue' : ''}"
                        type="button"
                        on:click={() => selectOption(opt)}
                    >
                        <span>{opt.label}</span>
                        {#if multiple && selectedStates[index]}
                            <svg width="9" height="9" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <line class="line" x1="90" y1="50" x2="10" y2="50" stroke-width="10" />
                            </svg>
                        {/if}
                    </button>
                {/each}
            </SimpleBar>
        </div>
    </div>
{/if}

<style lang="scss">
    :global(.simplebar-scrollbar::before) {
        min-height: 50px !important;
        background-color: var(--blue);
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
                background: var(--red);
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

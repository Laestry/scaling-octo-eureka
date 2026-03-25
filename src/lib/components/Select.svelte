<script lang="ts">
    import { teleport, clickOutside } from '$lib/utils';
    import SimpleBar from '@woden/svelte-simplebar';
    import { createEventDispatcher } from 'svelte';
    import { validator } from '@exodus/schemasafe';

    // Option type for object options. We add an optional originalIndex.
    type Option = {
        value: number | string;
        label: number | string;
        originalIndex?: number;
        disabled?: boolean; // <—
    };

    export let defaultOption = 'All';
    // Accept either an array of Option objects or an array of strings or numbers.
    export let options: Option[] | (string | number)[] = [];
    export let placeholder: string = '';
    export let inputValue: any = '';
    export let disabled = false;
    // For multiple selection, selected will be an array or undefined.
    export let selected: Option | string | number | (Option | string | number)[] | undefined = undefined;
    export const status:
        | 'enabled'
        | 'invalid'
        | 'success'
        | 'loading'
        | 'complete'
        | 'incomplete'
        | 'warning'
        | 'disabled' = 'enabled';
    export let hint: string = '';
    export let validate: object | undefined;
    export let fontSize: string = '12px';
    export let multiple = false;
    export let value: string | number | undefined = undefined;
    export let hideDefault = false;

    let isOpen = false;
    let userInput = '';
    let wrapperElement: HTMLElement;

    // Convert passed options to a unified Option[] array.
    // Add an originalIndex property so we can restore order.
    let parsedOptions: Option[] = [];
    $: parsedOptions =
        Array.isArray(options) && options.length > 0
            ? typeof (options as any)[0] === 'string' || typeof (options as any)[0] === 'number'
                ? (options as (string | number)[]).map((opt, i) => ({ value: opt, label: opt, originalIndex: i }))
                : (options as Option[]).map((opt, i) => ({ ...opt, originalIndex: i, disabled: !!opt.disabled })) // <—
            : [];

    let isSimpleOptions = false;
    $: isSimpleOptions =
        Array.isArray(options) &&
        options.length > 0 &&
        (typeof (options as any)[0] === 'string' || typeof (options as any)[0] === 'number');

    $: optionsFiltered = [...parsedOptions]; // (optional) refresh when options change

    // Create a reactive sorted list that puts selected options at the top.
    $: sortedOptions = optionsFiltered.slice().sort((a, b) => {
        // volume-aware ordering you already had
        const extractVolume = (label: string | number) => {
            const m = String(label).match(/([\d.,]+)\s*(ml|l)/i);
            if (!m) return null;
            const val = parseFloat(m[1].replace(',', '.'));
            const unit = m[2].toLowerCase();
            return unit === 'l' ? val * 1000 : val;
        };
        const aVol = extractVolume(a.label);
        const bVol = extractVolume(b.label);
        if (aVol != null && bVol != null && aVol !== bVol) return aVol - bVol;

        const isSelected = (opt: Option) =>
            multiple && Array.isArray(selected)
                ? (selected as (Option | string | number)[]).some((item) =>
                      typeof item === 'object' ? (item as any).value === opt.value : item === opt.label
                  )
                : false;

        const aSel = isSelected(a);
        const bSel = isSelected(b);
        if (aSel !== bSel) return aSel ? -1 : 1;

        // enabled before disabled
        if (!!a.disabled !== !!b.disabled) return a.disabled ? 1 : -1; // <—

        return (a.originalIndex ?? 0) - (b.originalIndex ?? 0);
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
        if (opt.disabled) return;

        const toLabel = (x: any) => (typeof x === 'object' && x !== null ? String(x.label ?? x.value) : String(x));

        if (multiple) {
            if (!Array.isArray(selected)) selected = [];
            const idx = (selected as (Option | string | number)[]).findIndex((item) =>
                typeof item === 'object' ? (item as any).value === opt.value : item === opt.label
            );

            if (idx > -1) {
                (selected as any[]).splice(idx, 1);
            } else {
                (selected as any[]).push(isSimpleOptions ? opt.label : opt);
            }

            const count = (selected as any[]).length;
            if (count === 0) {
                selected = undefined;
                inputValue = '';
            } else {
                selected = [...(selected as any[])];
                inputValue = `${placeholder} (${count})`;
            }

            handleValidate();
            value = isSimpleOptions ? (opt.label as any) : (opt.value as any);

            const selectedLabels = Array.isArray(selected)
                ? (selected as any[]).map(toLabel)
                : selected
                  ? [toLabel(selected)]
                  : [];

            dispatch('change', { selected, selectedLabels });
        } else {
            inputValue = String(opt.label);
            value = isSimpleOptions ? (opt.label as any) : (opt.value as any);
            selected = isSimpleOptions ? (opt.label as any) : opt;
            handleValidate();
            isOpen = false;
            userInput = '';

            const selectedLabels = selected ? [toLabel(selected)] : [];

            dispatch('change', { selected, selectedLabels });
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
    let validateFn;
    $: if (validate) {
        validateFn = validator(validate);
    }
    // expose validate handler to parent
    export function handleValidate() {
        const testValue = multiple ? selected : value;
        error = validateFn ? !validateFn(testValue) : false;
        return !error;
    }

    export let inputClass = '';
    const dispatch = createEventDispatcher();

    function selectDefault() {
        inputValue = '';
        selected = undefined;
        isOpen = false;
        userInput = '';
        dispatch('defaultSelected');
        dispatch('change', { selected: undefined });
    }
</script>

<div class="flex-1">
    <div
        bind:this={wrapperElement}
        class="flex bg-white border-t {$$props.class}"
        style="--font-size: {fontSize}; font-size: var(--font-size);"
    >
        <input
            autocomplete="none"
            class="text text-wblack {inputClass}"
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
</div>

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
                {#if hideDefault}
                    <button class="select-options__item text" type="button" on:click={selectDefault}>
                        {defaultOption}
                    </button>
                {/if}
                {#each sortedOptions as opt, index}
                    <button
                        class="select-options__item text"
                        type="button"
                        on:click={() => selectOption(opt)}
                        disabled={opt.disabled}
                        aria-disabled={opt.disabled}
                        tabindex={opt.disabled ? -1 : 0}
                    >
                        <span>{opt.label}</span>
                        {#if multiple && selectedStates[index]}
                            <svg
                                class="rotate-45"
                                width="9"
                                height="9"
                                viewBox="0 0 100 100"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <line class="line" x1="50" y1="10" x2="50" y2="90" stroke-width="10" />
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
    .select-options__item[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none; /* prevents hover/active visuals */
    }

    :global(.simplebar-scrollbar::before) {
        min-height: 50px !important;
        background-color: #ccc;
    }

    .error {
        color: red;
        font-size: 12px !important;
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
            color: #000;
            outline: none;
            &:hover {
                color: #333;
                background-color: #f5f5f5 !important;
            }
            &:focus {
                background-color: #f5f5f5 !important;
                color: #333;
                outline: none;
            }
            &:active {
                background-color: #e0e0e0 !important;
                color: #333;
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

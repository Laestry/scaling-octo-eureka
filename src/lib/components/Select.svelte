<script lang="ts">
    import { Svroller } from 'svrollbar';
    import { teleport, clickOutside } from '$lib/utils';
    import { onMount } from 'svelte';

    export let placeholder: string = '';
    export let inputValue: any = '';
    export let disabled = false;
    export let selected: Option | undefined = undefined;
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

    type Option = { value: number | string; label: number | string };
    export let options: Option[] = [];

    let isOpen = false;
    let userInput = '';
    let wrapperElement: HTMLElement;
    let optionsFiltered: Option[] = [...options];

    function handleOpen() {
        isOpen = true;
        optionsFiltered = [...options];
    }

    function handleInput(e: Event) {
        console.log(userInput, inputValue, 'sd');

        const target = e.target as HTMLInputElement;
        userInput = target.value;
        inputValue = userInput;
        if (!userInput) {
            optionsFiltered = [...options];
        } else {
            optionsFiltered = options.filter((opt) =>
                String(opt.label).toLowerCase().includes(userInput.toLowerCase())
            );
        }
    }

    function selectOption(opt: Option) {
        inputValue = opt.label;
        selected = opt;
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
        error = selected === null || selected === undefined;
        console.log('handleValidate', error, selected);
    }
</script>

<div class={$$props.class}>
    <div bind:this={wrapperElement} class=" bg-white flex {$$props.class}" style="border-top: solid 1px var(--blue);">
        <input
            class="text {$$props.class}"
            bind:value={inputValue}
            {placeholder}
            {disabled}
            on:input={handleInput}
            on:focus={handleOpen}
            on:click={handleOpen}
            on:blur={handleValidate}
        />
        <svg class="m-[6px]" width="9" height="9" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <line class:rotate={isOpen} class="line" x1="50" y1="10" x2="50" y2="90" stroke-width="10" />
            <line class="line" x1="90" y1="50" x2="10" y2="50" stroke-width="10" />
        </svg>
    </div>
    {#if error}
        <div class="error">
            {hint}
        </div>
    {/if}
</div>
{#if isOpen && optionsFiltered.length > 0}
    <div
        use:teleport={'body'}
        use:clickOutside
        on:click_outside={() => (isOpen = false)}
        class="select-options"
        style={getStyle()}
    >
        <div class="select-options__wrapper svrollbar">
            <Svroller width="100%" height="10rem" alwaysVisible>
                {#each optionsFiltered as opt}
                    <button class="select-options__item text" type="button" on:click={() => selectOption(opt)}>
                        {opt.label}
                        <span> C </span>
                    </button>
                {/each}
            </Svroller>
        </div>
    </div>
{/if}

<style lang="scss">
    .error {
        color: red;
        font-size: 12px;
    }

    .line {
        transform: rotate(0deg);
        transform-origin: center;
        transition: transform 0.2s ease-in-out;
        stroke: var(--blue);
    }

    .line.rotate {
        transform: rotate(90deg);
    }

    input {
        padding: 3px 8px 9px 8px;
    }

    input::placeholder {
        color: var(--blue);
    }

    .select-options {
        width: 100%;
        background: var(--Layer-01, #fff);
        box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 1000;
        padding: 5px 0;
        transition: var(--transition-duration) var(--transition-timing-function);

        /* Customize scrollbar track */
        --svrollbar-track-background: white;
        --svrollbar-track-width: 20px;
        --svrollbar-track-opacity: 1;

        /* Customize scrollbar thumb */
        --svrollbar-thumb-background: var(--blue);
        --svrollbar-thumb-width: 10px;
        --svrollbar-thumb-opacity: 1;

        &__wrapper {
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
    /* Optionally, add a class to rotate the chevron when open */
    .open .input__chevron {
        transform: rotate(-180deg);
    }

    .text {
        font-size: 14px;
        text-align: left;
    }
</style>

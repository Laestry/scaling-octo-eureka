<script lang="ts">
    import Check from '$lib/icons/Check.svelte';
    import Cross from '$lib/icons/Cross.svelte';
    export let checked: boolean = false;
    export let disabled = false;
    export let onText = 'On';
    export let offText = 'Off';
</script>

<label {...$$restProps} class="checkbox items-center {$$props.class}">
    <input class="checkbox__input" type="checkbox" id={$$props.id} name={$$props.name} bind:checked {disabled} />
    <p class="checkbox__text">{offText}</p>
    <span class="checkbox__box">
        <div class="checkbox__box-inner">
            <Check size="16" />
            <Cross size="16" />
        </div>
    </span>
    <p class="checkbox__text">{onText}</p>
</label>

<style lang="scss">
    .checkbox {
        display: flex;
        position: relative;
        gap: 10px;
        cursor: pointer;

        &__input {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            height: 0;
            width: 0;
        }

        &__text {
            font-size: 12px;
            line-height: 20px;
            letter-spacing: -0.1px;
            display: flex;
            flex-direction: column;
            user-select: none;
            margin: auto 0;
            transition: 300ms ease;
        }

        &__description {
            font-size: 12px;
            line-height: 16px;
            letter-spacing: 0.3px;
            user-select: none;
            color: #838d95;
        }

        &__box {
            position: relative;
            width: 40px;
            height: 20px;
            margin: 2px;
            min-height: 20px;
            min-width: 40px;
            border-radius: 100px;
            background: #f5f5f6;
            transition: 300ms ease;
        }

        &__box-inner {
            position: absolute;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            color: #a8afb5;
            transition: 300ms ease;
            :global(svg) {
                position: absolute;
                top: 50%;
                left: 50%;
                opacity: 0;
                transform: translate(-50%, -50%);
                transition: 300ms ease;
            }
            :global(svg:last-child) {
                opacity: 1;
            }
        }

        &__input:checked ~ &__box {
            background: #4a5568;
        }

        &__input:checked ~ &__box > &__box-inner {
            left: 22px;
            color: #4a5568;

            :global(svg:last-child) {
                opacity: 0;
            }

            :global(svg:first-child) {
                opacity: 1;
            }
        }

        &__input:disabled ~ &__box {
            background: #f8f9f9;
        }

        &__input:disabled ~ &__box > &__box-inner {
            color: #cdd1d5;
        }

        &__input:disabled ~ &__text {
            color: #dadddf;
        }

        @media (hover: hover) {
            &:hover {
                .checkbox__input:not(:disabled) ~ .checkbox__text {
                    color: #838d95;
                }

                .checkbox__input:not(:disabled) ~ .checkbox__box {
                    background: #eeefef;
                }

                .checkbox__input:not(:disabled):checked ~ .checkbox__box {
                    background: #4a5568;
                }
            }
        }
    }
</style>

<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import IconMinus from '$lib/icons/minus.svg';
    import IconPlus from '$lib/icons/plus.svg';

    export let title = '';

    let closed = true;
</script>

<div
    class="border-wblack border-t bg-white
    lg:px-[13px] lg:pt-[11px] lg:pb-[13px]
    p-[10px]"
>
    <button
        class="flex justify-between items-center w-full text-wred cursor-pointer
        lg:text-xl md:text-lg text-base
        lg:h-[21px] md:h-[24px] h-[20px]"
        class:active={!closed}
        on:click={() => (closed = !closed)}
    >
        {title}
        <span class="h-2.5">
            {#if closed}
                <img in:fade src={IconPlus} alt="" />
            {:else}
                <img in:fade src={IconMinus} alt="" />
            {/if}
        </span>
    </button>

    {#if !closed}
        <div
            transition:slide
            class="flex flex-wrap gap-y-[30px]
                   lg:gap-4 md:gap-3 gap-2.5
                   lg:mt-[34px] mt-[30px]"
        >
            <slot />
        </div>
    {/if}
</div>

<style lang="scss">
    .active {
        color: var(--blue);
    }
</style>

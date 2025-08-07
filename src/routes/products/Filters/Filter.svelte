<script lang="ts">
    import { teleport } from '$lib/utils/teleport.js';

    type FilterInfo = {
        name: string;
        list: string[];
    };

    export let info: FilterInfo;

    let filter: HTMLButtonElement;
    let open = false;
    let selected = new Set<number>();

    function selectItem(item: number) {
        console.log('selectItem', item, selected);
        if (selected.has(item)) {
            selected.delete(item);
        } else {
            selected.add(item);
        }
    }
</script>

<div class="filter">
    <button
        bind:this={filter}
        class="filter-header"
        on:click={() => {
            open = !open;
        }}
    >
        {info.name}
        {selected.size === 0 ? '' : `(${selected.size})`}
        <div class="filter-icon">
            {#if open}
                -
            {:else}
                +
            {/if}
        </div>
    </button>
    {#if open}
        <div
            class="filter-list"
            style="
            top: {filter.getBoundingClientRect().top + window.scrollY + filter.getBoundingClientRect().height}px;
            left: {filter.getBoundingClientRect().left}px;
        "
            use:teleport={'teleport'}
        >
            {#each info.list as item, index}
                <button class="filter-item" on:click={() => selectItem(index)} class:selected={selected.has(index)}>
                    {#if selected.has(index)}
                        <span class="filter-item-icon">X</span>
                    {/if}
                    {item}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    .filter {
        max-width: 176px;
        width: 100%;
    }
    @media screen and (max-width: 767px) {
        .filter {
            max-width: 100%;
        }
        :global(.filter + .filter),
        .filter:has(+ .filter) {
            max-width: calc(50% - 3px) !important;
        }
    }
    .filter-header {
        @apply flex items-center justify-center bg-[#fff] text-[12px] border-t h-[24px];
        cursor: pointer;
        width: 100%;
        position: relative;
        line-height: 150%;
    }

    .filter-list {
        display: flex;
        flex-direction: column;
        position: absolute;
        width: 176px;
        background: #fff;
        padding: 10px 6px 3px 13px;
        max-height: 132px;
        overflow: auto;
    }
    .filter-item {
        color: #000;
        font-family: 'Riposte';
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 18px */
        letter-spacing: -0.132px;
        text-align: left;
        position: relative;
    }
    .filter-item.selected {
        color: #c96198;
    }
    .filter-item-icon {
        position: absolute;
        top: 0;
        left: -11px;
    }
    .filter-icon {
        position: absolute;
        right: 2px;
        top: 2px;
        width: 14px;
        color: inherit;
        text-align: center;
        font-family: 'Riposte';
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 150%; /* 18px */
        letter-spacing: -0.132px;
        text-transform: uppercase;
    }
</style>

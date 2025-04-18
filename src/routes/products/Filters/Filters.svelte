<script lang="ts">
    import { IconSearch, IconDownload, IconList, IconGrid } from '$lib/icons';
    import Select from '$lib/components/Select.svelte';
    import type { TFilters } from '$lib/models/general';
    import { isGrid, isPrixResto } from '$lib/store';
    import { createEventDispatcher, onMount } from 'svelte';
    import { page } from '$app/stores';
    import { replaceState } from '$app/navigation';

    export let categories = [];
    export let selectedFilters: TFilters;

    type Category = {
        name: string;
        list: string[];
        order: number;
    };

    function parseCategoryValue(val: string | number): number {
        // If it's already a number, return it.
        if (typeof val === 'number') return val;

        // Attempt to match numbers with an optional unit (ml or L)
        const match = val.match(/^([\d.]+)\s*(ml|l)?$/i);
        if (match) {
            let numberPart = parseFloat(match[1]);
            const unit = match[2]?.toLowerCase();
            // Convert liters to milliliters if needed.
            if (unit === 'l') {
                numberPart *= 1000;
            }
            return numberPart;
        }
        // Fallback: try converting the string directly to a number.
        return Number(val) || 0;
    }

    function formatCategories(categories: any[] = []): Category[] {
        // Group by the original type.
        const grouped = categories.reduce(
            (acc, cat) => {
                // Only process if cat.value exists and is not "0".
                if (cat.value && cat.value !== '0') {
                    if (!acc[cat.type]) {
                        acc[cat.type] = [];
                    }
                    if (!acc[cat.type].includes(cat.value)) {
                        acc[cat.type].push(cat.value);
                    }
                }
                return acc;
            },
            {} as Record<string, (string | number)[]>
        );

        // Sort each group using the custom numeric parser.
        for (const key in grouped) {
            grouped[key].sort((a, b) => parseCategoryValue(a) - parseCategoryValue(b));
        }

        // Convert the grouped object to an array.
        let result = Object.entries(grouped).map(([name, list]) => ({ name, list }));

        // Custom mapping for renaming and ordering.
        // key: original type, value: { customName: string, order: number }
        const orderMap: Record<string, { customName: string; order: number }> = {
            originRegion: { customName: 'Regions', order: 1 },
            providerName: { customName: 'Producteurs', order: 2 },
            specificCategory: { customName: 'Charactère', order: 3 },
            uvc: { customName: 'Bouteilles (X/caisse)', order: 4 },
            lblFormat: { customName: 'Format', order: 5 },
            vintage: { customName: 'Millesime', order: 6 }
        };

        // Replace names with custom ones and add an order property for sorting.
        result = result.map((item) => {
            const mapping = orderMap[item.name];
            return {
                name: mapping ? mapping.customName : item.name,
                list: item.list,
                order: mapping ? mapping.order : Infinity // items not in the mapping come last.
            };
        });

        // Sort the categories by the custom order.
        result.sort((a, b) => a.order - b.order);

        // Remove the temporary "order" property before returning.
        const res = result.map(({ order, ...rest }) => rest);
        // console.log('formatCategories', res);
        return res;
    }

    // Format the flat categories array into grouped filters
    const filters = formatCategories(categories);
    const dispatch = createEventDispatcher();

    function clearAllFilters() {
        selectedFilters = {
            producer: undefined,
            region: undefined,
            color: undefined,
            uvc: undefined,
            format: undefined,
            vintage: undefined,
            priceRange: undefined,
            sorting: undefined,
            nameSearch: undefined,
            tag: undefined
        };
        console.log('resetFilters');
        dispatch('resetFilters');
    }

    function togglePrice(range: 'low' | 'mid' | 'high') {
        if (selectedFilters.priceRange === range) {
            selectedFilters.priceRange = undefined;
        } else {
            selectedFilters.priceRange = range;
        }
    }

    let isMounted = false;
    onMount(() => {
        isMounted = true;
    });

    function syncParam(key: string, value: string | number | undefined) {
        if (value !== undefined && value !== null && value !== '') {
            $page.url.searchParams.set(key, String(value));
        } else {
            $page.url.searchParams.delete(key);
        }
    }

    async function setParams() {
        if (!isMounted) return;

        // await delay(300);
        console.log('setParams', $page.url);

        syncParam('producer', selectedFilters.producer);
        syncParam('region', selectedFilters.region);
        syncParam('color', selectedFilters.color);
        syncParam('uvc', selectedFilters.uvc);
        syncParam('format', selectedFilters.format);
        syncParam('vintage', selectedFilters.vintage);
        syncParam('priceRange', selectedFilters.priceRange);
        syncParam('sorting', selectedFilters.sorting);
        syncParam('nameSearch', selectedFilters.nameSearch);
        syncParam('tag', selectedFilters.tag);

        try {
            replaceState($page.url, $page.state);
        } catch (error) {
            console.error(error);
        }
    }

    $: {
        selectedFilters;
        // setParams();
    }

    // $: console.log(selectedFilters);
</script>

<div class="mt-15 flex flex-col lg:gap-4 md:gap-3 gap-[20px]">
    <div class="flex justify-between">
        <div class="flex gap-1 items-center w-full">
            <button class="all-button abutton text-" on:click={clearAllFilters}>Voir tout</button>
            <label class="search md:flex hidden">
                <div class="search__button">
                    <IconSearch />
                </div>
                <input type="text" class="search__input" bind:value={selectedFilters.nameSearch} />
            </label>
        </div>
        <div class="flex gap-1 items-center">
            <label class="checkbox">
                <input type="checkbox" class="checkbox__input" bind:checked={$isPrixResto} />
                <span class="checkbox__text"> {$isPrixResto ? 'Prix Resto' : 'Prix Perso'}</span>
                <span class="checkbox__box"></span>
            </label>
            <div class="flex gap-1">
                <button
                    class="rounded-full w-6 h-6 bg-[#fff] price-button"
                    class:active={selectedFilters.priceRange === 'low'}
                    on:click={() => togglePrice('low')}
                >
                    $
                </button>
                <button
                    class="rounded-full w-6 h-6 bg-[#fff] price-button"
                    class:active={selectedFilters.priceRange === 'mid'}
                    on:click={() => togglePrice('mid')}
                >
                    $$
                </button>
                <button
                    class="rounded-full w-6 h-6 bg-[#fff] price-button"
                    class:active={selectedFilters.priceRange === 'high'}
                    on:click={() => togglePrice('high')}
                >
                    $$$
                </button>
            </div>
        </div>
    </div>
    <div class="md:hidden flex gap-[6px]">
        <label class="search md:hidden flex">
            <button class="search__button">
                <IconSearch />
            </button>
            <input type="text" class="search__input" />
        </label>
        <a
            href={$isPrixResto
                ? 'https://ward.pockethost.io/api/files/pbc_30851581/93ej7tuns0916g5/products_resto_03b592zlit.pdf'
                : 'https://ward.pockethost.io/api/files/pbc_30851581/93ej7tuns0916g5/products_perso_qucjutpys2.pdf'}
            download={$isPrixResto ? 'wardetassocies-prix-resto.pdf' : 'wardetassocies-prix-perso.pdf'}
            class="md:rounded-none rounded-full button-view button-view--link"
            target="_blank"
        >
            <IconDownload />
        </a>
    </div>
    <div class="filters">
        {#if filters.length > 0}
            <Select
                multiple
                class="cusselect"
                options={filters[0].list}
                placeholder={filters[0].name}
                defaultOption="Tous"
                bind:selected={selectedFilters.region}
            />
            <Select
                multiple
                class="cusselect"
                options={filters[1].list}
                placeholder={filters[1].name}
                defaultOption="Tous"
                bind:selected={selectedFilters.producer}
            />
            <Select
                multiple
                class="cusselect"
                options={filters[2].list}
                placeholder={filters[2].name}
                defaultOption="Tous"
                bind:selected={selectedFilters.color}
            />
            <Select
                multiple
                class="cusselect"
                options={filters[4].list}
                placeholder={filters[4].name}
                defaultOption="Tous"
                bind:selected={selectedFilters.format}
            />
            <Select
                multiple
                class="cusselect"
                options={filters[5].list}
                placeholder={filters[5].name}
                defaultOption="Tous"
                bind:selected={selectedFilters.vintage}
            />
        {:else}
            <p>No filters available.</p>
        {/if}
        <Select
            class="cusselect self-end"
            options={['Prix croissant', 'Prix décroissant', 'Alphabétique']}
            placeholder="Trier"
            defaultOption="Tous"
            bind:selected={selectedFilters.sorting}
        />
    </div>

    <div class="hidden justify-end gap-2 md:flex">
        <button class="button-view" class:active={$isGrid} on:click={() => isGrid.set(true)}>
            <IconGrid />
        </button>
        <button class="button-view" class:active={!$isGrid} on:click={() => isGrid.set(false)}>
            <IconList />
        </button>
        <a
            href={$isPrixResto
                ? 'https://ward.pockethost.io/api/files/pbc_30851581/93ej7tuns0916g5/products_resto_03b592zlit.pdf'
                : 'https://ward.pockethost.io/api/files/pbc_30851581/93ej7tuns0916g5/products_perso_qucjutpys2.pdf'}
            download={$isPrixResto ? 'wardetassocies-prix-resto.pdf' : 'wardetassocies-prix-perso.pdf'}
            target="_blank"
            class="md:rounded-none rounded-full button-view button-view--link"
        >
            <IconDownload />
        </a>
    </div>
</div>

<style lang="scss">
    :global(.cusselect) {
        width: 176px;
        @media (max-width: 1136px) {
            width: 121px;
        }
        @media (max-width: 760px) {
            width: 147px;
        }
    }

    .icon {
        width: 24px; /* Set desired width */
        height: 24px; /* Set desired height */
    }
    .filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        @media (max-width: 1136px) {
            gap: 6px;
        }

        :global {
            .filter {
                &:last-of-type {
                    margin-left: auto;
                }
            }
        }
    }
    .search {
        align-items: center;
        padding: 5px 10px;
        border-radius: 100px;
        background: white;
        width: 100%;
        max-width: 478px;
        gap: 8px;
        &__input {
            outline: none;
            border: none;
            background: none;
            width: 100%;
            font-size: 12px;
            &::placeholder {
                color: #000;
            }
        }
    }
    .button-view {
        padding: 8px;
        background: white;
        transition: 0.3s ease;
        color: #3777bc;

        &:hover {
            background: hsla(211, 55%, 96%, 1);
        }

        &.active {
            background: #3777bc;

            :global {
                .icon {
                    color: white;
                }
            }
        }

        :global {
            .icon {
                width: 100%;
            }
        }
    }
    .checkbox {
        display: flex;
        align-items: center;
        gap: 4px;
        background: white;
        padding: 6px 8px;
        border-radius: 64px;
        position: relative;
        cursor: pointer;
        user-select: none;
        &__input {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
        }
        &__text {
            font-size: 12px;
            white-space: nowrap;
            color: #f15a38;
        }
        &__box {
            position: relative;
            background: white;
            transition: 0.3s ease;
            border-radius: 64px;
            width: 21px;
            height: 12px;
            box-sizing: border-box;
            background: #f15a38;
            &::before {
                content: '';
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 1px;
                left: 1px;
                transition: 0.3s ease;
            }
        }
        &__input:checked ~ &__text {
            text-decoration: none;
            color: #3777bc;
        }
        &__input:checked ~ &__box {
            background: #3777bc;
            &::before {
                left: 10px;
            }
        }
    }
    .all-button {
        white-space: nowrap;
        text-align: center;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        background: white;
        line-height: 150%; /* 18px */
        letter-spacing: -0.132px;
        padding: 4px 16px 6px;
        border-radius: 24px;
    }
    .price-button {
        color: #2d63b0;
        text-align: center;
        font-size: 10px;
        font-style: normal;
        transition: 0.3s ease;
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        &:hover {
            background: hsla(211, 55%, 96%, 1);
        }
        &.active {
            background: #2d63b0;
            color: white;
        }
        :global {
            .icon {
                height: 1rem;
                width: auto;
            }
        }
    }
</style>

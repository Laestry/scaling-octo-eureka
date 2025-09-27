<!--src/routes/vins/Filters/Filters.svelte-->
<script lang="ts">
    import { IconSearch, IconDownload, IconList, IconGrid } from '$lib/icons';
    import Select from '$lib/components/Select.svelte';
    import type { TFilters } from '$lib/models/general';
    import { isGrid, isPrixResto } from '$lib/store';
    import { createEventDispatcher, onMount, tick } from 'svelte';
    import { page } from '$app/stores';
    import { replaceState } from '$app/navigation';
    import { formatLocation, formatVolume, getSpecificCategoryLabel } from './utils';
    import { get } from 'svelte/store';

    export let categories: any[] = [];
    export let selectedFilters: TFilters;
    export let nameSearch: string;

    type FilterGroupName = 'category' | 'region' | 'vintage' | 'format' | 'producer';

    type DisplayFilter = {
        name: FilterGroupName;
        label: string; // what you want to show as placeholder
        list: string[];
        rawMap: Record<string, any>;
    };

    const displayNames: Record<FilterGroupName, string> = {
        category: 'Catégorie',
        region: 'Région',
        vintage: 'Millésime',
        format: 'Format',
        producer: 'Producteur'
    };

    function buildDisplayFilters(rawCats: any[] = []): DisplayFilter[] {
        const groups: Record<
            FilterGroupName,
            { name: FilterGroupName; order: number; options: { label: string; value: any }[] }
        > = {} as any;

        rawCats.forEach((cat) => {
            const orgType = cat.type;
            let label: string | null = null;
            let groupKey: FilterGroupName;
            let groupName: FilterGroupName;
            let order: number;

            if (orgType === 'category') {
                label = getSpecificCategoryLabel(cat.value);
                if (!label) return;
                groupKey = 'category';
                groupName = 'category';
                order = 1;
            } else if (orgType === 'location') {
                label = formatLocation(cat.value);
                if (!label) return;
                groupKey = 'region';
                groupName = 'region';
                order = 2;
            } else if (orgType === 'vintage') {
                const vintageNum = Number(cat.value);
                if (!vintageNum) return;
                label = String(vintageNum);
                groupKey = 'vintage';
                groupName = 'vintage';
                order = 3;
            } else if (orgType === 'volume') {
                label = formatVolume(cat.value);
                if (!label) return;
                groupKey = 'format';
                groupName = 'format';
                order = 4;
            } else if (orgType === 'provider') {
                const parsed = typeof cat.value === 'string' ? JSON.parse(cat.value) : cat.value;
                label = parsed?.name;
                if (!label) return;
                groupKey = 'producer';
                groupName = 'producer';
                order = 5;
            } else {
                return;
            }

            if (!groups[groupKey]) {
                groups[groupKey] = { name: groupName, order, options: [] };
            }
            groups[groupKey].options.push({ label, value: cat.value });
        });

        return Object.values(groups)
            .sort((a, b) => a.order - b.order)
            .map((g) => {
                const deduped = g.options.filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i);
                return {
                    name: g.name as FilterGroupName,
                    label: displayNames[g.name as FilterGroupName] ?? g.name,
                    list: deduped.map((o) => o.label),
                    rawMap: Object.fromEntries(
                        deduped.map((o) => {
                            let parsed: any = o.value;
                            if (typeof parsed === 'string') {
                                try {
                                    parsed = JSON.parse(parsed);
                                } catch {}
                            }
                            return [o.label, parsed];
                        })
                    )
                };
            });
    }

    // reactive filters derived from raw categories
    $: filters = buildDisplayFilters(categories);

    const dispatch = createEventDispatcher();

    function clearAllFilters() {
        selectedFilters = {
            producer: undefined,
            region: undefined,
            category: undefined,
            format: undefined,
            vintage: undefined,
            priceRange: undefined,
            sorting: undefined,
            nameSearch: undefined,
            tag: undefined
        };
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

    function appendArrayParam(sp: URLSearchParams, key: string, values: (string | number)[] | undefined) {
        if (!values) return;
        values.forEach((v) => sp.append(key, String(v)));
    }

    let pendingSetParams = false;

    async function setParams() {
        if (!isMounted) return;
        if (pendingSetParams) return; // avoid overlapping invocations
        pendingSetParams = true;
        await tick(); // defer until after initial microtask so router is ready

        const $page = get(page);
        const sp = $page.url.searchParams;

        // clear the short keys first
        ['p', 'r', 'v', 'f', 'cat', 'u', 'pr', 's', 'q', 't'].forEach((k) => sp.delete(k));

        // producer ids -> p
        if (selectedFilters.producer) {
            const arr = Array.isArray(selectedFilters.producer) ? selectedFilters.producer : [selectedFilters.producer];
            appendArrayParam(sp, 'p', arr.map(String));
        }

        // region names -> r
        if (selectedFilters.region) {
            const arr = Array.isArray(selectedFilters.region) ? selectedFilters.region : [selectedFilters.region];
            appendArrayParam(sp, 'r', arr.map(String));
        }

        // vintage years -> v
        if (selectedFilters.vintage) {
            const arr = Array.isArray(selectedFilters.vintage) ? selectedFilters.vintage : [selectedFilters.vintage];
            appendArrayParam(sp, 'v', arr.map(String));
        }

        // format volumes -> f
        if (selectedFilters.format) {
            const arr = Array.isArray(selectedFilters.format) ? selectedFilters.format : [selectedFilters.format];
            appendArrayParam(sp, 'f', arr.map(String));
        }

        if (selectedFilters.category) {
            const arr = Array.isArray(selectedFilters.category) ? selectedFilters.category : [selectedFilters.category];

            arr.forEach((o) => {
                let parsed: any = o;
                if (typeof parsed === 'string') {
                    try {
                        parsed = JSON.parse(parsed);
                    } catch {
                        // leave as is
                    }
                }
                const categoryVal = parsed?.category;
                const specificCategory = parsed?.specificCategory;
                if (categoryVal != null && specificCategory != null) {
                    sp.append('cat', `${categoryVal}_${specificCategory}`);
                }
            });
        }

        // priceRange -> pr
        if (selectedFilters.priceRange) {
            sp.set('pr', selectedFilters.priceRange);
        }

        // sorting -> s (you can normalize values if you want shorter tokens)
        if (selectedFilters.sorting) {
            sp.set('s', selectedFilters.sorting);
        }

        // nameSearch -> q
        if (nameSearch) {
            sp.set('q', nameSearch);
        }

        // tag -> t
        if (selectedFilters.tag) {
            sp.set('t', selectedFilters.tag);
        }

        try {
            replaceState($page.url, $page.state);
        } catch (error) {
            console.error(error);
        }
    }

    // group name -> selected label(s)
    $: selectedByGroup = filters.reduce(
        (acc, f) => {
            const rawValue = selectedFilters[f.name];
            if (rawValue === undefined || rawValue === null) {
                acc[f.name] = undefined;
                return acc;
            }
            const rawArr = Array.isArray(rawValue) ? rawValue : [rawValue];
            const labels = Object.entries(f.rawMap)
                .filter(([, value]) => rawArr.some((rv) => deepEqual(value, rv)))
                .map(([label]) => label);
            acc[f.name] = labels.length ? labels : undefined;
            return acc;
        },
        {} as Record<FilterGroupName, string[] | undefined>
    );

    function normalizeVal(v: any) {
        if (typeof v === 'string') {
            try {
                return JSON.parse(v);
            } catch {}
        }
        return v;
    }

    function deepEqual(a: any, b: any) {
        const na = normalizeVal(a);
        const nb = normalizeVal(b);
        // simple stable stringify comparison; if you need better you can swap in a deep eq lib
        return JSON.stringify(na) === JSON.stringify(nb);
    }

    // $: console.log('selectedByGroup', selectedByGroup);
    // $: console.log('selectedValuesByGroup', selectedValuesByGroup);
    // $: console.log('selectedFilters', selectedFilters);
    // $: console.log('filters', filters);

    // 2. selectedLabelsByGroup: for binding into the <Select> (labels)
    $: selectedLabelsByGroup = filters.reduce(
        (acc, f) => {
            const rawValue = selectedFilters[f.name];
            if (rawValue === undefined || rawValue === null) {
                acc[f.name] = undefined;
                return acc;
            }
            const rawArr = Array.isArray(rawValue) ? rawValue : [rawValue];
            const labels = Object.entries(f.rawMap)
                .filter(([, value]) => rawArr.some((rv) => deepEqual(value, rv)))
                .map(([label]) => label);
            acc[f.name] = labels.length ? labels : undefined;
            return acc;
        },
        {} as Record<FilterGroupName, string[] | undefined>
    );

    // 3. selectedValuesByGroup: actual parsed values (what you asked for)
    $: selectedValuesByGroup = filters.reduce(
        (acc, f) => {
            const rawValue = selectedFilters[f.name];
            if (rawValue === undefined || rawValue === null) {
                acc[f.name] = undefined;
                return acc;
            }
            const rawArr = Array.isArray(rawValue) ? rawValue : [rawValue];
            acc[f.name] = rawArr.map((v) => normalizeVal(v));
            return acc;
        },
        {} as Record<FilterGroupName, any[] | undefined>
    );

    // sync URL when filters change
    $: {
        if (isMounted) {
            setParams();
        }
    }

    $: if (selectedFilters) setParams();
</script>

<div class="mt-15 flex flex-col lg:gap-4 md:gap-3 gap-[20px]">
    <div class="flex justify-between">
        <div class="flex gap-1 items-center w-full">
            <label class="search md:flex hidden">
                <div class="search__button">
                    <IconSearch />
                </div>
                <input type="text" class="search__input" bind:value={nameSearch} />
            </label>
        </div>
        <div class="flex gap-1 items-center">
            <button class="all-button abutton text-" on:click={clearAllFilters}>Liste complète</button>
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
            {#each filters as f}
                <Select
                    multiple
                    class="cusselect"
                    options={f.list}
                    placeholder={f.label}
                    defaultOption="Tout afficher"
                    selected={selectedLabelsByGroup[f.name]}
                    on:change={(e) => {
                        const sel = e.detail?.selected;
                        const labels = (() => {
                            if (sel == null) return undefined;
                            if (Array.isArray(sel)) return sel.map(String);
                            return [String(sel)];
                        })();

                        const field = f.name;

                        if (!labels || labels.length === 0) {
                            selectedFilters[field] = undefined;
                        } else {
                            const rawValues = labels
                                .map((lbl) => {
                                    const mapped = f.rawMap[lbl];
                                    return typeof mapped === 'object' ? JSON.stringify(mapped) : mapped;
                                })
                                .filter(Boolean);
                            selectedFilters[field] = rawValues.length === 1 ? rawValues[0] : rawValues;
                        }
                    }}
                />
            {/each}
        {:else}
            <p>No filters available.</p>
        {/if}
        <Select
            class="cusselect self-end"
            options={['Prix croissant', 'Prix décroissant', 'Alphabétique']}
            placeholder="Trier"
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
        color: #666;

        &:hover {
            background: #f5f5f5;
        }

        &.active {
            background: #333;

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
            color: #333;
        }
        &__input:checked ~ &__box {
            background: #333;
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
        color: #666;
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
            background: #f5f5f5;
        }
        &.active {
            background: #333;
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

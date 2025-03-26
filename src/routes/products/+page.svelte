<script lang="ts">
    import { onDestroy } from 'svelte';
    import ProductGrid from './ProductGrid.svelte';
    import ProductList from './ProductList.svelte';
    import Filters from './Filters/Filters.svelte';
    import type { PageData } from './$types';
    import type { TFilters } from '$lib/models/general';
    import { pb } from '$lib/pocketbase';

    export let data: PageData;
    $: products = data.products.items;
    let isGrid = true;

    let selectedFilters: TFilters = {
        producer: undefined,
        region: undefined,
        color: undefined,
        uvc: undefined,
        format: undefined,
        vintage: undefined,
        priceRange: undefined,
        restaurantPrice: true,
        sorting: undefined,
        nameSearch: undefined
    };

    // Debounce timer reference
    let debounceTimer: ReturnType<typeof setTimeout>;

    async function updateProducts() {
        // Clear any existing debounce timer
        if (debounceTimer) clearTimeout(debounceTimer);

        // Delay the API call by 300ms
        debounceTimer = setTimeout(async () => {
            console.log('getting products');
            const filterParts: string[] = [];

            if (selectedFilters.producer) {
                filterParts.push(`providerName="${selectedFilters.producer}"`);
            }
            if (selectedFilters.region) {
                filterParts.push(`originRegion="${selectedFilters.region}"`);
            }
            if (selectedFilters.color) {
                filterParts.push(`specificCategory="${selectedFilters.color}"`);
            }
            if (selectedFilters.uvc) {
                filterParts.push(`uvc=${selectedFilters.uvc}`);
            }
            if (selectedFilters.format) {
                filterParts.push(`lblFormat="${selectedFilters.format}"`);
            }
            if (selectedFilters.vintage) {
                filterParts.push(`vintage="${selectedFilters.vintage}"`);
            }
            if (selectedFilters.priceRange) {
                if (selectedFilters.priceRange === 'low') {
                    filterParts.push(`price>=20 && price<=30`);
                } else if (selectedFilters.priceRange === 'mid') {
                    filterParts.push(`price>=30 && price<=40`);
                } else if (selectedFilters.priceRange === 'high') {
                    filterParts.push(`price>=40`);
                }
            }
            if (selectedFilters.nameSearch) {
                // Using ~ operator for partial matches (adjust according to PocketBase syntax)
                filterParts.push(`name ~ "${selectedFilters.nameSearch}"`);
            }

            // Combine filters with AND logic
            const filterString = filterParts.join(' && ');

            // Determine sort order: "Prix" for price or "Alphabétique" for name.
            let sort = '';
            if (selectedFilters.sorting === 'Prix') {
                sort = 'price';
            } else if (selectedFilters.sorting === 'Alphabétique') {
                sort = 'name';
            }

            try {
                const result = await pb.collection('alcohol_products').getList(1, 20, {
                    filter: filterString || undefined,
                    sort: sort || undefined
                });
                products = result.items;
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }, 300);
    }

    // Run updateProducts whenever any filter value changes.
    $: selectedFilters, updateProducts();

    // Clean up the debounce timer when the component is destroyed.
    onDestroy(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
    });
</script>

<div>
    <Filters bind:isGrid categories={data.categories} bind:selectedFilters />
    {#if products.length === 0}
        <div class="mt-[100px]">No Wines found under that search</div>
    {:else if isGrid}
        <ProductGrid class="mt-[32px]" {products} />
    {:else}
        <ProductList {products} />
    {/if}
</div>

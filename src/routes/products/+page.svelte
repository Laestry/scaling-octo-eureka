<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import ProductGrid from './ProductGrid.svelte';
    import ProductList from './ProductList.svelte';
    import Filters from './Filters/Filters.svelte';
    import type { PageData } from './$types';
    import type { TFilters } from '$lib/models/general';
    import { pb } from '$lib/pocketbase';

    export let data: PageData;
    let products = data.products.items;
    let record = data.products;
    let isGrid = true;

    let selectedFilters: TFilters = {
        producer: undefined,
        region: undefined,
        color: undefined,
        uvc: undefined,
        format: undefined,
        vintage: undefined,
        priceRange: undefined,
        sorting: undefined,
        nameSearch: undefined
    };

    // Pagination state
    let currentPage = 2;
    let isLoading = false;
    let hasMore = true;
    let sentinel: HTMLDivElement;

    /**
     * loadMoreProducts: Fetches the next page of products.
     */
    async function loadMoreProducts() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        // Build the filter string based on selected filters.
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
            // Use the ~ operator for partial matches (adjust per PocketBase syntax)
            filterParts.push(`name ~ "${selectedFilters.nameSearch}"`);
        }
        const filterString = filterParts.join(' && ');

        // Determine sort order: "Prix" for price or "Alphabétique" for name.
        let sort = '';
        if (selectedFilters.sorting === 'Prix') {
            sort = 'price';
        } else if (selectedFilters.sorting === 'Alphabétique') {
            sort = 'name';
        }

        try {
            const result = await pb.collection('alcohol_products').getList(currentPage, 20, {
                filter: filterString || undefined,
                sort: sort || undefined
            });

            if (result.totalPages === result.page) {
                hasMore = false;
            } else {
                products = [...products, ...result.items];
                record = result;
                currentPage = result.page + 1;
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            isLoading = false;
        }
    }

    async function updateProducts() {
        console.log('updateProducts');
        const filtersApplied = Object.values(selectedFilters).some((filter) => filter !== undefined);
        if (!filtersApplied) {
            console.log('No filters applied.');
            return;
        }
        currentPage = 1;
        hasMore = true;
        products = [];
        await loadMoreProducts();
    }

    $: selectedFilters, updateProducts();

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadMoreProducts();
                    }
                });
            },
            {
                rootMargin: '300px' // Adjust this margin as needed.
            }
        );

        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    });

    // Clean up any resources when the component is destroyed.
    onDestroy(() => {
        // No debounce timer in this version; clean up if necessary.
    });
</script>

<div>
    <Filters bind:isGrid categories={data.categories} bind:selectedFilters />
    {#if isLoading && products.length === 0}
        loading wines
    {:else if products.length === 0}
        <div class="mt-[100px]">No Wines found under that search</div>
    {:else if isGrid}
        <ProductGrid class="mt-[12px]" {products} />
    {:else}
        <ProductList {products} />
    {/if}

    {#if hasMore}
        <div bind:this={sentinel} class="h-1" />
    {/if}
</div>

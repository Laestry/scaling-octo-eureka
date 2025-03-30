<script lang="ts">
    import { onMount } from 'svelte';
    import ProductGrid from './ProductGrid.svelte';
    import ProductList from './ProductList.svelte';
    import Filters from './Filters/Filters.svelte';
    import type { PageData } from './$types';
    import type { TFilters } from '$lib/models/general';
    import { pb } from '$lib/pocketbase';
    import { isGrid } from '$lib/store';

    export let data: PageData;
    let products = data.products.items;
    let record = data.products;
    let hasMore = record.page !== record.totalPages;

    let selectedFilters: TFilters = data.filterObj
        ? data.filterObj
        : {
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
    let sentinel: HTMLDivElement;

    async function loadMoreProducts() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        // Build the filter string based on selected filters.
        const filterParts: string[] = [];
        if (selectedFilters.tag) {
            filterParts.push(`tags~"${selectedFilters.tag}"`);
        }
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
        // console.log('filterString', filterString);
        try {
            const result = await pb.collection('alcohol_products').getList(currentPage, 20, {
                filter: filterString || undefined,
                sort: sort || undefined
            });
            // console.log('result', result);
            if (result.totalPages === result.page) {
                products = [...products, ...result.items];
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

    let skipTwice = 0;
    async function updateProducts(reset = false) {
        // console.log('updateProducts', selectedFilters);

        const filtersApplied = Object.values(selectedFilters).some((filter) => filter !== undefined);
        if (skipTwice !== 2 && !reset) {
            // if (!filtersApplied && !reset) {
            skipTwice++;
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
                rootMargin: isGrid ? '500px' : '300px' // Adjust this margin as needed.
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
</script>

<div class="lg:mb-[56px] md:mb-[40px] mb-[80px]">
    <Filters categories={data.categories} bind:selectedFilters on:resetFilters={() => updateProducts(true)} />
    {#if isLoading && products.length === 0}
        loading wines
    {:else if products.length === 0}
        <div class="mt-[100px]">No Wines found under that search</div>
    {:else if $isGrid}
        <ProductGrid class="lg:mt-4 md:mt-5 mt-10" {products} />
    {:else}
        <ProductList {products} />
    {/if}

    {#if hasMore}
        <div bind:this={sentinel} class="h-1" />
    {/if}
</div>

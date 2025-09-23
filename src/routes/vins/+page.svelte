<script lang="ts">
    import { onMount } from 'svelte';
    import ProductGrid from './ProductGrid.svelte';
    import ProductList from './ProductList.svelte';
    import Filters from './Filters/Filters.svelte';
    import type { PageData } from './$types';
    import type { TFilters } from '$lib/models/general';
    import { isGrid } from '$lib/store';
    import { supabase } from '$lib/supabase/client';
    import { fetchFilteredProductsForAlcohol } from './Filters/utils';
    import WaitlistForm from '$lib/components/WaitlistForm.svelte';

    export let data: PageData;
    let products = data.products.data;
    let loaded = 20;
    let hasMore = data.products.count > 20;
    const PAGE_SIZE = 20;

    let selectedFilters: TFilters = data.selectedFilters ?? {
        producer: undefined,
        region: undefined,
        category: undefined,
        uvc: undefined,
        format: undefined,
        vintage: undefined,
        priceRange: undefined,
        sorting: undefined,
        nameSearch: undefined,
        tag: undefined
    };

    // Pagination state
    let currentPage = 2;
    let isLoading = false;
    let sentinel: HTMLDivElement;

    async function loadMoreProducts() {
        if (isLoading || !hasMore) return;
        isLoading = true;
        console.log('selectedFilters', selectedFilters);

        try {
            const {
                data: newProducts,
                count,
                error
            } = await fetchFilteredProductsForAlcohol(supabase, selectedFilters, {
                limit: PAGE_SIZE,
                offset: loaded,
                sorting: selectedFilters.sorting
            });

            if (error) {
                console.error('Error loading more products:', error);
                return;
            }

            if (!newProducts || newProducts.length === 0) {
                hasMore = false;
                return;
            }

            products = [...products, ...newProducts];
            loaded += newProducts.length;

            if (count !== null) {
                if (loaded >= count) {
                    hasMore = false;
                }
            } else if (newProducts.length < PAGE_SIZE) {
                hasMore = false;
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            isLoading = false;
        }
    }

    let skipTwice = 0;
    $: if (selectedFilters) updateProducts();
    async function updateProducts(reset = false) {
        if (skipTwice !== 2 && !reset) {
            skipTwice++;
            console.log('No filters applied.');
            return;
        }
        currentPage = 1;
        hasMore = true;
        products = [];
        loaded = 0;
        await loadMoreProducts();
    }

    onMount(() => {
        console.log('products data', data);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadMoreProducts();
                    }
                });
            },
            {
                rootMargin: isGrid ? '500px' : '300px'
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

    $: outerWidth = 0;
    $: if (outerWidth < 1162) isGrid.set(true);
</script>

<svelte:window bind:outerWidth />

<div class="lg:mt-[56px] md:mt-[40px] mt-[80px]">
    <Filters categories={data.categories.data} bind:selectedFilters on:resetFilters={() => updateProducts(true)} />
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

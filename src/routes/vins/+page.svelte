<!--src/routes/vins/+page.svelte-->
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

    export let data: PageData;
    let products = data.products.data;
    let enabledFacets: any = data.enabledFacets.data;

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
    let nameSearch = '';

    // Pagination state
    let currentPage = 2;
    let isLoading = false;
    let sentinel: HTMLDivElement;

    function withNameSearch(f: TFilters, q: string) {
        const trimmed = q?.trim();
        return trimmed ? { ...f, nameSearch: trimmed } : { ...f, nameSearch: undefined };
    }

    async function loadMoreProducts() {
        if (isLoading || !hasMore) return;
        isLoading = true;

        try {
            const productsPromise = fetchFilteredProductsForAlcohol(
                supabase,
                withNameSearch(selectedFilters, nameSearch),
                {
                    limit: PAGE_SIZE,
                    offset: loaded,
                    sorting: selectedFilters.sorting
                }
            );

            const facetsPromise = supabase.schema('cms_saq').rpc('search_alcohol_facets', {
                payload: {
                    organization_id: 2,
                    limit: 20,
                    offset: 0,
                    sorting: selectedFilters.sorting ?? null,
                    producer: selectedFilters.producer && JSON.parse(String(selectedFilters.producer)),
                    region: selectedFilters.region && JSON.parse(String(selectedFilters.region)),
                    category:
                        selectedFilters.category && JSON.parse(`[${[selectedFilters.category].flat().join(',')}]`),
                    format: selectedFilters.format && JSON.parse(String(selectedFilters.format)),
                    vintage: [selectedFilters.vintage].flat().filter(Boolean),
                    nameSearch: nameSearch || null,
                    tag: selectedFilters.tag || null,
                    priceRange: selectedFilters.priceRange || null
                }
            });

            const [{ data: newProducts, count, error: productsError }, { data: facets, error: facetsError }] =
                await Promise.all([productsPromise, facetsPromise]);

            // Update facets regardless of product result; log facet error but don't hard-fail listing.
            enabledFacets = facets;
            console.log('selectedFilters', selectedFilters);
            console.log('search_alcohol_facets', facets, facetsError);
            if (facetsError) {
                console.error('Facets error:', facetsError);
            }

            if (productsError) {
                console.error('Error loading more products:', productsError);
                return;
            }

            if (!newProducts || newProducts.length === 0) {
                hasMore = false;
                return;
            }

            products = [...products, ...newProducts];
            loaded += newProducts.length;

            if (count !== null) {
                if (loaded >= count) hasMore = false;
            } else if (newProducts.length < PAGE_SIZE) {
                hasMore = false;
            }
        } catch (err) {
            console.error('Error fetching products/facets:', err);
        } finally {
            isLoading = false;
        }
    }

    // debounce for nameSearch only
    let nsTimer: ReturnType<typeof setTimeout> | null = null;
    $: if (nameSearch !== undefined) {
        if (nsTimer) clearTimeout(nsTimer);
        nsTimer = setTimeout(() => updateProducts(), 420);
    }

    let skipCounter = 0;
    $: if (selectedFilters) updateProducts();
    async function updateProducts(reset = false) {
        if (!reset && skipCounter < 3) {
            skipCounter++;
            // console.log('No filters applied.');
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

<div class="lg:mt-[56px] md:mt-[40px] mt-[36px]">
    <Filters
        categories={data.categories.data}
        bind:selectedFilters
        bind:nameSearch
        on:resetFilters={() => updateProducts(true)}
        {enabledFacets}
    />
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

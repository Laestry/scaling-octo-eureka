<script lang="ts">
    import ProductList from '../../vins/ProductList.svelte';
    import Logo from '$lib/components/Logo.svelte';
    import Footer from '../Footer.svelte';
    import { handleGetPDF } from '../utils';
    import { onMount, tick } from 'svelte';

    export let data;
    let products = data.products;
    let productsList: [][] = [];

    // first chunk = 18, subsequent chunks = 19
    $: productsList = chunkWithHead(products, 18, 18);

    function chunkWithHead<T>(arr: T[], head: number, size: number): T[][] {
        if (!Array.isArray(arr) || arr.length === 0) return [];
        const out: T[][] = [];
        const first = Math.min(head, arr.length);
        out.push(arr.slice(0, first));
        for (let i = first; i < arr.length; i += size) {
            out.push(arr.slice(i, i + size));
        }
        return out;
    }
    console.log(data);

    onMount(async () => {
        await tick();
        await handleGetPDF(`Ward&Associés liste des vins`);
        window.close();
    });
</script>

<!--<button-->
<!--    class="!cursor-pointer"-->
<!--    on:click={() => {-->
<!--        handleGetPDF(`Ward&Associés liste des vins`);-->
<!--    }}-->
<!--&gt;-->
<!--    Download PDF-->
<!--</button>-->

<div id="pdf">
    {#each productsList as p}
        <div class="sheet flex flex-col">
            <Logo color="black" class="w-[70px] mb-[23px] -ml-[13px]" />
            <ProductList products={p} isPDF />
            <div class="flex-1" />
            <Footer class="mt-[28px]" />
        </div>
    {/each}
</div>

<style>
    .sheet {
        transform-origin: 0 0;
        height: 1056px; /* 3300 → 1056 */
        width: 816px; /* 2550 → 816  */
        background: #fff;
        padding: 36px 48px 46px 48px;
        box-shadow: 0 3.2px 9.6px rgba(0, 0, 0, 0.12); /* 0 10 30 */
    }
</style>

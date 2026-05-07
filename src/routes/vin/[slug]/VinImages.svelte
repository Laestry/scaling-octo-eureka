<script>
    import { ALCOHOL_BASE_PATH } from '$lib/utils/images';
    import NonDispoBadge from '$lib/components/NonDispoBadge.svelte';
    export let product;

    const paths = product.image_paths ?? [];
    const fallback = paths[0]
        ? ALCOHOL_BASE_PATH + paths[0]
        : '/defaultImages/default-alcohol.png';

    const img0 = paths[0] ? ALCOHOL_BASE_PATH + paths[0] : fallback;
    const img1 = paths[1] ? ALCOHOL_BASE_PATH + paths[1] : fallback;
    const img2 = paths[2] ? ALCOHOL_BASE_PATH + paths[2] : fallback;

    let currentSlide = 0;

    $: isSoldOut = !product.alcohol_batches?.some((b) => b.calculated_quantity > 0);
</script>

<div
    class="relative
                lg:w-[446px] md:w-[308px] w-[280px]
                lg:h-[661px] md:h-[439px] h-[262px]
                mr-[14px]
                "
>
    <button
        class="absolute z-[1] left-0 bottom-0
        lg:w-[262px] md:w-[181px] w-[94px]
        lg:h-[363px] md:h-[241px] h-[125px]"
        class:z-[4]={currentSlide === 0}
        on:mouseenter={() => (currentSlide = 0)}
        on:click={() => (currentSlide = 0)}
    >
        <img class="object-cover w-full h-full" src={img0} alt="Wine" />
    </button>
    <button
        class="absolute z-[2] md:left-[12px] left-[6px] bottom-0
        lg:w-[435px] md:w-[247px] w-[196px]
        lg:h-[603px] md:h-[439px] h-[262px]"
        class:z-[4]={currentSlide === 2}
        on:mouseenter={() => (currentSlide = 2)}
        on:click={() => (currentSlide = 2)}
    >
        <img class="object-cover w-full h-full" src={img2} alt="Wine" />
    </button>
    <button
        class="absolute z-[3] md:left-[12px] left-[99px] bottom-0
        lg:w-[358px] md:w-[300px] w-[181px]
        lg:h-[661px] md:h-[401px] h-[240px]"
        class:z-[4]={currentSlide === 1}
        on:mouseenter={() => (currentSlide = 1)}
        on:click={() => (currentSlide = 1)}
    >
        <img class="object-cover w-full h-full" src={img1} alt="Wine" />
    </button>

    {#if isSoldOut}<NonDispoBadge />{/if}

    <div class="absolute z-10">
        <div
            class="relative flex
                lg:w-[446px] md:w-[308px] w-[280px]
                lg:h-[661px] md:h-[439px] h-[262px]"
        >
            <button class="flex-1 md:order-1" on:mouseenter={() => (currentSlide = 0)} />
            <button class=" flex-1 lg:order-2 order-3" on:mouseenter={() => (currentSlide = 1)} />
            <button class=" flex-1 lg:order-3 order-2" on:mouseenter={() => (currentSlide = 2)} />
        </div>
    </div>
</div>

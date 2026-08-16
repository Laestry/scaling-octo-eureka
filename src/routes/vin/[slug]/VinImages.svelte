<script>
    import { ALCOHOL_BASE_PATH } from '$lib/utils/images';
    import NonDispoBadge from '$lib/components/NonDispoBadge.svelte';
    export let product;

    const DEFAULT_IMAGE = '/defaultImages/default-alcohol.png';

    const slots = [
        {
            slideIndex: 0,
            class: 'absolute z-[1] left-0 bottom-0 lg:w-[262px] md:w-[181px] w-[94px] lg:h-[363px] md:h-[241px] h-[125px]',
            hoverOrder: 'flex-1 md:order-1',
        },
        {
            slideIndex: 1,
            class: 'absolute z-[3] md:left-[12px] left-[99px] bottom-0 lg:w-[358px] md:w-[300px] w-[181px] lg:h-[661px] md:h-[401px] h-[240px]',
            hoverOrder: 'flex-1 lg:order-3 order-2',
        },
        {
            slideIndex: 2,
            class: 'absolute z-[2] md:left-[12px] left-[6px] bottom-0 lg:w-[435px] md:w-[247px] w-[196px] lg:h-[603px] md:h-[439px] h-[262px]',
            hoverOrder: 'flex-1 lg:order-2 order-3',
        },
    ];

    function getActiveSlotIndices(count) {
        if (count === 1) return [2];
        if (count === 2) return [0, 1];
        return [0, 1, 2];
    }

    $: paths = product.image_paths ?? [];
    $: images =
        paths.length > 0
            ? paths.slice(0, 3).map((path) => ALCOHOL_BASE_PATH + path)
            : [DEFAULT_IMAGE];
    $: activeSlots = getActiveSlotIndices(images.length).map((slotIndex, imageIndex) => ({
        ...slots[slotIndex],
        src: images[imageIndex],
    }));

    let currentSlide = 0;

    $: if (currentSlide >= activeSlots.length) currentSlide = 0;
    $: isSoldOut = !product.alcohol_batches?.some((b) => b.calculated_quantity > 0);
</script>

<div
    class="relative
                lg:w-[446px] md:w-[308px] w-[280px]
                lg:h-[661px] md:h-[439px] h-[262px]
                md:flex-shrink-0
                mr-[14px]
                "
>
    {#each activeSlots as slot, i (slot.src)}
        <button
            class={slot.class}
            class:z-[4]={currentSlide === i}
            on:mouseenter={() => (currentSlide = i)}
            on:click={() => (currentSlide = i)}
        >
            <img class="object-cover w-full h-full" src={slot.src} alt="Wine" />
        </button>
    {/each}

    {#if isSoldOut}<NonDispoBadge />{/if}

    {#if activeSlots.length > 1}
        <div class="absolute z-10">
            <div
                class="relative flex
                lg:w-[446px] md:w-[308px] w-[280px]
                lg:h-[661px] md:h-[439px] h-[262px]"
            >
                {#each activeSlots as slot, i (slot.src)}
                    <button class="flex-1 {slot.hoverOrder}" on:mouseenter={() => (currentSlide = i)} />
                {/each}
            </div>
        </div>
    {/if}
</div>

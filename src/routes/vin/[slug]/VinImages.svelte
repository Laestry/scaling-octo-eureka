<script>
    import { getVinImage } from '$lib/utils/images';
    export let product;
    let img0;
    let img1;
    let img2;

    let hasImages = product.alcohol_website[0].alcohol_images.length > 0;
    let hasOnlyOneImage = product.alcohol_website[0].alcohol_images.length === 1;

    if (true) {
        // if (hasImages && !hasOnlyOneImage) {
        img0 = getVinImage(product, 0);
        img1 = getVinImage(product, 1);
        img2 = getVinImage(product, 2);
    } else if (hasOnlyOneImage) {
        img0 = getVinImage(product, 0);
    } else {
        img0 = '/defaultImages/default-alcohol.png';
    }

    let currentSlide = 0;
</script>

<div
    class="relative
                lg:w-[446px] md:w-[308px] w-[280px]
                lg:h-[661px] md:h-[439px] h-[262px]
                mr-[14px]
                "
>
    <!--{#if !hasImages || hasOnlyOneImage}-->
    {#if false}
        <img class="object-cover w-full h-full" src={img0} alt="Wine" />
    {:else}
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
    {/if}

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

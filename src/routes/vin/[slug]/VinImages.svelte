<script>
    import { getVinImage } from '$lib/utils/images';
    export let product;
    let img0 = getVinImage(product, 0);
    let img1 = getVinImage(product, 1);
    let img2 = getVinImage(product, 2);
    let currentSlide = 0;
</script>

<div
    class="relative
                lg:w-[462px] md:w-[308px] w-[280px]
                lg:h-[639px] md:h-[439px] h-[262px]
                mr-[14px]
                "
>
    <button
        class="absolute z-[1] left-0 bottom-0 lg:w-[271px] lg:h-[375px] md:w-[181px] md:h-[241px] w-[94px] h-[125px]"
        class:z-[4]={currentSlide === 0}
        on:mouseenter={() => (currentSlide = 0)}
        on:click={() => (currentSlide = 0)}
    >
        <img class="object-cover w-full h-full" src={img0} alt="Wine" />
    </button>
    <button
        class="absolute z-[2] md:left-[12px] left-[6px] bottom-0 lg:w-[450px] lg:h-[591px] md:w-[247px] md:h-[439px] w-[196px] h-[262px]"
        class:z-[4]={currentSlide === 2}
        on:mouseenter={() => (currentSlide = 2)}
        on:click={() => (currentSlide = 2)}
    >
        <img class="object-cover w-full h-full" src={img2} alt="Wine" />
    </button>
    <button
        class="absolute z-[3] md:left-[12px] left-[99px] bottom-0 lg:w-[374px] lg:h-[639px] md:w-[300px] md:h-[401px] w-[181px] h-[240px]"
        class:z-[4]={currentSlide === 1}
        on:mouseenter={() => (currentSlide = 1)}
        on:click={() => (currentSlide = 1)}
    >
        <img class="object-cover w-full h-full" src={img1} alt="Wine" />
    </button>
</div>

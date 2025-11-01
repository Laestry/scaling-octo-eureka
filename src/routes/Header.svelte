<script lang="ts">
    import Logo from '$lib/components/Logo.svelte';
    import { page, navigating } from '$app/stores';
    import { IconSearch } from '$lib/icons';
    import { fade } from 'svelte/transition';
    import { totalItems } from '$lib/cart';
    import { onMount } from 'svelte';
    import { isPrixResto } from '$lib/store';

    $: currentPath = $page.url.pathname;
    let prevPath = '';
    let isRight = true;

    navigating.subscribe((nav) => {
        if (nav) {
            prevPath = nav.from?.url.pathname || '';
            currentPath = nav.to?.url.pathname || '';
            isRight = determineDirection(prevPath, currentPath);
        }
    });

    let backdrop: 'main' | 'associes' | 'vision' | undefined = undefined;
    let computedColor = '#000000';

    function determineDirection(prev: string, current: string): boolean {
        const routes = ['/', '/associes', '/vision'];
        const prevIndex = routes.indexOf(prev);
        const currentIndex = routes.indexOf(current);
        // If current route is to the right of the previous route in the array, slide left
        return currentIndex <= prevIndex;
    }

    $: {
        if (currentPath) {
            switch (currentPath) {
                case '/':
                    backdrop = 'main';
                    computedColor = '#F15A38';
                    break;
                case '/associes':
                    backdrop = 'associes';
                    computedColor = '#FFFFFF';
                    break;
                case '/vision':
                    backdrop = 'vision';
                    computedColor = '#FFFFFF';
                    break;
                default:
                    backdrop = undefined;
                    computedColor = '#000000';
            }
        }
    }

    let showGoBack = false;
    const threshold = 180;
    onMount(() => {
        const handleScroll = () => {
            showGoBack = window.scrollY > threshold;
        };

        window.addEventListener('scroll', handleScroll);
        // run once in case the page is already scrolled
        handleScroll();

        console.log('header', $page.url.pathname);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });

    let flag = false;
</script>

<!--cart and search button-->
<div id="global-nav" class="w-full flex justify-center">
    <div
        class="fixed flex justify-end items-center pointer-events-none
        lg:w-[1136px] md:w-[760px] w-[300px]
        lg:mt-[65px] md:mt-8 mt-5
        md:gap-1 gap-2.5"
        style="z-index: 10000"
    >
        {#if showGoBack}
            <a transition:fade class="abutton circle" href="#logo">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#000000"
                    height="800px"
                    width="800px"
                    version="1.1"
                    id="Layer_1"
                    viewBox="0 0 330 330"
                    xml:space="preserve"
                    class="w-3.5"
                >
                    <path
                        id="XMLID_224_"
                        d="M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394  l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393  C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z"
                    />
                </svg>
            </a>
        {/if}

        <label class="checkbox pointer-events-auto">
            <input type="checkbox" class="checkbox__input" bind:checked={$isPrixResto} />
            <span class="checkbox__text"> {$isPrixResto ? 'Prix Resto' : 'Prix Perso'}</span>
            <span class="checkbox__box"></span>
        </label>
        <div class="md:flex-0 md:hidden block flex-1"></div>

        <a class="abutton circle" href="/vins">
            <div class="h-3.5 w-3.5">
                <IconSearch />
            </div>
        </a>
        <a class="abutton !w-fit circle {$totalItems > 0 ? '!bg-wred !text-white' : ''}" href="/cart">
            {$totalItems}
        </a>
    </div>
</div>

<div id="logo"></div>
<div class="lg:flex flex-col hidden mx-auto w-[1136px]">
    <div class="flex h-[142px]">
        <a href="/" class="ml-[10px]">
            <Logo
                color="var(--red)"
                class="abutton
                       w-[112px] h-[85px]
                       mt-6"
            />
        </a>

        <div class="ml-[166px] flex gap-[16px] mt-[57px] justify-between header-products-links">
            <a
                class="abutton header-links"
                style="color: var(--red);"
                href="/associes"
                class:active={backdrop === 'associes'}
            >
                Associés
            </a>
            <a
                class="abutton header-links"
                style="color: var(--red);"
                href="/vision"
                class:active={backdrop === 'vision'}
            >
                Vision
            </a>
            <a
                class="abutton header-links"
                style="color: var(--red);"
                href="/vins"
                class:active={$page.url.pathname === '/vins'}
            >
                Vins
            </a>
        </div>
    </div>

    {#if $page.url.pathname === '/cart'}
        <div class="header-products-links !text-black w-full border-t border-wblack text-center mb-[105px]">
            Panier d’achat
        </div>
    {/if}
</div>

<!--navlinks-->
{#if $page.url.pathname === '/cart' || $page.url.pathname.startsWith('/vin') || $page.url.pathname.startsWith('/success')}
    <div class="lg:hidden w-full flex justify-center">
        <div class="lg:w-[1136px] md:w-[760px] w-[300px] flex flex-col md:items-center">
            <a href="/">
                <Logo
                    color={computedColor}
                    class="abutton mx-auto
                       lg:w-[132px] lg:h-[130px]
                       md:w-[83px] md:h-[82px]
                       w-[90px] h-[69px]
                       md:mt-0 mt-[90px]"
                />
            </a>
            {#if $page.url.pathname === '/cart'}
                <div class="header-products-links !text-black">Panier d’achat</div>
            {:else}
                <div class="flex lg:gap-[16px] md:gap-[12px] mt-[22px] justify-between header-products-links">
                    <a
                        class="abutton"
                        style="color: var(--dynamic-color);"
                        href="/associes"
                        class:active={backdrop === 'associes'}
                    >
                        Associés
                    </a>
                    <a
                        class="abutton"
                        style="color: var(--dynamic-color);"
                        href="/vision"
                        class:active={backdrop === 'vision'}
                    >
                        Vision
                    </a>
                    <a
                        class="abutton"
                        style="color: var(--dynamic-color);"
                        href="/vins"
                        class:active={$page.url.pathname === '/vins'}
                    >
                        Vins
                    </a>
                </div>
            {/if}
        </div>
    </div>
{:else}
    <div
        class="backdrops justify-center"
        class:backdrops--1={backdrop === 'main'}
        class:backdrops--2={backdrop === 'associes'}
        class:backdrops--3={backdrop === 'vision'}
    >
        <div
            class="absolute top-0 left-2/4 translate-x-[-50%] z-10
                   flex flex-col lg:h-[176px] items-center lg:w-[1136px] md:w-[680px] w-[300px]"
            style="--dynamic-color: {computedColor}; color: var(--dynamic-color);"
        >
            <a href="/" class="lg:hidden self-center">
                <Logo
                    color={computedColor}
                    class="abutton
                       lg:w-[132px] lg:h-[130px]
                       md:w-[83px] md:h-[82px]
                       w-[90px] h-[69px]
                       md:mt-0 mt-[78px]"
                />
            </a>

            <div
                class="lg:hidden flex uppercase items-center flex-1
                lg:h-[96px] h-auto
                lg:mt-[22px] md:mt-[20px] mt-[55px]"
                style="--dynamic-color: {computedColor}; color: var(--dynamic-color);"
            >
                <div class="flex gap-[16px] lg:flex-row flex-col">
                    <a
                        class="abutton header-links"
                        style="color: var(--dynamic-color);"
                        href="/associes"
                        class:active={backdrop === 'associes'}
                    >
                        Associés
                    </a>
                    <a
                        class="abutton header-links"
                        style="color: var(--dynamic-color);"
                        href="/vision"
                        class:active={backdrop === 'vision'}
                    >
                        Vision
                    </a>
                    <a
                        class="abutton header-links"
                        style="color: var(--dynamic-color);"
                        href="/vins"
                        class:active={$page.url.pathname === '/vins'}
                    >
                        Vins
                    </a>
                </div>
            </div>
        </div>

        <div class="m-x-auto">
            {#if backdrop}
                <a href="/" class="backdrop backdrop--1" aria-label="Go to home page">
                    <span class="sr-only">Home</span>
                </a>
                <a href="/associes" class="backdrop backdrop--2" aria-label="Go to associates page">
                    <span class="sr-only">Associés</span>
                </a>
                <a href="/vision" class="backdrop backdrop--3" aria-label="Go to vision page">
                    <span class="sr-only">Vision</span>
                </a>
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    .checkbox {
        display: flex;
        align-items: center;
        gap: 4px;
        background: white;
        padding: 5px 8px;
        border-radius: 64px;
        position: relative;
        cursor: pointer;
        user-select: none;
        &__input {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
        }
        &__text {
            font-size: 12px;
            white-space: nowrap;
            color: #f15a38;
        }
        &__box {
            position: relative;
            background: white;
            transition: 0.3s ease;
            border-radius: 64px;
            width: 21px;
            height: 12px;
            box-sizing: border-box;
            background: #f15a38;
            &::before {
                content: '';
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 1px;
                left: 1px;
                transition: 0.3s ease;
            }
        }
        &__input:checked ~ &__text {
            text-decoration: none;
            color: #333;
        }
        &__input:checked ~ &__box {
            background: #333;
            &::before {
                left: 10px;
            }
        }
    }

    .circle {
        pointer-events: auto;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        text-align: center;
        height: 24px;
        width: 24px;
        min-width: 24px;
        font-size: 14px;
        background-color: white;
        color: #000;

        @media (max-width: 767px) {
            border-radius: 24px;
            height: 39px;
            width: 39px;
            min-width: 39px;
            font-size: 16px;
        }
    }

    .header-products-links a {
        text-transform: capitalize;
        width: 176px;
        padding: 2px 0;
        text-align: center;
        color: var(--red);
        font-size: 24px;
        font-weight: 400;
        line-height: 150%;

        @media (max-width: 1162px) {
            font-size: 20px;
            height: auto;
            width: auto;
            padding: 0 24px;
        }

        @media (max-width: 767px) {
            padding: 0;
        }
    }

    .header-links {
        text-transform: capitalize;
        width: 176px;
        height: 40px;
        padding: 2px 0;
        text-align: center;
        color: var(--red);
        font-size: 24px;
        font-weight: 400;
        line-height: 150%;

        @media (max-width: 1162px) {
            font-size: 48px;
            height: auto;
            width: auto;
        }
    }

    .active {
        text-decoration: underline;
        text-underline-position: under;
    }

    //backdrop
    .backdrop {
        width: 100%;
        background-image: url('/images/cover/mainbackdropLG.png');
        background-size: cover;
        background-repeat: no-repeat;
        position: absolute;
        margin: auto;
        left: 0;
        top: 0;
        height: 100%;
        transition: 1s ease;
    }

    .backdrop--1 {
        transform: translateX(-140px);
        z-index: 3;
        @media (max-width: 767px) {
            transform: translateX(0px);
            background-position: 50% center;
        }
    }
    .backdrop--2 {
        transform: translateX(-70px);
        background-image: url('/images/winefermenting.png');
        z-index: 2;
        @media (max-width: 767px) {
            transform: translateX(0);
            background-position: 70% center;
        }
    }
    .backdrop--3 {
        background-image: url('/images/vision.png');
        z-index: 1;
    }
    .backdrops--2 .backdrop--1 {
        transform: translateX(calc(-100% + 70px));
        @media (max-width: 767px) {
            transform: translateX(-100%);
        }
    }
    .backdrops--3 .backdrop--1 {
        transform: translateX(calc(-100% + 70px));
        @media (max-width: 767px) {
            transform: translateX(-100%);
        }
    }
    .backdrops--3 .backdrop--2 {
        transform: translateX(calc(-100% + 140px));
        @media (max-width: 767px) {
            transform: translateX(-100%);
        }
    }

    .backdrops {
        display: flex;
        position: relative;
        height: 772px;
        width: 100%;
        max-width: 1512px;
        margin: auto;
        overflow: hidden;
        @media (max-width: 1162px) {
            height: 545px;
        }
    }
    .backdrops:not(:is(.backdrops--1, .backdrops--2, .backdrops--3)) {
        height: 200px;
    }
    @media (max-width: 1162px) and (min-width: 680px) {
        .backdrops:not(:is(.backdrops--1, .backdrops--2, .backdrops--3)) {
            height: 430px;
        }
        .checkbox {
            padding: 5px 8px;

            &__text {
                font-size: 18px;
            }
        }
    }
    @media (max-width: 679px) {
        .backdrops:not(:is(.backdrops--1, .backdrops--2, .backdrops--3)) {
            height: 130px;
        }

        .checkbox {
            padding: 9px;

            &__text {
                font-size: 16px;
            }

            &__box {
                margin-top: 4px;
                transition: 0.3s ease;
                width: 21px;
                height: 12px;
                box-sizing: border-box;
                &::before {
                    width: 10px;
                    height: 10px;
                }
            }
        }
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
</style>

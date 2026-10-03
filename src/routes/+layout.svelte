<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';
    import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
    import Footer from './Footer.svelte';
    import Header from './Header.svelte';
    import BlueDotCursor from '$lib/BlueDotCursor.svelte';
    import AgeVerificationDialog from '$lib/components/AgeVerificationDialog.svelte';
    import Cookies from 'js-cookie';
    import type { PageData } from './$types';
    import { setSupabase } from '$lib/supabase/client';

    export let data: PageData;
    setSupabase(data.supabase);

    let ageVerified: boolean = data.ageVerified ?? false;

    function acceptAge() {
        Cookies.set('age_verified', '1', { expires: 365, path: '/' });
        ageVerified = true;
    }

    // ---- page transitions ---------------------------------------------------------------------
    //
    // The current page flies out as soon as a navigation starts, and the next one flies in only
    // once it has loaded and rendered. SvelteKit swaps the page after its load functions finish
    // (onNavigate), so that is where we wait for the exit to end; afterNavigate then plays the
    // entrance. No fixed delay: a slow page simply keeps the stage empty a bit longer.

    const OUT_MS = 1200;
    const IN_MS = 500;
    const SHIFT = 200;
    const EASE_OUT = 'cubic-bezier(0.32, 0, 0.67, 0)'; // cubicIn, as fly's easing played backwards
    const EASE_IN = 'cubic-bezier(0.33, 1, 0.68, 1)'; // cubicOut, fly's default

    let stage: HTMLDivElement | undefined;
    let exit: Animation | null = null;
    /** +1: old page leaves to the right and the new one comes from the left; -1 the reverse */
    let direction = 1;
    /** True from the exit's start to the entrance's end: the page wrapper clips the sideways slide. */
    let sliding = false;

    /** Paths that change page without the slide. */
    function skipsAnimation(from: string, to: string) {
        return from === '/cart' && (to === '/cart' || to === '/');
    }

    /** Moving "back" through the main sections slides the other way. */
    function directionFor(from: string, to: string) {
        const leftward =
            (from === '/' && to === '/associes') ||
            (from === '/associes' && to === '/vision') ||
            (from === '/' && to === '/vision') ||
            (from === '/cart' && to === '/');
        return leftward ? -1 : 1;
    }

    beforeNavigate((navigation) => {
        const from = navigation.from?.url.pathname ?? '';
        const to = navigation.to?.url.pathname ?? '';
        // Query or hash changes on the same page (filters, #anchors) are not page changes.
        if (navigation.willUnload || !navigation.to || from === to) return;
        if (!stage || skipsAnimation(from, to)) return;

        // A second click while the first is still leaving keeps the exit already running.
        if (!exit) {
            sliding = true;
            direction = directionFor(from, to);
            exit = stage.animate(
                [
                    { transform: 'translateX(0)', opacity: 1 },
                    { transform: `translateX(${direction * SHIFT}px)`, opacity: 0 }
                ],
                { duration: OUT_MS, easing: EASE_OUT, fill: 'forwards' }
            );
        }

        // Cancelled or failed navigation: bring the current page back.
        navigation.complete.catch(() => {
            exit?.cancel();
            exit = null;
            sliding = false;
        });
    });

    onNavigate(async () => {
        // The next page has loaded; let the old one finish leaving before it is replaced. Capped by
        // a timer: a tab that is not painting (in the background) never advances its animations,
        // and the navigation must not wait on them.
        if (!exit) return;
        await Promise.race([
            exit.finished.catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, OUT_MS + 100))
        ]);
    });

    afterNavigate(() => {
        if (!exit || !stage) return;
        // The exit's last frame (invisible) holds until the entrance takes over, so there is no flash.
        const entrance = stage.animate(
            [
                { transform: `translateX(${-direction * SHIFT}px)`, opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ],
            { duration: IN_MS, easing: EASE_IN }
        );
        exit.cancel();
        exit = null;
        // Unless another navigation already started sliding again. Timer-capped like the exit: a
        // tab that is not painting never finishes its animations.
        Promise.race([
            entrance.finished.catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, IN_MS + 100))
        ]).then(() => {
            if (!exit) sliding = false;
        });
    });

    $: isDownloadPDF = $page.url.pathname.includes('download-pdf');
</script>

{#if !ageVerified && !isDownloadPDF}
    <AgeVerificationDialog on:accept={acceptAge} on:quit={() => window.close()} />
{/if}

<div class="flex flex-col min-h-screen">
    {#if !isDownloadPDF}
        <div style="max-width:100vw; background-color:#F6F1F2" class="pb-[53px] flex-1" class:clip-x={sliding}>
            <Header />
            <div bind:this={stage}>
                <slot />
            </div>
        </div>

        <Footer />
        <BlueDotCursor />
    {:else}
        <slot />
    {/if}
</div>

<style>
    /* The slide moves the page 200px sideways; without this the window grows a horizontal
       scrollbar for the length of the transition. clip, unlike hidden, keeps sticky children. */
    .clip-x {
        overflow-x: clip;
    }
</style>

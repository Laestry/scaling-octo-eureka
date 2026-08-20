<script lang="ts">
    import '../app.css';
    import { navigating, page } from '$app/stores';
    import { fly } from 'svelte/transition';
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

    let prevPath = '';
    let currentPath = $page.url.pathname;
    let isRight = true;

    /* NEW */
    let animate = true; // flip to false for the paths we want to skip
    $: isDownloadPDF = currentPath.includes('download-pdf');
    navigating.subscribe((n) => {
        if (n) {
            const from = n.from?.url.pathname || '';
            const to = n.to?.url.pathname || '';

            // ———————————————————————————————
            // paths that should NOT animate
            // ———————————————————————————————
            if (from === '/cart' && (to === '/cart' || to === '/')) {
                animate = false; // 👈 skip fly
            } else {
                animate = true; // default: animate
            }

            prevPath = from;
            currentPath = to;

            isRight =
                (prevPath === '/' && currentPath === '/associes') ||
                (prevPath === '/associes' && currentPath === '/vision') ||
                (prevPath === '/' && currentPath === '/vision') ||
                (prevPath === '/cart' && currentPath === '/')
                    ? false
                    : true;
        }
    });
</script>

{#if !ageVerified && !isDownloadPDF}
    <AgeVerificationDialog on:accept={acceptAge} on:quit={() => window.close()} />
{/if}

<div class="flex flex-col min-h-screen">
    {#if !isDownloadPDF}
        <div style="max-width:100vw; background-color:#F6F1F2" class="pb-[53px] flex-1">
            <Header />
            {#key currentPath}
                <!-- with fly transition -->
                <div
                    in:fly={isRight ? { x: -200, duration: 500, delay: 1700 } : { x: 200, duration: 500, delay: 1500 }}
                    out:fly={isRight ? { x: 200, duration: 1200 } : { x: -200, duration: 1200 }}
                >
                    <slot />
                </div>
            {/key}
        </div>

        <Footer />
        <BlueDotCursor />
    {:else}
        <slot />
    {/if}
</div>

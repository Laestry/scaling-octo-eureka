<script lang="ts">
    import '../app.css';
    import { navigating, page } from '$app/stores';
    import { fly } from 'svelte/transition';
    import Footer from './Footer.svelte';
    import Header from './Header.svelte';
    import BlueDotCursor from '$lib/BlueDotCursor.svelte';
    import type { PageData } from './$types';
    import { setSupabase } from '$lib/supabase/client';

    export let data: PageData;
    setSupabase(data.supabase);

    let prevPath = '';
    let currentPath = $page.url.pathname;
    let isRight = true;

    /* NEW */
    let animate = true; // flip to false for the paths we want to skip
    $: isFicheTechnique = currentPath.includes('fiche-technique');
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

{#if !isFicheTechnique}
    <div style="max-width:100vw; background-color:#F6F1F2" class="pb-[53px]">
        <Header />
        {#key currentPath}
            <!-- with fly transition -->
            <div
                in:fly={isRight ? { x: -200, duration: 500, delay: 1500 } : { x: 200, duration: 500, delay: 1500 }}
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

<script lang="ts">
    import '../app.css';
    import { navigating, page } from '$app/stores';
    import { fly } from 'svelte/transition';
    import Footer from './Footer.svelte';
    import Header from './Header.svelte';
    import type { PageData } from './$types';
    import { setSupabase } from '$lib/supabase/client';

    export let data: PageData;
    // console.log('data', data);
    setSupabase(data.supabase);

    let prevPath = '';
    let currentPath = $page.url.pathname;
    let isRight = true;
    let phase: 'idle' | 'start' | 'end' = 'idle';

    navigating.subscribe((n) => {
        if (n) {
            phase = 'start';

            prevPath = n.from?.url.pathname || '';
            currentPath = n.to?.url.pathname || '';
            if (
                (prevPath === '/' && currentPath === '/associes') ||
                (prevPath === '/associes' && currentPath === '/vision') ||
                (prevPath === '/' && currentPath === '/vision') ||
                (prevPath === '/cart' && currentPath === '/')
            ) {
                isRight = false;
            } else {
                isRight = true;
            }
        } else {
            phase = 'end';
        }
    });
</script>

<div style="max-width: 100vw; background-color: #F6F1F2" class="pb-[53px]">
    <Header />

    {#key `${currentPath}::${phase}`}
        <div
            in:fly={isRight ? { x: -200, duration: 500, delay: 1500 } : { x: 200, duration: 500, delay: 1500 }}
            out:fly={isRight ? { x: 200, duration: 1200 } : { x: -200, duration: 1200 }}
        >
            <slot />
        </div>
    {/key}
</div>
<Footer />

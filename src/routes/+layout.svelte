<script lang="ts">
    import '../app.css';
    import { navigating, page } from '$app/stores';
    import { fly } from 'svelte/transition';
    import Footer from './Footer.svelte';
    import Header from './Header.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let prevPath = '';
    let currentPath = $page.url.pathname;
    let isRight = true;

    navigating.subscribe((navigating) => {
        if (navigating) {
            prevPath = navigating.from?.url.pathname || '';
            currentPath = navigating.to?.url.pathname || '';
            if (
                (prevPath === '/' && currentPath === '/associes') ||
                (prevPath === '/associes' && currentPath === '/vision') ||
                (prevPath === '/' && currentPath === '/vision')
            ) {
                isRight = false;
            } else {
                isRight = true;
            }
        }
    });
</script>

<div style="max-width: 100vw; background-color: #F6F1F2" class="pb-[53px]">
    <Header />

    {#key currentPath}
        <div
            in:fly={isRight ? { x: -200, duration: 1000, delay: 300 } : { x: 200, duration: 1000, delay: 300 }}
            out:fly={isRight ? { x: 200, duration: 1000 } : { x: -200, duration: 1000 }}
        >
            <slot />
        </div>
    {/key}
</div>
<Footer />

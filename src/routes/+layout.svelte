<script lang="ts">
	import '../app.css';
	import { cartStore } from '$lib/store';
	import { navigating, page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: $cartStore = data.cart;

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

<div style="overflow: hidden; max-width: 100vw; background-color: #F6F1F2" class="pb-[53px]" id="teleport">
	{#if currentPath === '/' || currentPath === '/vision' || currentPath === '/associes'}
		<div
			in:fly={isRight ? { x: -200, duration: 1000, delay: 300 } : { x: 200, duration: 1000, delay: 300 }}
			out:fly={isRight ? { x: 200, duration: 1000 } : { x: -200, duration: 1000 }}
		>
			<Header
				color={currentPath === '/' ? '#DE6643' : '#fff'}
				class="absolute top-0 left-2/4 translate-x-[-50%] z-10"
				backdrop={currentPath === '/' ? 'main' : currentPath === '/associes' ? 'associes' : 'vision'}
			/>
		</div>
	{/if}

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

<style>
	#teleport {
		position: relative;
	}
</style>

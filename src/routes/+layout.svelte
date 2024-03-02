<script lang="ts">
	import '../app.css';
	import { cartStore } from '$lib/store';
	import { navigating, page  } from '$app/stores';
	import { fly } from 'svelte/transition'
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	export let data;

	cartStore.set(data.cart);
	$: currentPage = data.url
	$: prevPage = '/'
	$: isRight = true 
	$: if ($navigating) {
		prevPage = $navigating?.from.route.id
		currentPage = $navigating?.to.route.id
		if(
			prevPage === '/' && currentPage === '/associes' ||
			prevPage === '/associes' && currentPage === '/vision' ||
			prevPage === '/' && currentPage === '/vision'
		) {
			isRight = false
		} else {
			isRight = true
		}
	}
</script>

<div style="overflow: hidden; max-width: 100vw; background-color: #F6F1F2" class="pb-[53px]" id="teleport">
	{#if currentPage === '/' || currentPage === '/vision' || currentPage === '/associes'}
		<div 
			in:fly={isRight ? { x: -200, duration: 1000, delay: 300 } : { x: 200, duration: 1000, delay: 300 }}
			out:fly={isRight ? { x: 200, duration: 1000 } : { x: -200, duration: 1000 }}
		>
			<Header page={currentPage} color={currentPage === '/' ? '#DE6643' : '#fff'} class="absolute top-0 left-2/4 translate-x-[-50%] z-10"/>
		</div>
	{/if}

	{#key data.url}
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
	
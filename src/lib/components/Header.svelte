<script lang="ts">
	import { cartStore } from '$lib/store';
	import Logo from '$lib/components/Logo.svelte';
	import { page } from '$app/stores';
	import IconSearch from './IconSearch.svelte';

	export let color = '#000000';
	let class_ = '';
	export { class_ as class };
	export let backdrop: 'main' | 'associes' | 'vision' | undefined = undefined;
</script>

<div
	class="backdrops"
	class:backdrops--1={backdrop === 'main'}
	class:backdrops--2={backdrop === 'associes'}
	class:backdrops--3={backdrop === 'vision'}
>
	<div
		class="z-10 left-2/4 absolute translate-x-[-50%] flex flex-col lg:h-[176px] items-center lg:w-[1120px] md:w-[680px] w-[358px] {class_}"
		style="--dynamic-color: {color}; color: var(--dynamic-color);"
	>
		<a href="/" class="h-[130px] w-[130px] flex items-center justify-center">
			<Logo {color} />
		</a>

		<div class="self-end absolute mt-8 flex gap-1 text-[10px] items-center">
			<a
				class="h-[24px] w-[24px] flex items-center justify-center rounded-full"
				style="border: 1px solid white; background-color: white; color: #000"
				href="/cart"
			>
				{$cartStore?.length ?? 0}
			</a>
			<a
				class="h-[24px] w-[24px] flex items-center justify-center rounded-full"
				style="border: 1px solid white; background-color: white; color: #000"
				href="/products"
			>
				<IconSearch></IconSearch>
			</a>
		</div>

		<div class="md:flex hidden uppercase items-center lg:h-[96px] h-auto flex-1 mt-[22px]">
			<div class="flex gap-[16px] lg:flex-row flex-col">
				<a
					class="header-links"
					style="color: var(--dynamic-color);"
					href="/associes"
					class:active={backdrop === 'associes'}
				>
					Associes
				</a>
				<a
					class="header-links"
					style="color: var(--dynamic-color);"
					href="/vision"
					class:active={backdrop === 'vision'}
				>
					Vision
				</a>
				<a
					class="header-links"
					style="color: var(--dynamic-color);"
					href="/products"
					class:active={$page.url.pathname === '/products'}
				>
					Vins
				</a>
			</div>
		</div>
	</div>

	{#if backdrop}
		<a href="/" class="backdrop backdrop--1" />
		<a href="/associes" class="backdrop backdrop--2" />
		<a href="/vision" class="backdrop backdrop--3" />
	{/if}
</div>

<style>
	.header-links {
		text-transform: capitalize;
		width: 176px;
		height: 40px;
		padding: 2px 0;
		text-align: center;
		color: #de6643;
		font-size: 24px;
		font-weight: 400;
		line-height: 150%;

		@media (max-width: 1119px) {
			font-size: 48px;
			height: auto;
			width: auto;
		}
	}
	.header-links.active {
		text-decoration: underline;
		text-underline-position: under;
	}
	.backdrop {
		width: 100%;
		background-image: url('/images/mainbackdrop.png');
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center bottom;
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		transition: 1s ease;
	}
	.backdrop--1 {
		transform: translateX(-140px);
		z-index: 3;
	}
	.backdrop--2 {
		transform: translateX(-70px);
		background-image: url('/images/winefermenting.png');
		z-index: 2;
	}
	.backdrop--3 {
		background-image: url('/images/vision.png');
		z-index: 1;
	}
	/* .backdrops--1 .backdrop--2 {
		transform: translateX();
	}
	.backdrops--1 .backdrop--3 {
		width: 100%;
	} */
	.backdrops--2 .backdrop--1 {
		transform: translateX(calc(-100% + 70px));
	}
	.backdrops--3 .backdrop--1 {
		transform: translateX(calc(-100% + 70px));
	}
	.backdrops--3 .backdrop--2 {
		transform: translateX(calc(-100% + 140px));
	}

	.backdrops {
		display: flex;
		position: relative;
		height: 772px;
		width: 100%;
	}
	.backdrops:not(:is(.backdrops--1, .backdrops--2, .backdrops--3)) {
		height: 200px;
	}
	@media (max-width: 1119px) and (min-width: 680px) {
		.backdrops:not(:is(.backdrops--1, .backdrops--2, .backdrops--3)) {
			height: 430px;
		}
	}
	@media (max-width: 679px) {
		.backdrops:not(:is(.backdrops--1, .backdrops--2, .backdrops--3)) {
			height: 130px;
		}
	}
</style>

<script lang="ts">
	import { cartStore } from '$lib/store';
	import Logo from '$lib/components/Logo.svelte';
	// import { fade, fly } from 'svelte/transition';

	export let color = '#000';
	export let page = '';
</script>

<div
	class="backdrops"
	class:backdrops--1={page === '/'}
	class:backdrops--2={page === '/associes'}
	class:backdrops--3={page === '/vision'}
>
	<div
		class="z-10 left-2/4 absolute translate-x-[-50%] flex flex-col lg:h-[176px] items-center lg:w-[1120px] md:w-[680px] w-[358px] {$$props.class}"
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
				href="/product"
			>
				<svg
					width="15"
					height="14"
					viewBox="0 0 15 14"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<line x1="10.2415" y1="9.80921" x2="14.3413" y2="13.6343" stroke="black" />
					<circle cx="6" cy="6" r="5.5" stroke="black" />
				</svg>
			</a>
		</div>

		<div class="md:flex hidden uppercase items-center lg:h-[96px] h-auto flex-1 mt-[22px]">
			<div class="flex gap-[16px]">
				<a class="header-links" style="color: var(--dynamic-color);" href="/associes">Associes</a>
				<a class="header-links" style="color: var(--dynamic-color);" href="/vision">Vision</a>
				<a class="header-links" style="color: var(--dynamic-color);" href="/products">Vins</a>
			</div>
		</div>
	</div>
	<!-- <div transition:fade class="w-[100px] h-[100px] bg-color1 absolute z-20"></div> -->
	<!-- <div transition:fade class="left-[100px] w-[100px] h-[100px] bg-primary absolute z-20"></div> -->
	{#if page !== ''}
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
</style>

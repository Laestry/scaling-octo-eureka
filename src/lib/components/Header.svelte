<script lang="ts">
	import { cartStore } from '$lib/store';
	import Logo from '$lib/components/Logo.svelte';

	export let color = '#000';
</script>

<div class="w-full flex justify-center">
	<div
		class="flex flex-col lg:h-[176px] items-center
lg:w-[1120px] md:w-[680px] w-[358px] {$$props.class}"
		style="--dynamic-color: {color}; color: var(--dynamic-color);
"
	>
		<a href="/" class="h-[120px] w-[120px] flex items-center justify-center">
			<Logo {color} />
		</a>

		<div class="self-end absolute mt-[33px] flex gap-[12px] text-[10px] items-center">
			<a href="/cart">Sign Up</a>
			<a
				class="h-[24px] w-[24px] pr-[1px] flex items-center justify-center rounded-2xl"
				style="border: 1px solid var(--dynamic-color)"
				href="/cart"
			>
				{$cartStore?.length ?? 0}
			</a>
		</div>

		<div class="md:flex hidden uppercase items-center lg:h-[96px] h-auto flex-1">
			<div class="flex gap-[16px]">
				<a class="header-links" href="/associes">Associes</a>
				<a class="header-links" href="/vision">Vision</a>
				<a class="header-links" href="/products">Vins</a>
			</div>
		</div>
	</div>
</div>

<style>
	.header-links {
		text-transform: capitalize;
		width: 176px;
		height: 40px;
		padding-top: 9px;
		text-align: center;
		border-bottom: 1px solid var(--dynamic-color);
	}
</style>

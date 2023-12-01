<script lang="ts">
	import { cartStore } from '$lib/store';
</script>

<div class="flex flex-col w-full lg:h-[176px] md:h-[96px] h-[48px] items-center">
	<a href="/" class="h-[120px] w-[120px] flex items-center justify-center">
		<img
			src="/logo.svg"
			alt="logo"
			class="lg:mb-[16px] mt-none lg:w-[102px] md:w-[64px] w-[32px]"
		/>
	</a>

	<div class=" self-end absolute mt-[33px] flex gap-[3px] text-[10px] items-center">
		<a href="/cart">Sign Up</a>
		<a
			class="h-[24px] w-[24px] pr-[1px] flex items-center justify-center rounded-2xl border"
			href="/cart"
		>
			{$cartStore?.length ?? 0}
		</a>
	</div>

	<div class="md:flex hidden uppercase items-center lg:h-[96px] h-auto flex-1">
		<div class="flex gap-[16px]">
			<a class="header-links" href="/associes">Associes</a>
			<a class="header-links" href="/vision">Vision</a>
			<a class="header-links" href="/vins">Vins</a>
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
		border-bottom: 0.5px solid #000;
	}
</style>

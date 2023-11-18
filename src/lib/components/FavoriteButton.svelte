<script>
	import { fade } from 'svelte/transition';
	export let selected = false;
</script>

<button
	class="h-[24px] w-[24px] flex items-center justify-center"
	on:click|stopPropagation={() => {
		selected = !selected;
	}}
>
	{#if selected}
		<img class="absolute" transition:fade src="/icons/heart_filled.svg" alt="favorite selected" />
	{:else}
		<img class="absolute" transition:fade src="/icons/heart.svg" alt="favorite unselected" />
	{/if}
</button>

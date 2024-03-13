<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	export let title = '';

	let closed = true;
</script>

<div>
	<button
		class="oai border-t flex justify-between w-full bg-[#fff] px-[6px] py-[3px] text-[#DE6643] cursor-pointer"
		on:click={() => {
			closed = !closed;
		}}
	>
		{title}
		<div>
			{#if closed}
				<div in:fade class="flex items-center justify-center h-[24px] w-[28px]">
					<img src="/icons/plus.svg" alt="" />
				</div>
			{:else}
				<div in:fade class="flex items-center justify-center h-[24px] w-[28px]">
					<img src="/icons/minus.svg" alt="" />
				</div>
			{/if}
		</div>
	</button>

	{#if !closed}
		<div class="bg-[#fff] p-[6px]" transition:slide>
			<slot />
		</div>
	{/if}
</div>

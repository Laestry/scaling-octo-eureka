<script lang="ts">
	import { fade, slide } from 'svelte/transition';

	export let title = '';

	let closed = true;
</script>

<div>
	<button
		class="oai border-t flex justify-between w-full"
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
		<div transition:slide>
			<slot />
		</div>
	{/if}
</div>

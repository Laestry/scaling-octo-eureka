<script lang="ts" context="module">
	export type Item = {
		src: string;
		id?: string | number;
		width?: number;
		height?: number;
		alt?: string;
	};
	export const default_options: Partial<SlidyOptions> = {
		loop: true,
		snap: 'center'
	};
</script>

<script lang="ts" generics="T extends Item">
	import '@slidy/svelte/dist/slidy.css';
	import { Slidy, type SlidyOptions } from '@slidy/svelte';

	interface $$Slots {
		default: {
			item: T;
		};
	}

	export let slides: T[] = [];
	export let options: Omit<Partial<SlidyOptions>, 'index' | 'slides'> = {};
	export let current = 0;
</script>

<div class="wrapper">
	<Slidy
		{...default_options}
		{...options}
		bind:index={current}
		counter={false}
		arrows={false}
		slides={slides.map((x, i) => ({ ...x, id: x.id ?? i }))}
		let:item
	>
		<div class="item">
			<slot {item}>
				<img {...item} />
			</slot>
		</div>
	</Slidy>
</div>

<style lang="scss">
	.wrapper {
	}
	.item {
	}
</style>

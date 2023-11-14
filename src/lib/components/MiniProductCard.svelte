<script>
	import { invalidateAll } from '$app/navigation';

	export let product;
</script>

<a href="/products/{product.id}" on:click={invalidateAll}>
	<img
		class="w-[256px] h-[280px] rounded-[6px] bg-no-repeat object-cover"
		src={product.featured_image}
		alt="Wine"
	/>
	<div
		class="flex flex-col justify-between
	 bg-primary rounded-[6px] h-[88px] p-[16px] mt-[8px]"
	>
		<div class="t1 uppercase">{product.handle}</div>
		<div class="button self-end">VIEW</div>
	</div>
</a>

<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
</script>

<Header />
<div class="flex justify-center">
	<div class="lg:w-[1120px] md:w-[680px] w-[358px]">
		<slot />
	</div>
</div>

<script>
	import '../app.css';
	import Header from './Header.svelte';
</script>

<div class="flex justify-center">
	<div class="lg:w-[1120px] md:w-[680px] w-[358px]">
		<Header />
		<slot />
	</div>
</div>

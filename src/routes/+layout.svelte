<script>
	import '../app.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
</script>

<div class="flex flex-col items-center">
	<div class="min-h-[90vh] lg:w-[1120px] md:w-[680px] w-[358px]">
		<Header />
		<slot />
	</div>
	<Footer />
</div>

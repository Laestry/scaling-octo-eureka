<script>
	import '../app.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
</script>

<div class="flex flex-col items-center">
	<div class="lg:w-[1120px] md:w-[680px] w-[358px]">
		<Header />
		<slot />
	</div>
	<Footer />
</div>

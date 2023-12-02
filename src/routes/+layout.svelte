<script lang="ts">
	import '../app.css';
	import { cartStore } from '$lib/store';
	import Footer from '$lib/components/Footer.svelte';

	export let data;

	cartStore.set(data.cart);
</script>

<slot />
<Footer />

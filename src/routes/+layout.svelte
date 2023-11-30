<script lang="ts">
	import '../app.css';
	import { cartStore } from '$lib/store';

	export let data;

	cartStore.set(data.cart);
</script>

<slot />

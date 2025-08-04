<script lang="ts">
    import { onMount } from 'svelte';
    import { cart } from '$lib/cart';

    onMount(() => {
        cart.clear();
    });
</script>

<h1>TODO</h1>
entering this page clears the cart

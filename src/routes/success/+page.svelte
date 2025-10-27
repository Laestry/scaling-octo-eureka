<script lang="ts">
    import { onMount } from 'svelte';
    import { cart } from '$lib/cart';

    onMount(() => {
        // cart.clear();
    });
</script>

<div class="flex flex-col items-center">
    <div class="min-h-[90vh] lg:w-[1136px] md:w-[680px] w-[358px]">
        <h1>TODO</h1>
        entering this page clears the cart
    </div>
</div>

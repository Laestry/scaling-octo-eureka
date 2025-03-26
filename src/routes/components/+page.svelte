<script>
    import SimpleBar from '@woden/svelte-simplebar';

    let numbers = Array.from({ length: 50 }, (_, i) => i + 1);
</script>

<!-- Bind the container element to the scrollContainer variable -->
<SimpleBar style="height: 200px; max-width: 500px">
    {#each numbers as num}
        <p>{num}</p>
    {/each}
</SimpleBar>

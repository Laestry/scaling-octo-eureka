<script lang="ts">
    import Header from '$lib/components/Header.svelte';
</script>

<div class="flex flex-col items-center">
    <div class="min-h-[90vh] lg:w-[1136px] md:w-[680px] w-[358px]">
        <Header />
        <slot />
    </div>
</div>

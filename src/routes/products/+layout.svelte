<script lang="ts">
    import Header from '$lib/components/Header.svelte';
</script>

<div class="flex flex-col items-center">
    <div class="min-h-[90vh] lg:max-w-[1200px] md:max-w-[824px] max-w-[364px] px-8 w-full">
        <Header />
        <slot />
    </div>
</div>

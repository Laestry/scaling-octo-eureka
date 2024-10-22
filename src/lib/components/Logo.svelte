<script lang="ts">
    import { IconLogo } from '$lib/icons';

    export let color = '#ffffff';
    export let height = 120;
</script>

<div
    class="flex justify-center items-center {$$props.class}"
    style="height: {height}px; width: {height}px; color: {color};"
>
    <IconLogo></IconLogo>
</div>

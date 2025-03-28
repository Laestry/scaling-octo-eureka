<script lang="ts">
    import { IconLogo } from '$lib/icons';

    export let color = '#ffffff';
</script>

<div class="flex justify-center items-center {$$props.class}" style="color: {color};">
    <IconLogo />
</div>

<script lang="ts">
    import IconHeartFilled from '$lib/icons/heart_filled.svg';
    import IconHeart from '$lib/icons/heart.svg';
    import { fade } from 'svelte/transition';

    export let selected = false;
</script>

<button
    class="h-[24px] w-[24px] flex items-center justify-center"
    on:click|stopPropagation={() => (selected = !selected)}
>
    {#if selected}
        <img class="absolute" transition:fade src={IconHeartFilled} alt="favorite selected" />
    {:else}
        <img class="absolute" transition:fade src={IconHeart} alt="favorite unselected" />
    {/if}
</button>

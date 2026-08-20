<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import WardLogo from './WardLogo.svelte';

    const dispatch = createEventDispatcher<{ accept: void; quit: void }>();

    let panel: HTMLDivElement;

    onMount(() => {
        panel?.focus();
    });
</script>

<div class="overlay" role="presentation">
    <div
        class="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-dialog-title"
        tabindex="-1"
        bind:this={panel}
    >
        <div id="age-dialog-title" class="logo-wrap">
            <WardLogo />
        </div>

        <div class="actions">
            <button class="action" on:click={() => dispatch('accept')}>
                J'ai plus de 18 ans
            </button>
            <button class="action" on:click={() => dispatch('quit')}>Quitter</button>
        </div>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 100;
    }

    .panel {
        position: relative;
        width: 100%;
        max-width: 380px;
        background-color: #ffffff;
        padding: 4px 0 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        text-align: center;
        outline: none;
    }

    .logo-wrap {
        margin-bottom: 8px;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .action {
        width: 90%;
        margin: 0 auto;
        height: 38px;
        background-color: #f15a38;
        color: #ffffff;
        border: none;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.15s;
        cursor: pointer;
    }

    .action:hover {
        background-color: #d94a2b;
    }
</style>

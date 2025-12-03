<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let message: string = '';
    export let visible: boolean = false;
    export let lang: 'fr' | 'en' = 'fr';
    
    const dispatch = createEventDispatcher();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    $: if (visible && message) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            close();
        }, 5000);
    }
    
    function close() {
        visible = false;
        message = '';
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        dispatch('close');
    }
</script>

{#if visible && message}
    <div class="error-notification" role="alert">
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{message}</div>
            <button class="error-close" on:click={close} aria-label="Close">×</button>
        </div>
    </div>
{/if}

<style>
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-content {
        background-color: #F44336;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
    
    .error-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
    }
    
    .error-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        font-family: 'Riposte', sans-serif;
    }
    
    .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .error-close:hover {
        opacity: 1;
    }
    
    .error-close:focus {
        outline: 2px solid white;
        outline-offset: 2px;
    }
</style>


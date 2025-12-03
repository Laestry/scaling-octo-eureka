<script lang="ts">
    import { onMount } from 'svelte';

    let mouseX = 0;
    let mouseY = 0;
    let isVisible = false;

    function isElementClickable(element: Element | null): boolean {
        if (!element) return false;
        
        // Elements explicitly marked with cursor-blue-dot class
        if (element.classList?.contains('cursor-blue-dot')) return true;
        if (element.closest('.cursor-blue-dot')) return true;
        
        // Button elements
        if (element.tagName === 'BUTTON') return true;
        if (element.closest('button')) return true;
        
        // Links with href
        if (element.tagName === 'A' && element.getAttribute('href')) return true;
        if (element.closest('a[href]')) return true;
        
        // Elements with click handlers
        if (element.hasAttribute?.('data-clickable')) return true;
        if (element.closest('[data-clickable]')) return true;
        
        // abutton class elements
        if (element.classList?.contains('abutton')) return true;
        if (element.closest('.abutton')) return true;
        
        // Input buttons
        if (element.tagName === 'INPUT') {
            const input = element as HTMLInputElement;
            if (['button', 'submit'].includes(input.type)) return true;
        }
        
        // Role button
        if (element.getAttribute('role') === 'button') return true;
        if (element.closest('[role="button"]')) return true;
        
        return false;
    }

    onMount(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Use elementsFromPoint for more accurate element detection
            // This gets all elements at the cursor position, not just the target
            const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
            
            // Check each element from top to bottom (most specific first)
            let clickable = false;
            for (const element of elementsAtPoint) {
                if (isElementClickable(element)) {
                    clickable = true;
                    break;
                }
            }

            isVisible = clickable;
        };

        // Use capture phase to catch events earlier
        document.addEventListener('mousemove', handleMouseMove, true);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove, true);
        };
    });
</script>

{#if isVisible}
    <div class="blue-dot-cursor" style="left: {mouseX}px; top: {mouseY}px;"></div>
{/if}

<style>
    .blue-dot-cursor {
        position: fixed;
        width: 12px;
        height: 12px;
        background: #3777bc;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99990;
        transform: translate(-50%, -50%);
    }
</style>

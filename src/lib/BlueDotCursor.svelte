<script>
	import { onMount } from 'svelte';

	let mouseX = 0;
	let mouseY = 0;
	let isVisible = false;

	onMount(() => {
		const handleMouseMove = (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			
			// Show blue dot for all clickable elements
			const target = e.target;
			const isClickable = 
				// Elements explicitly marked with cursor-blue-dot class
				target?.classList?.contains('cursor-blue-dot') || 
				target?.closest('.cursor-blue-dot') ||
				// Button elements
				target?.tagName === 'BUTTON' ||
				target?.closest('button') ||
				// Links with href
				(target?.tagName === 'A' && target?.getAttribute('href')) ||
				target?.closest('a[href]') ||
				// Elements with click handlers
				target?.hasAttribute?.('data-clickable') ||
				target?.closest('[data-clickable]') ||
				// abutton class elements
				target?.classList?.contains('abutton') ||
				target?.closest('.abutton') ||
				// Input buttons
				(target?.tagName === 'INPUT' && ['button', 'submit'].includes(target?.type)) ||
				// Role button
				target?.getAttribute('role') === 'button' ||
				target?.closest('[role="button"]');
				
			isVisible = !!isClickable;
		};

		document.addEventListener('mousemove', handleMouseMove);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
		};
	});
</script>

{#if isVisible}
	<div
		class="blue-dot-cursor"
		style="left: {mouseX}px; top: {mouseY}px;"
	></div>
{/if}

<style>
	.blue-dot-cursor {
		position: fixed;
		width: 12px;
		height: 12px;
		background: #3777bc;
		border-radius: 50%;
		pointer-events: none;
		z-index: 9999;
		transform: translate(-50%, -50%);
	}
</style>
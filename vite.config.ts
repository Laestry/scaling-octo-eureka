import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import unplugin_icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		unplugin_icons({
			compiler: 'svelte',
			scale: 1,
			defaultClass: 'icon'
		})
	],
	server: {
		port: 3173,
		strictPort: false
	}
});

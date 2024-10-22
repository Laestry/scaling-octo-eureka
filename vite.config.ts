import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import unplugin_icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

export default defineConfig({
    plugins: [
        sveltekit(),
        unplugin_icons({
            compiler: 'svelte',
            scale: 1,
            defaultClass: 'icon',
            customCollections: {
                local: FileSystemIconLoader('./src/lib/icons')
            }
        })
    ],
    resolve: {
        alias: {
            $icons: '~icons'
        }
    },
    server: {
        port: 3173,
        strictPort: false
    }
});

import adapter from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: sveltePreprocess(),
    kit: {
        // Pinned to adapter-vercel rather than adapter-auto. adapter-auto resolved an old
        // adapter-vercel at build time whose runtime detection only knew Node 18/20, so moving
        // the build to Node 24 broke it. Setting `runtime` explicitly also means the serverless
        // runtime no longer silently follows whatever Node version the build happens to use.
        adapter: adapter({
            runtime: 'nodejs24.x'
        })
    }
};

export default config;

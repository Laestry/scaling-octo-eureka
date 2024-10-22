/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/svelte" />

declare global {
    namespace App {
        interface Error {}
        interface Locals {}
        interface PageData {}
        interface Platform {}
    }
    module '$icons/*' {
        import all from '~icons/*';
        export = all;
    }
}

export {};

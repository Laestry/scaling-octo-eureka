import PocketBase, { type AuthModel } from 'pocketbase';

declare global {
    namespace App {
        interface Error {}
        interface Locals {}
        interface PageData {}
        interface Platform {}
        interface Locals {
            pb: PocketBase;
            pbAdmin: PocketBase;
            isTest: boolean;
            user: AuthModel | undefined;
        }
    }
    module '$icons/*' {
        import all from '~icons/*';
        export = all;
    }
}

export {};

<!--Carousel.svelte-->
<script lang="ts" context="module">
    export type Item = {
        src: string;
        id?: string | number;
        width?: number;
        height?: number;
        alt?: string;
    };
    export const default_options: Partial<SlidyOptions> = {
        loop: true,
        snap: 'center'
    };
</script>

<script lang="ts" generics="T extends Item">
    import '@slidy/svelte/dist/slidy.css';
    import { Slidy, type SlidyOptions } from '@slidy/svelte';

    interface $$Slots {
        default: {
            item: T;
        };
    }

    export let slides: T[] = [];
    let options: Omit<Partial<SlidyOptions>, 'index' | 'slides'> = { loop: true, align: 'end' };
    export let current = 0;
</script>

<Slidy
    {...default_options}
    {...options}
    bind:index={current}
    counter={false}
    arrows={false}
    slides={slides.map((x, i) => ({ ...x, id: x.id ?? i }))}
    let:item
>
    <slot {item}>
        <img class="self-start" {...item} />
    </slot>
</Slidy>

<style lang="scss">
    :global(.slidy .slidy-slide) {
        gap: 0 !important;
        align-items: flex-start !important;
        justify-content: flex-start;
    }
    :global(.slidy) {
        gap: 0 !important;
    }
</style>

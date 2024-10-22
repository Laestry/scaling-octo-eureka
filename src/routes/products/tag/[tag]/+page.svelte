<script lang="ts">
    import MainPage from '../../../+page.svelte';
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<MainPage {data}></MainPage>

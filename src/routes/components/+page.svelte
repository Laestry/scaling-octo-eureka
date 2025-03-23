<script>
    import Input from '$lib/components/Input.svelte';
    import Select from '$lib/components/Select.svelte';
    import { onMount } from 'svelte';

    let options;

    onMount(async () => {
        const res = await fetch('/saqBranches.json');
        options = await res.json();
        options = options.map((x) => ({ value: x.id, label: x.text }));
        console.log(options);
    });

    const items = Array.from({ length: 500 }).map((_, i) => `item ${i}`);
</script>

<Input placeholder="Prenom" />

<Select {options} placeholder="Choisir votre SAQ" />

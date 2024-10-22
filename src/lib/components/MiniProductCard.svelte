<script lang="ts">
    export let title: string;
    export let image: string;
    export let id: string;
</script>

<div class="w-[256px]">
    <a href="/products/{id}">
        <img class="w-full h-[280px] rounded-[6px] bg-no-repeat object-cover" src={image} alt="Wine" />
        <div class="flex flex-col justify-between bg-primary rounded-[6px] h-[88px] p-[16px] mt-[8px]">
            <div class="t1 uppercase">{title}</div>
            <div class="button self-end">VIEW</div>
        </div>
    </a>
</div>

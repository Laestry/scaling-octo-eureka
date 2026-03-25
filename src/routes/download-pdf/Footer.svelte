<script>
    import WardAssociesLogo from '$lib/icons/WardAssociesLogo.svelte';

    function formatDateTime(date = new Date()) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        const hh = date.getHours().toString().padStart(2, '0');
        const mm = date.getMinutes().toString().padStart(2, '0');
        return `${d}/${m} / ${y} — ${hh}:${mm}`;
    }
</script>

<div class="flex justify-between {$$props.class}">
    <div class="h-[49.0px] w-[522.0px]" style="height: 49px; width: 522px">
        <WardAssociesLogo
            width="522px"
            height="49px"
            fillColor="var(--WARD-BLACK, #181C1C)"
            shadowColor="rgba(0, 0, 0, 0.20)"
        />
    </div>

    <div class="self-end">
        <div class="address">1217 Saint-Zotique Est, Montréal, Qc. H2S 1N6 <br />info@wardetassocies.com</div>
        <div class="date mt-[16.07px]">
            {formatDateTime()}
        </div>
    </div>
</div>

<style>
    .address {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 4.48px; /* 14 → 4.48 */
        line-height: 100%;
        letter-spacing: 0%;
    }

    .date {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 7.68px; /* 24 → 7.68 */
        line-height: 100%;
        letter-spacing: 0%;
    }
</style>

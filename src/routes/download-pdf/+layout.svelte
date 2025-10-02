<!--src/routes/download-pdf/+layout.svelte-->
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

    async function handleGetPDF() {
        const { default: html2pdf } = await import('html2pdf.js/dist/html2pdf.bundle.min.js');
        const el = document.querySelector('.sheet');

        // ensure top-left origin
        window.scrollTo(0, 0);
        document.documentElement.style.margin = '0';
        document.body.style.margin = '0';

        if (document.fonts?.ready) await document.fonts.ready;

        const opt = {
            filename: 'page.pdf',
            margin: 0,
            image: { type: 'jpeg', quality: 1 }, // was png
            html2canvas: {
                scale: 5, // was 3–4
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 816,
                windowHeight: 1056
            },
            jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait', compress: true } // enable compression
        };

        await html2pdf()
            .set(opt)
            .from(el)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                if (pdf.getNumberOfPages() > 1) pdf.deletePage(1);
            })
            .save();
    }
</script>

<button on:click={handleGetPDF} class="text-black underline !cursor-pointer">Download as PDF</button>

<div class="min-h-screen w-full bg-gray-100 print:bg-white overflow-x-scroll">
    <div class="sheet flex flex-col justify-between">
        <slot />
        <div class="flex justify-between">
            <div class="h-[49.0px] w-[522.0px]">
                <WardAssociesLogo fillColor="var(--WARD-BLACK, #181C1C)" shadowColor="rgba(0, 0, 0, 0.20)" />
            </div>

            <div class="self-end">
                <div class="address">1217 Saint-Zotique Est, Montréal, Qc. H2S 1N6 <br />info@wardetassocies.com</div>
                <div class="date mt-[16.07px]">
                    {formatDateTime()}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .sheet {
        transform-origin: 0 0;
        height: 1056px; /* 3300 → 1056 */
        width: 816px; /* 2550 → 816  */
        background: #fff;
        padding: 48px 27.2px 46.72px 48px; /* 150 85 146 150 */
        box-shadow: 0 3.2px 9.6px rgba(0, 0, 0, 0.12); /* 0 10 30 */
    }

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

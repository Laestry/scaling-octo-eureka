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
            margin: 0, // html2pdf margin
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: 0,
                scrollX: 0,
                windowWidth: 816,
                windowHeight: 1056
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compress: true },
            pagebreak: { mode: ['avoid-all', 'css'] } // drop 'legacy'
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

<button on:click={handleGetPDF}>test</button>

<div class="min-h-screen w-full bg-gray-100 print:bg-white overflow-x-scroll">
    <div class="sheet flex flex-col justify-between">
        <slot />
        <div class="flex justify-between">
            <div class="h-[153px] w-[1632px]">
                <WardAssociesLogo fillColor="var(--WARD-BLACK, #181C1C)" shadowColor="rgba(0, 0, 0, 0.20)" />
            </div>

            <div class="self-end">
                <div class="address">1217 Saint-Zotique Est, Montréal, Qc. H2S 1N6 <br />info@wardetassocies.com</div>
                <div class="date mt-[50px]">
                    {formatDateTime()}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .sheet {
        transform-origin: 0 0;
        height: 3300px;
        width: 2550px;
        background: #fff;
        padding: 150px 85px 146px 150px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }

    .address {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 14px;
        leading-trim: NONE;
        line-height: 100%;
        letter-spacing: 0%;
    }

    .date {
        font-family: Riposte;
        font-weight: 400;
        font-style: Regular;
        font-size: 24px;
        leading-trim: NONE;
        line-height: 100%;
        letter-spacing: 0%;
    }
</style>

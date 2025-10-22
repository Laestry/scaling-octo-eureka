export async function handleGetPDF(fileName) {
    const { default: html2pdf } = await import('html2pdf.js/dist/html2pdf.bundle.min.js');
    const el = document.querySelector('#pdf');

    // ensure top-left origin
    window.scrollTo(0, 0);
    document.documentElement.style.margin = '0';
    document.body.style.margin = '0';

    if (document.fonts?.ready) await document.fonts.ready;

    const opt = {
        filename: fileName + '.pdf',
        margin: 0,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
            scale: 4.5,
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
        },
        jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' } // enable compression
    };

    await waitForImages(el);
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

async function waitForImages(el) {
    const imgs = el.querySelectorAll('img');
    await Promise.all(
        [...imgs].map((img) =>
            img.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                      img.onload = img.onerror = resolve;
                  })
        )
    );
}

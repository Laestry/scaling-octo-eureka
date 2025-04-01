<script lang="ts">
    import { generatePDFFromId } from '$lib/listToPdf/pdfTest';
    import { exampleData } from '$lib/listToPdf/exampleData';
    import PDFList from '$lib/listToPdf/PDFList.svelte';
    import { pb } from '$lib/pocketbase';

    export let data;
    const tokens = data.tokens;

    let currentPage = 1;
    let totalPages = 1;
    let allProcessedProducts = exampleData;
    let loading = false;
    let error = null;
    let processing = false;
    let cancelRequested = false;
    let abortController: AbortController;
    let uploadingFiles = false;

    // Function to fetch a single page from the API endpoint with cancellation support
    async function fetchPage(page: number) {
        loading = true;
        // Create a new AbortController for this fetch
        abortController = new AbortController();
        try {
            const res = await fetch(`/api/getProductsFromPortaus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortController.signal,
                body: JSON.stringify({
                    tokens,
                    page
                })
            });
            const responseData = await res.json();
            totalPages = responseData.totalPages;
            // Append the processed products from the current page to the aggregate array
            allProcessedProducts = [...allProcessedProducts, ...responseData.processedProducts];
            console.log('Processed products so far:', allProcessedProducts);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                error = err;
                console.error('Error fetching page', page, err);
            }
        } finally {
            loading = false;
        }
    }

    // Function to sequentially fetch all pages and update progress
    async function fetchAllPages() {
        // Reset state for a new run
        processing = true;
        cancelRequested = false;
        currentPage = 1;
        allProcessedProducts = [];
        error = null;

        // Fetch the first page
        await fetchPage(currentPage);
        // Fetch remaining pages if any
        while (currentPage < totalPages && !cancelRequested) {
            currentPage++;
            await fetchPage(currentPage);
        }
        processing = false;

        handleDownloadAndUpload();
    }

    // Function to cancel processing
    function cancelProcessing() {
        cancelRequested = true;
        if (abortController) {
            abortController.abort();
        }
    }

    /**
     * Generates the PDF from a given element and uploads it to PocketBase.
     * Adjust the collection name, record ID, and field name as needed.
     */
    export async function handleDownloadAndUpload(): Promise<void> {
        uploadingFiles = true;
        try {
            // Generate the PDF as a Blob.
            const pdfBlobPrixResto = await generatePDFFromId('prixResto', 'productsResto.pdf');
            const pdfBlobPrixPerso = await generatePDFFromId('prixPerso', 'productsPerso.pdf');

            // Create a File instance from the Blob.
            const pdfFileResto = new File([pdfBlobPrixResto], 'productsResto.pdf', { type: 'application/pdf' });
            const pdfFilePerso = new File([pdfBlobPrixPerso], 'productsPerso.pdf', { type: 'application/pdf' });

            // Upload the file to PocketBase.
            // Adjust 'pdf' (collection), '93ej7tuns0916g5' (record ID), and 'file' (field name) as needed.
            const updatedRecord = await pb
                .collection('pdf')
                .update('93ej7tuns0916g5', { prix_resto: pdfFileResto, prix_perso: pdfFilePerso });
            console.log('PDF uploaded successfully:', updatedRecord);
        } catch (err) {
            console.error('Error generating or uploading PDF:', err);
        }
        uploadingFiles = false;
    }
</script>

<div>
    <h3>Product Processing Progress</h3>
    <!-- Start Processing Button -->
    <button on:click={fetchAllPages} disabled={processing}>
        {processing ? 'Processing...' : 'Start Processing'}
    </button>
    <!-- Cancel Button: only visible during processing -->
    {#if processing}
        <button on:click={cancelProcessing}> Cancel </button>
    {/if}
    <p>Completed Steps: {currentPage} / {totalPages}</p>
    {#if error}
        <p>Error: {error.message}</p>
    {/if}

    <h4>Processed Products</h4>
    <ul>
        amount processed: {allProcessedProducts.length}
    </ul>
</div>

This is to create the pdf, it will upload automatically, just ignore it:
<button on:click={handleDownloadAndUpload}>Download PDF</button>

<!--<div class="w-[1136px]" style="position: absolute; left: -10000px;">-->
<div>uploading docs: {uploadingFiles}</div>
<div class="w-[1136px]">
    <PDFList products={allProcessedProducts} prixResto id="prixResto" />
    <PDFList products={allProcessedProducts} id="prixPerso" />
    <!--    <ProductList id="pdfContent" products={allProcessedProducts} isPDF={true} />-->
</div>

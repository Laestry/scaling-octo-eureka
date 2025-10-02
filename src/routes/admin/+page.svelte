<script lang="ts">
    import { generatePDFFromId } from '$lib/listToPdf/pdfTest';
    import { exampleData } from '$lib/listToPdf/exampleData';
    import PDFList from '$lib/listToPdf/PDFList.svelte';
    import { pb } from '$lib/pocketbase';
    import Accordion from '$lib/components/Accordion.svelte';

    export let data;
    const tokens = data.tokens;

    let currentPage = 1;
    let totalPages = 1;
    let allProcessedProducts = exampleData;
    let loading = false;
    let error = null;
    let processing = false;
    let cancelRequestedProducts = false;
    let abortControllerProducts: AbortController;
    let uploadingFiles = false;

    // Function to fetch a single page from the API endpoint with cancellation support
    async function fetchProduct(page: number) {
        loading = true;
        // Create a new AbortController for this fetch
        abortControllerProducts = new AbortController();
        try {
            const res = await fetch(`/api/getProductsFromPortaus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerProducts.signal,
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
    async function fetchAllProducts() {
        // Reset state for a new run
        processing = true;
        cancelRequestedProducts = false;
        currentPage = 1;
        allProcessedProducts = [];
        error = null;

        // Fetch the first page
        await fetchProduct(currentPage);
        // Fetch remaining pages if any
        while (currentPage < totalPages && !cancelRequestedProducts) {
            currentPage++;
            await fetchProduct(currentPage);
        }
        processing = false;

        handleDownloadAndUpload();
    }

    // Function to cancel processing
    function cancelProcessing() {
        cancelRequestedProducts = true;
        if (abortControllerProducts) {
            abortControllerProducts.abort();
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
            const pdfBlobPrixResto = await generatePDFFromId('prixResto', 'productsResto.download-pdf');
            const pdfBlobPrixPerso = await generatePDFFromId('prixPerso', 'productsPerso.download-pdf');

            // Create a File instance from the Blob.
            const pdfFileResto = new File([pdfBlobPrixResto], 'productsResto.download-pdf', {
                type: 'application/download-pdf'
            });
            const pdfFilePerso = new File([pdfBlobPrixPerso], 'productsPerso.download-pdf', {
                type: 'application/download-pdf'
            });

            // Upload the file to PocketBase.
            // Adjust 'download-pdf' (collection), '93ej7tuns0916g5' (record ID), and 'file' (field name) as needed.
            const updatedRecord = await pb
                .collection('pdf')
                .update('93ej7tuns0916g5', { prix_resto: pdfFileResto, prix_perso: pdfFilePerso });
            console.log('PDF uploaded successfully:', updatedRecord);
        } catch (err) {
            console.error('Error generating or uploading PDF:', err);
        }
        uploadingFiles = false;
    }

    let currentClientPage = 1;
    let totalClientPages = 1;
    let allProcessedClients = [];
    let loadingClients = false;
    let errorClients = null;
    let processingClients = false;
    let cancelRequestedClients = false;
    let abortControllerClients: AbortController;

    async function fetchClients(page: number) {
        loadingClients = true;
        abortControllerClients = new AbortController();
        try {
            const res = await fetch(`/api/getIndividualClients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerClients.signal,
                body: JSON.stringify({
                    tokens,
                    page
                })
            });
            const responseData = await res.json();
            totalClientPages = responseData.totalPages;
            // Append the processed clients from the current page to the aggregate array
            allProcessedClients = [...allProcessedClients, ...responseData.processedCustomers];
            console.log('Processed clients so far:', allProcessedClients);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                errorClients = err;
                console.error('Error fetching clients page', page, err);
            }
        } finally {
            loadingClients = false;
        }
    }

    // Function to sequentially fetch all pages of individual clients and update progress
    async function fetchAllClients() {
        processingClients = true;
        cancelRequestedClients = false;
        currentClientPage = 1;
        allProcessedClients = [];
        errorClients = null;

        // Fetch the first page
        await fetchClients(currentClientPage);
        // Fetch remaining pages if any
        while (currentClientPage < totalClientPages && !cancelRequestedClients) {
            currentClientPage++;
            await fetchClients(currentClientPage);
        }
        processingClients = false;
    }

    // Function to cancel processing of individual clients
    function cancelProcessingClients() {
        cancelRequestedClients = true;
        if (abortControllerClients) {
            abortControllerClients.abort();
        }
    }
</script>

<div class="w-[1136px] mx-auto flex flex-col gap-3">
    <Accordion title="Get Products">
        <div class="flex flex-col gap-2">
            <div class="text-lg">Step 1 getting products from Portaus</div>
            <button on:click={fetchAllProducts} disabled={processing}>
                {processing ? 'Processing...' : 'Start Processing'}
            </button>
            {#if processing}
                <p>Completed Steps: {currentPage} / {totalPages}</p>
                <button on:click={cancelProcessing}> Cancel</button>
                <div class="text-lg">Processed Products</div>
                <ul>
                    amount processed: {allProcessedProducts.length}
                </ul>
            {/if}
            {#if error}
                <p>Error: {error.message}</p>
            {/if}

            <div class="text-lg">Step 2 after getting products, the PDF is generated</div>
            <div>uploading PDFs: {uploadingFiles}</div>
            <button on:click={handleDownloadAndUpload}>Download PDF</button>
        </div>
    </Accordion>

    <Accordion title="Get Individual Clients">
        <div class="flex flex-col gap-2">
            <div class="text-lg">Getting individual clients from Portaus</div>
            <button on:click={fetchAllClients} disabled={processingClients}>
                {processingClients ? 'Processing...' : 'Start Processing'}
            </button>
            {#if processingClients}
                <p>Completed Steps: {currentClientPage} / {totalClientPages}</p>
                <button on:click={cancelProcessingClients}>Cancel</button>
                <div class="text-lg">Processed Clients</div>
                <ul>
                    amount processed: {allProcessedClients.length}
                </ul>
            {/if}
            {#if errorClients}
                <p>Error: {errorClients.message}</p>
            {/if}
        </div>
    </Accordion>
</div>

<div class="w-[1136px]" style="position: absolute; left: -2000px;">
    <PDFList products={allProcessedProducts} prixResto id="prixResto" />
    <PDFList products={allProcessedProducts} id="prixPerso" />
</div>

<style>
    button {
        border-radius: 12px;
        background: rgba(45, 99, 176, 0.5);
        width: 176px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f6f1f2;
        text-align: center;
        font-size: 16px;
        @media (max-width: 1136px) {
            font-size: 12px;
        }
    }
</style>

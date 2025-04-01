import { jsPDF } from 'jspdf';
import PocketBase from 'pocketbase';

/**
 * Converts a remote font file (from URL) into a base64 string.
 * Cleans any extraneous whitespace/newlines.
 *
 * @param url - The URL of the font file.
 * @returns A Promise resolving to the base64 string (without the data URL prefix).
 */
async function fetchFontAsBase64(url: string): Promise<string> {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) {
        throw new Error(`Failed to fetch font from ${url}`);
    }
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            console.log('Fetched font dataUrl (first 50 chars):', dataUrl.slice(0, 50));
            // Remove the data URL prefix and all whitespace/newlines.
            const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1).replace(/\s/g, '');
            console.log('Cleaned base64 string length:', base64.length);
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Loads a font from a URL and registers it with jsPDF.
 *
 * @param doc - The jsPDF document instance.
 * @param url - The URL to fetch the font file from.
 * @param fileName - The file name to register (e.g. "Riposte-Bold.otf").
 * @param fontName - The font family name to use (e.g. "Riposte").
 * @param fontStyle - The font style (e.g. "bold" or "normal").
 */
async function loadFontFromUrl(
    doc: jsPDF,
    url: string,
    fileName: string,
    fontName: string,
    fontStyle: string
): Promise<void> {
    const base64Font = await fetchFontAsBase64(url);
    // Add the font file to jsPDF's Virtual File System.
    doc.addFileToVFS(fileName, base64Font);
    // Register the font with jsPDF.
    doc.addFont(fileName, fontName, fontStyle);
}

/**
 * Generates a PDF from a DOM element by its ID.
 * Loads custom Riposte fonts directly from URLs.
 * Waits for document.fonts.ready before rendering.
 *
 * Instead of saving the PDF, this function returns the generated PDF as a Blob.
 *
 * @param elementId - The ID of the element to convert to PDF.
 * @param pdfFilename - The file name for the PDF (used only for naming purposes).
 * @returns A Promise resolving to the PDF Blob.
 */
export async function generatePDFFromId(elementId: string, pdfFilename: string = 'output.pdf'): Promise<Blob> {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        throw new Error(`Element with id "${elementId}" not found.`);
    }

    // Define PDF dimensions in pixels.
    const pdfWidth = 1136;
    const margin = 0;

    // Force the element's width to our target content width.
    element.style.width = `${pdfWidth + margin * 2}px`;
    // Allow overflow so that all content is visible.
    element.style.overflow = 'visible';

    // Wait briefly for layout updates.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Measure the full height of the element.
    const contentHeight = element.scrollHeight + 50;

    // Create a jsPDF document with dynamic height to fit all content.
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [pdfWidth, contentHeight + margin * 2]
    });

    // Load custom Riposte fonts from URL.
    await loadFontFromUrl(doc, '/fonts/Riposte-Regular.ttf', 'Riposte-Regular.otf', 'Riposte', 'normal');
    await loadFontFromUrl(doc, '/fonts/Riposte-Bold.ttf', 'Riposte-Bold.otf', 'Riposte', 'bold');
    // Set default font (using the normal style).
    doc.setFont('Riposte', 'normal');

    // Wait for all fonts to be fully loaded.
    await document.fonts.ready;
    console.log('Fonts are ready, generating PDF...');

    // Use jsPDF's html method to generate the PDF.
    const pdfBlob = await new Promise<Blob>((resolve, reject) => {
        doc.html(element, {
            callback: (doc: jsPDF) => {
                // Instead of saving the file, output the PDF as a Blob.
                const blob = doc.output('blob');
                resolve(blob);
            },
            x: margin,
            y: margin,
            width: pdfWidth - margin * 2,
            html2canvas: {
                scale: 1,
                useCORS: true,
                scrollY: 0,
                windowWidth: element.offsetWidth
            }
        });
    });

    return pdfBlob;
}

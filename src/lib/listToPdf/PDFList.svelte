<script lang="ts">
    import type { AlcoholProduct } from '$lib/models/pocketbase';

    export let products;
    export let prixResto = false;

    // Compute region for a given product.
    function getRegion(product: any): string {
        const r = product.originRegion?.trim() || '';
        const c = product.originCountry?.trim() || '';
        if (r && c) return `${r}, ${c}`;
        if (r) return r;
        if (c) return c;
        return '-';
    }

    function priceFormatPDF({ pricing, uvc }: AlcoholProduct, bottle: boolean = true) {
        let price = prixResto ? pricing.price : pricing.priceTaxIn;

        if (bottle) {
            return `${(price / uvc).toFixed(2)} $ / B`;
        } else {
            return `${price.toFixed(2)} $ / C`;
        }
    }
</script>

<!-- Container to be rendered (e.g. for PDF generation) -->
<div id="pdfContent">
    <table>
        <thead>
            <tr>
                <th class="w-region">Region</th>
                <th class="w-vigneron">Vigneron</th>
                <th class="w-vin">Vin</th>
                <th class="w-mil">Mil.</th>
                <th class="w-type">Type</th>
                <th class="w-format">Format</th>
                <th class="w-price">$ Perso</th>
            </tr>
        </thead>
        <tbody>
            {#each products as product}
                <tr class="productRow" style="border-top: 1px #D1D2D2 solid">
                    <td>{getRegion(product)}</td>
                    <td>{product.providerName || '-'}</td>
                    <td class="truncate">{product.name || '-'}</td>
                    <td>{product.vintage || '-'}</td>
                    <td class="capitalize">{product.specificCategory || '-'}</td>
                    <td>{product.uvc} x {product.lblFormat}</td>
                    <td class="text-right pr-5">
                        {priceFormatPDF(product, true)}
                        <br />
                        <span class="text-gray">
                            {priceFormatPDF(product, false)}
                        </span>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
    /* Include your Riposte font definitions */
    @font-face {
        font-family: 'Riposte';
        src: url('/fonts/Riposte-Regular.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }
    @font-face {
        font-family: 'Riposte';
        src: url('/fonts/Riposte-Bold.otf') format('opentype');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
    }

    /* Container styling */
    #pdfContent {
        width: 1136px;
        background: white;
        margin: 0 auto;
    }

    /* Table styling */
    table {
        width: 100%;
        table-layout: fixed;
    }

    th {
        height: 48px;
        color: #000;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 100%; /* 12px */
        padding: 16px 0;
        text-align: left;
    }

    td {
        height: 48px;
        color: #000;
        font-size: 16px;
        font-style: normal;
        padding: 16px 0;
        font-weight: 400;
        line-height: 100%; /* 16px */
    }

    /* Fixed widths for each column */
    .w-region {
        width: 191px;
    }
    .w-vigneron {
        width: 193px;
    }
    .w-vin {
        width: 289px;
    }
    .w-mil {
        width: 94px;
    }
    .w-type {
        width: 98px;
    }
    .w-format {
        width: 96px;
    }
    .w-price {
        width: 175px;
        text-align: right;
        padding-right: 5px;
        font-family: 'Riposte', serif;
    }
    .w-extra {
        width: 40px;
    }

    /* Utility classes */
    .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .capitalize {
        text-transform: capitalize;
    }
    .pr-5 {
        padding-right: 5px;
    }
    .text-right {
        text-align: right;
    }
    .text-gray {
        color: #949494;
    }
</style>

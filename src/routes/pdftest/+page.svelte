<script lang="ts">
    // Define your HTML string with inline CSS. Notice the table has width: 100%.
    import { generatePDFFromHTML } from '$lib/listToPdf/pdfTest';

    const htmlString = `
    <style>
      body { font-family: Arial, sans-serif; }
      h1 { color: #4a90e2; text-align: center; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #333;
        padding: 8px;
        text-align: center;
      }
    </style>
    <div id="content">
      <h1>My PDF Content</h1>
      <table>
        <thead>
          <tr>
            <th>Label</th>
            <th>Random Number</th>
          </tr>
        </thead>
        <tbody>
          ${[...Array(5)]
              .map(
                  (_, i) => `
              <tr>
                <td>Row ${i + 1}</td>
                <td>${Math.floor(Math.random() * 100)}</td>
              </tr>
            `
              )
              .join('')}
        </tbody>
      </table>
    </div>
  `;

    function handleDownload() {
        generatePDFFromHTML(htmlString, 'table.pdf').catch((err) => {
            console.error('Error generating PDF:', err);
        });
    }
</script>

<button on:click={handleDownload}>Download PDF</button>

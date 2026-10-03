// The downloadable wine list (/download-pdf/liste-des-vins), drawn directly with jsPDF.
//
// It used to be an HTML page that html2pdf screenshotted in a new tab, which showed the whole
// table before downloading and could come out blank. This draws the same layout as real text:
// the "W&" mark on top, the table view's columns, the wordmark, address and date at the bottom.
// Text stays sharp and searchable, the file is small, and nothing renders on screen.

import { GState, jsPDF } from 'jspdf';
import { MARK, WORDMARK } from './logos';

export type WineListRow = {
    region: string;
    producer: string;
    name: string;
    vintage: string;
    type: string;
    format: string;
    /** price per bottle, agency fee included, in the requested mode */
    bottle: number;
    /** price per case; null for single-bottle formats, as on the site */
    case: number | null;
};

export type WineListOptions = {
    rows: WineListRow[];
    mode: 'resto' | 'perso';
    generatedAt: Date;
    /** true when the visitor had filters applied, so the header can say so */
    filtered: boolean;
    /** Riposte TTF files, base64 (see loadFonts in the route) */
    fonts: { regular: string; bold: string };
};

// US Letter in points, with the margins of the former HTML sheet (36/48/46 px at 0.75 pt/px).
const PAGE = { width: 612, height: 792 };
const MARGIN = { top: 27, right: 36, bottom: 34.5, left: 36 };
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;

// Same proportions as the table view's columns (151/193/289/94/98/96/175 px).
const COLUMN_PX = [151, 193, 289, 94, 98, 96, 175];
const COLUMNS = COLUMN_PX.map((px) => (px / COLUMN_PX.reduce((a, b) => a + b, 0)) * CONTENT_WIDTH);
const HEADERS = ['Région', 'Vigneron', 'Vin', 'Mil.', 'Type', 'Format'];

const INK = '#181C1C';
const MUTED = '#949494';
const RULE = '#D1D2D2'; // the table's #181C1C33 border, flattened onto white

const HEADER_ROW = 22;
const BODY_ROW = 26;
const CELL_PAD = 4;
const FOOTER_HEIGHT = 36.75;
const FOOTER_GAP = 14;

const money = (v: number) => `${v.toFixed(2)} $`;

function registerFonts(doc: jsPDF, fonts: WineListOptions['fonts']) {
    doc.addFileToVFS('Riposte-Regular.ttf', fonts.regular);
    doc.addFont('Riposte-Regular.ttf', 'Riposte', 'normal');
    doc.addFileToVFS('Riposte-Bold.ttf', fonts.bold);
    doc.addFont('Riposte-Bold.ttf', 'Riposte', 'bold');
}

/**
 * Fills an SVG path at (x, y) scaled by `scale`. The logos only use absolute M/L/C/H/V/Z
 * (see logos.ts), which map one to one onto jsPDF's path operators.
 */
function drawSvgPath(doc: jsPDF, d: string, x: number, y: number, scale: number) {
    const tokens = d.match(/[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
    const X = (v: number) => x + v * scale;
    const Y = (v: number) => y + v * scale;
    let i = 0;
    let cmd = '';
    let cx = 0;
    let cy = 0;
    const num = () => Number(tokens[i++]);
    while (i < tokens.length) {
        if (/[A-Za-z]/.test(tokens[i]!)) cmd = tokens[i++]!.toUpperCase();
        switch (cmd) {
            case 'M':
                cx = num();
                cy = num();
                doc.moveTo(X(cx), Y(cy));
                cmd = 'L'; // further pairs after M are line-tos
                break;
            case 'L':
                cx = num();
                cy = num();
                doc.lineTo(X(cx), Y(cy));
                break;
            case 'H':
                cx = num();
                doc.lineTo(X(cx), Y(cy));
                break;
            case 'V':
                cy = num();
                doc.lineTo(X(cx), Y(cy));
                break;
            case 'C': {
                const [x1, y1, x2, y2] = [num(), num(), num(), num()];
                cx = num();
                cy = num();
                doc.curveTo(X(x1), Y(y1), X(x2), Y(y2), X(cx), Y(cy));
                break;
            }
            case 'Z':
                doc.close();
                break;
            default:
                throw new Error(`Unsupported SVG path command ${cmd}`);
        }
    }
    doc.fill();
}

/** Text cut to `width` with an ellipsis, at the current font and size. */
function fit(doc: jsPDF, text: string, width: number): string {
    if (doc.getTextWidth(text) <= width) return text;
    let cut = text;
    while (cut.length > 1 && doc.getTextWidth(cut + '…') > width) cut = cut.slice(0, -1);
    return cut.trimEnd() + '…';
}

function drawHeader(doc: jsPDF, opts: WineListOptions): number {
    // The mark has some air on its left, hence the nudge (the HTML version used -13px).
    const markWidth = 52.5;
    const scale = markWidth / MARK.width;
    doc.setFillColor(INK);
    for (const d of MARK.paths) drawSvgPath(doc, d, MARGIN.left - 9.75, MARGIN.top, scale);

    const right = PAGE.width - MARGIN.right;
    const date = opts.generatedAt.toLocaleDateString('fr-CA', {
        timeZone: 'America/Toronto',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    doc.setTextColor(INK);
    doc.setFont('Riposte', 'bold');
    doc.setFontSize(11);
    doc.text('Liste des vins', right, MARGIN.top + 14, { align: 'right' });
    doc.setFont('Riposte', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED);
    const subtitle = [`Prix ${opts.mode}`, opts.filtered ? 'sélection filtrée' : null, date]
        .filter(Boolean)
        .join(' · ');
    doc.text(subtitle, right, MARGIN.top + 25, { align: 'right' });

    return MARGIN.top + MARK.height * scale + 17;
}

function drawTableHeader(doc: jsPDF, top: number, mode: WineListOptions['mode']) {
    doc.setFont('Riposte', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(INK);
    const baseline = top + HEADER_ROW / 2 + 2.5;
    let x = MARGIN.left;
    HEADERS.forEach((label, i) => {
        doc.text(label, x, baseline);
        x += COLUMNS[i]!;
    });
    doc.text(`$ ${mode === 'resto' ? 'Resto' : 'Perso'}`, PAGE.width - MARGIN.right, baseline, { align: 'right' });
    doc.setDrawColor(RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN.left, top + HEADER_ROW, PAGE.width - MARGIN.right, top + HEADER_ROW);
    return top + HEADER_ROW;
}

function drawRow(doc: jsPDF, row: WineListRow, top: number) {
    doc.setFont('Riposte', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(INK);
    const cells = [row.region, row.producer, row.name, row.vintage, row.type, row.format];
    const singleLine = top + BODY_ROW / 2 + 2.8;
    let x = MARGIN.left;
    cells.forEach((value, i) => {
        doc.text(fit(doc, value || '-', COLUMNS[i]! - CELL_PAD), x, singleLine);
        x += COLUMNS[i]!;
    });

    // Bottle price on top, case price under it in grey, right-aligned like the table view.
    const right = PAGE.width - MARGIN.right;
    if (row.case == null) {
        doc.text(`${money(row.bottle)} / B`, right, singleLine, { align: 'right' });
    } else {
        doc.text(`${money(row.bottle)} / B`, right, top + BODY_ROW / 2 - 1.2, { align: 'right' });
        doc.setTextColor(MUTED);
        doc.text(`${money(row.case)} / C`, right, top + BODY_ROW / 2 + 7.4, { align: 'right' });
    }

    doc.setDrawColor(RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN.left, top + BODY_ROW, PAGE.width - MARGIN.right, top + BODY_ROW);
}

function drawFooter(doc: jsPDF, opts: WineListOptions, page: number, pages: number) {
    const top = PAGE.height - MARGIN.bottom - FOOTER_HEIGHT;
    const scale = FOOTER_HEIGHT / WORDMARK.height;

    // Wordmark with its soft shadow layer, as on the HTML footer (rgba(0,0,0,0.2)).
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: 0.2 }));
    doc.setFillColor('#000000');
    for (const p of WORDMARK.paths) if (p.layer === 'shadow') drawSvgPath(doc, p.d, MARGIN.left, top, scale);
    doc.restoreGraphicsState();
    doc.setFillColor(INK);
    for (const p of WORDMARK.paths) if (p.layer === 'ink') drawSvgPath(doc, p.d, MARGIN.left, top, scale);

    const right = PAGE.width - MARGIN.right;
    const bottom = PAGE.height - MARGIN.bottom;
    // Same stamp as the former HTML footer, "dd/mm / yy — hh:mm", in Montréal time.
    const part = (type: string) =>
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Toronto',
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        })
            .formatToParts(opts.generatedAt)
            .find((p) => p.type === type)?.value ?? '';
    const stamp = `${part('day')}/${part('month')} / ${part('year')} — ${part('hour')}:${part('minute')}`;
    doc.setFont('Riposte', 'normal');
    doc.setTextColor(INK);
    doc.setFontSize(6);
    doc.text('1217 Saint-Zotique Est, Montréal, Qc. H2S 1N6', right, bottom - 22, { align: 'right' });
    doc.text('info@wardetassocies.com', right, bottom - 15, { align: 'right' });
    doc.setFontSize(7.5);
    doc.text(`${stamp}  ·  ${page} / ${pages}`, right, bottom, { align: 'right' });
}

/** Builds the wine list; returns the PDF bytes. */
export function buildWineListPdf(opts: WineListOptions): ArrayBuffer {
    const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait', compress: true });
    registerFonts(doc, opts.fonts);
    doc.setProperties({
        title: `Ward & Associés — liste des vins (prix ${opts.mode})`,
        author: 'Ward & Associés',
        creator: 'wardetassocies.com'
    });

    const tableBottom = PAGE.height - MARGIN.bottom - FOOTER_HEIGHT - FOOTER_GAP;

    // Paginate first so every footer can say "page / pages".
    const firstTop = MARGIN.top + MARK.height * (52.5 / MARK.width) + 17 + HEADER_ROW;
    const perPage = Math.max(1, Math.floor((tableBottom - firstTop) / BODY_ROW));
    const chunks: WineListRow[][] = [];
    for (let i = 0; i < opts.rows.length; i += perPage) chunks.push(opts.rows.slice(i, i + perPage));
    if (!chunks.length) chunks.push([]);

    chunks.forEach((rows, index) => {
        if (index > 0) doc.addPage();
        let y = drawTableHeader(doc, drawHeader(doc, opts), opts.mode);
        if (!rows.length) {
            doc.setFont('Riposte', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(MUTED);
            doc.text('Aucun vin disponible ne correspond à cette sélection.', MARGIN.left, y + 24);
        }
        for (const row of rows) {
            drawRow(doc, row, y);
            y += BODY_ROW;
        }
        drawFooter(doc, opts, index + 1, chunks.length);
    });

    return doc.output('arraybuffer');
}

// lib/utils/exportPayments.ts

import { PaymentListItem } from '../types/payments';

// ============================================================
// BRAND — keep in sync with globals.css
// ============================================================

const BRAND = {
  primary:     [26, 115, 232]  as [number, number, number], // #1A73E8
  secondary:   [251, 188, 4]   as [number, number, number], // #FBBC04
  tertiary:    [52, 168, 83]   as [number, number, number], // #34A853
  error:       [234, 67, 53]   as [number, number, number], // #EA4335
  neutralDark: [32, 33, 36]    as [number, number, number], // #202124
  neutralGray: [95, 99, 104]   as [number, number, number], // #5F6368
  lightGray:   [248, 249, 250] as [number, number, number], // #F8F9FA
  border:      [232, 234, 237] as [number, number, number], // #E8EAED
  white:       [255, 255, 255] as [number, number, number],
} as const;

// ============================================================
// ASSETS
// ============================================================

const LOGO_SRC = '/logo.png';

const PLATFORM_LOGOS: Record<string, { label: string; src: string }> = {
  google_meet: { label: 'Google Meet', src: '/platforms/google-meet.png' },
  zoom:        { label: 'Zoom',        src: '/platforms/zoom.png' },
  teams:       { label: 'Microsoft Teams', src: '/platforms/teams.webp' },
  webex:       { label: 'Webex',       src: '/platforms/webex.png' },
};

// ============================================================
// COLUMNS — canonical set (CSV / Excel / JSON)
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
  get: (p: PaymentListItem) => string | number;
}

export const PAYMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'id',                   label: 'Payment ID',      get: (p) => p.id },
  { key: 'order_id',             label: 'Order ID',        get: (p) => p.order_id },
  { key: 'registration_number',  label: 'Reg #',           get: (p) => p.registration_number || '—' },
  { key: 'attendee_name',        label: 'Name',            get: (p) => p.attendee_name || '—' },
  { key: 'attendee_email',       label: 'Email',           get: (p) => p.attendee_email || '—' },
  { key: 'attendee_phone',       label: 'Phone',           get: (p) => p.attendee_phone || '—' },
  { key: 'event_title',          label: 'Event',           get: (p) => p.event_title || '—' },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (p) => (p.event_start_date ? formatShortDate(p.event_start_date) : '—'),
  },
  { key: 'amount',               label: 'Amount',          get: (p) => formatMinor(p.amount) },
  { key: 'currency',             label: 'Currency',        get: (p) => p.currency },
  { key: 'platform_fee',         label: 'Platform Fee',    get: (p) => formatMinor(p.platform_fee) },
  { key: 'processing_fee',       label: 'Processing Fee',  get: (p) => formatMinor(p.processing_fee) },
  { key: 'net_to_organizer',     label: 'Net to Organizer', get: (p) => formatMinor(p.net_to_organizer) },
  { key: 'status_label',         label: 'Status',          get: (p) => p.status_label || p.status },
  { key: 'method_label',         label: 'Method',          get: (p) => p.method_label || p.method },
  { key: 'provider',             label: 'Provider',        get: (p) => p.provider },
  { key: 'transaction_id',       label: 'Transaction ID',  get: (p) => p.transaction_id || '—' },
  {
    key: 'created_at',
    label: 'Created At',
    get: (p) => (p.created_at ? formatShortDate(p.created_at) : '—'),
  },
  {
    key: 'completed_at',
    label: 'Completed At',
    get: (p) => (p.completed_at ? formatShortDate(p.completed_at) : '—'),
  },
];

// ============================================================
// COLUMNS — human set (PDF only)
// ============================================================

export const PDF_COLUMNS: ExportColumn[] = [
  { key: 'attendee_name',       label: 'Name',       get: (p) => p.attendee_name || '—' },
  { key: 'attendee_email',      label: 'Email',      get: (p) => p.attendee_email || '—' },
  { key: 'event_title',         label: 'Event',      get: (p) => p.event_title || '—' },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (p) => (p.event_start_date ? formatShortDate(p.event_start_date) : '—'),
  },
  { key: 'status_label',        label: 'Status',     get: (p) => p.status_label || p.status },
  { key: 'method_label',        label: 'Method',     get: (p) => p.method_label || p.method },
  { key: 'amount',              label: 'Amount',     get: (p) => formatMinor(p.amount) },
  { key: 'platform_fee',        label: 'Platform',   get: (p) => formatMinor(p.platform_fee) },
  { key: 'processing_fee',      label: 'Processing', get: (p) => formatMinor(p.processing_fee) },
  { key: 'net_to_organizer',    label: 'Net',        get: (p) => formatMinor(p.net_to_organizer) },
  {
    key: 'created_at',
    label: 'Date',
    get: (p) => (p.created_at ? formatShortDate(p.created_at) : '—'),
  },
];

// ============================================================
// UTILITIES
// ============================================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayPretty(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Oct 3, 26" — compact date for the PDF table. */
function formatShortDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

/**
 * Formats a minor-unit amount (e.g. 92000) as a decimal string
 * (e.g. "920.00"). Used in CSV/Excel/JSON and the PDF data columns so
 * downstream tooling sees numbers with two decimal places.
 */
function formatMinor(minor: number | undefined): string {
  if (minor === undefined || minor === null) return '0.00';
  return (minor / 100).toFixed(2);
}

/**
 * Formats a minor-unit amount as a currency string (e.g. "KES 920.00").
 * Used only in the PDF totals block, where the currency must be
 * explicit. Uses toLocaleString rather than Intl.NumberFormat with
 * style:'currency' because jsPDF's default Helvetica font does not
 * always render currency symbols like "KSh" correctly.
 */
function formatMinorAsCurrency(minor: number, currency: string): string {
  const amount = (minor ?? 0) / 100;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

async function loadImageDataUrl(
  src: string,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const res = await fetch(src, { cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const dims = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = dataUrl;
      },
    );

    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

// ============================================================
// TOTALS
// ============================================================

interface PaymentTotals {
  gross: string;
  platformFee: string;
  processingFee: string;
  net: string;
  counted: number;
  skipped: number;
}

/**
 * Sums the four headline numbers for the PDF totals block.
 *
 * Only `succeeded` and `refunded` payments count toward the totals —
 * they're the only statuses that ever moved money. Pending, failed,
 * and expired rows are excluded and reported separately as `skipped`.
 *
 * Currency is inferred from the first successful row. If the report
 * contains mixed currencies (which shouldn't happen under the current
 * model), the totals will be wrong; that's a known limitation until
 * multi-currency settlement is in scope.
 */
function computeTotals(rows: PaymentListItem[]): PaymentTotals {
  const counted: PaymentListItem[] = [];
  let skipped = 0;

  for (const r of rows) {
    const s = (r.status ?? '').toLowerCase();
    if (s === 'succeeded' || s === 'refunded') counted.push(r);
    else skipped++;
  }

  let grossMinor = 0;
  let platformMinor = 0;
  let processingMinor = 0;
  let netMinor = 0;

  for (const r of counted) {
    grossMinor += r.amount ?? 0;
    platformMinor += r.platform_fee ?? 0;
    processingMinor += r.processing_fee ?? 0;
    netMinor += r.net_to_organizer ?? 0;
  }

  const currency = counted[0]?.currency ?? 'KES';

  return {
    gross: formatMinorAsCurrency(grossMinor, currency),
    platformFee: formatMinorAsCurrency(platformMinor, currency),
    processingFee: formatMinorAsCurrency(processingMinor, currency),
    net: formatMinorAsCurrency(netMinor, currency),
    counted: counted.length,
    skipped,
  };
}

// ============================================================
// CSV
// ============================================================

export function exportPaymentsToCSV(
  rows: PaymentListItem[],
  filename = `payments-${todayStamp()}.csv`,
) {
  const headers = PAYMENT_EXPORT_COLUMNS.map((c) => c.label);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      PAYMENT_EXPORT_COLUMNS.map((c) => escape(c.get(r))).join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

// ============================================================
// JSON
// ============================================================

export function exportPaymentsToJSON(
  rows: PaymentListItem[],
  filename = `payments-${todayStamp()}.json`,
) {
  const data = rows.map((r) =>
    Object.fromEntries(PAYMENT_EXPORT_COLUMNS.map((c) => [c.key, c.get(r)])),
  );
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

// ============================================================
// EXCEL
// ============================================================

export async function exportPaymentsToExcel(
  rows: PaymentListItem[],
  filename = `payments-${todayStamp()}.xlsx`,
) {
  const XLSX = await import('xlsx');
  const data = rows.map((r) =>
    Object.fromEntries(PAYMENT_EXPORT_COLUMNS.map((c) => [c.label, c.get(r)])),
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payments');
  XLSX.writeFile(wb, filename);
}

// ============================================================
// PDF
// ============================================================

export interface ExportPaymentsPDFOptions {
  title?: string;
  subtitle?: string;
  hostName?: string;
  platforms?: string[];
  filtersSummary?: string;
  filename?: string;
}

export async function exportPaymentsToPDF(
  rows: PaymentListItem[],
  options: ExportPaymentsPDFOptions = {},
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const title = options.title ?? 'Payments';
  const subtitle = options.subtitle ?? '';
  const hostName = options.hostName ?? '';
  const platforms = options.platforms ?? [];
  const filtersSummary = options.filtersSummary ?? '';
  const filename = options.filename ?? `payments-${todayStamp()}.pdf`;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;

  const headerHeight = 130;

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setFillColor(...BRAND.secondary);
  doc.rect(0, 2, pageWidth, 1, 'F');

  // ------------------------------------------------------------
  // LOGO
  // ------------------------------------------------------------
  const logo = await loadImageDataUrl(LOGO_SRC);
  let textLeft = margin;

  if (logo) {
    const targetH = 56;
    const aspect = logo.width / logo.height;
    const targetW = Math.min(280, targetH * aspect);
    const logoY = 26;
    doc.addImage(
      logo.dataUrl,
      'PNG',
      margin,
      logoY,
      targetW,
      targetH,
      undefined,
      'FAST',
    );
    textLeft = margin + targetW + 24;
  }

  // ------------------------------------------------------------
  // TITLE
  // ------------------------------------------------------------
  doc.setTextColor(...BRAND.neutralDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(title, textLeft, 52);

  // ------------------------------------------------------------
  // HOST
  // ------------------------------------------------------------
  let metaY = 72;
  if (hostName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.neutralGray);
    doc.text(`Hosted by ${hostName}`, textLeft, metaY);
    metaY += 18;
  }

  // ------------------------------------------------------------
  // PLATFORM BADGES
  // ------------------------------------------------------------
  if (platforms.length > 0) {
    const iconH = 12;
    let cursorX = textLeft;
    let rendered = 0;

    for (const platformKey of platforms) {
      const meta = PLATFORM_LOGOS[platformKey];
      if (!meta) continue;

      const icon = await loadImageDataUrl(meta.src);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.neutralGray);

      if (icon) {
        const iconW = iconH * (icon.width / icon.height);
        doc.addImage(
          icon.dataUrl,
          'PNG',
          cursorX,
          metaY - 9,
          iconW,
          iconH,
          undefined,
          'FAST',
        );
        doc.text(meta.label, cursorX + iconW + 5, metaY);
        cursorX += iconW + 5 + doc.getTextWidth(meta.label) + 16;
      } else {
        doc.text(meta.label, cursorX, metaY);
        cursorX += doc.getTextWidth(meta.label) + 16;
      }

      rendered++;
    }

    if (rendered > 0) metaY += 16;
  }

  // ------------------------------------------------------------
  // META
  // ------------------------------------------------------------
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.neutralGray);

  const metaParts: string[] = [];
  if (subtitle) metaParts.push(subtitle);
  metaParts.push(`Generated ${todayPretty()}`);
  metaParts.push(`${rows.length} record${rows.length === 1 ? '' : 's'}`);
  doc.text(metaParts.join('  ·  '), textLeft, metaY);
  metaY += 14;

  // ------------------------------------------------------------
  // FILTERS
  // ------------------------------------------------------------
  if (filtersSummary) {
    doc.setFontSize(9);
    doc.text(filtersSummary, textLeft, metaY);
  }

  // ------------------------------------------------------------
  // TOTALS BLOCK
  // ------------------------------------------------------------
  //
  // Four numbers the reader wants before any row detail:
  //   Gross      — what attendees paid (sum of amounts)
  //   Platform   — Nuruvent's cut
  //   Processing — Paystack's cut, passed through
  //   Net        — what the organizer receives
  //
  // Only succeeded and refunded rows contribute, matching the
  // backend's aggregate. Pending/failed/expired rows never moved
  // money and are excluded.
  const totals = computeTotals(rows);

  const totalsY = metaY + 24;
  const totalsBlockH = 62;
  const innerPad = 16;

  // Panel background
  doc.setFillColor(...BRAND.lightGray);
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(
    margin,
    totalsY - 8,
    pageWidth - margin * 2,
    totalsBlockH,
    4,
    4,
    'FD',
  );

  const colW = (pageWidth - margin * 2 - innerPad * 2) / 4;
  const labelY = totalsY + 6;
  const valueY = totalsY + 30;

  // Column 0 — Gross
  let colX = margin + innerPad;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('GROSS REVENUE', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.neutralDark);
  doc.text(totals.gross, colX, valueY);

  // Column 1 — Platform fee
  colX += colW;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('PLATFORM FEE', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BRAND.secondary[0], BRAND.secondary[1], BRAND.secondary[2]);
  doc.text(totals.platformFee, colX, valueY);

  // Column 2 — Processing fee
  colX += colW;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('PROCESSING', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text(totals.processingFee, colX, valueY);

  // Column 3 — Net to organizer
  colX += colW;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('YOU RECEIVE', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BRAND.tertiary[0], BRAND.tertiary[1], BRAND.tertiary[2]);
  doc.text(totals.net, colX, valueY);

  // Caption under the panel
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text(
    `${totals.counted} successful payment${totals.counted === 1 ? '' : 's'} included in totals · ${totals.skipped} excluded (pending, failed, or expired)`,
    margin + innerPad,
    totalsY + totalsBlockH + 4,
  );

  // Table starts below the caption.
  const tableStartY = totalsY + totalsBlockH + 16;

  // Divider under header
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.5);
  doc.line(margin, headerHeight - 8, pageWidth - margin, headerHeight - 8);

  // ------------------------------------------------------------
  // TABLE
  // ------------------------------------------------------------
  const head = [PDF_COLUMNS.map((c) => c.label)];
  const body = rows.map((r) => PDF_COLUMNS.map((c) => String(c.get(r) ?? '')));

  autoTable(doc, {
    head,
    body,
    startY: tableStartY,
    margin: {
      left: margin,
      right: margin,
      top: tableStartY,
      bottom: 50,
    },
    tableWidth: 'auto',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
      textColor: BRAND.neutralDark,
      lineColor: BRAND.border,
      lineWidth: 0.5,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      valign: 'middle',
    },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: BRAND.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      overflow: 'linebreak',
    },
    alternateRowStyles: { fillColor: BRAND.lightGray },
    bodyStyles: { lineColor: BRAND.border, lineWidth: 0.5 },
    columnStyles: {
      0:  { cellWidth: 90, overflow: 'linebreak' },     // Name
      1:  { cellWidth: 140, overflow: 'linebreak' },    // Email
      2:  { cellWidth: 'auto', overflow: 'linebreak' }, // Event
      3:  { cellWidth: 65, overflow: 'linebreak' },     // Event Date
      4:  { cellWidth: 60, overflow: 'linebreak' },     // Status
      5:  { cellWidth: 60, overflow: 'linebreak' },     // Method
      6:  { cellWidth: 65, overflow: 'linebreak' },     // Amount
      7:  { cellWidth: 60, overflow: 'linebreak' },     // Platform
      8:  { cellWidth: 65, overflow: 'linebreak' },     // Processing
      9:  { cellWidth: 65, overflow: 'linebreak' },     // Net
      10: { cellWidth: 60, overflow: 'linebreak' },     // Date
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const text = String(data.cell.raw ?? '');
      if (text.length > 60) data.cell.styles.fontSize = 8;
      if (text.length > 90) data.cell.styles.fontSize = 7;
    },
  });

  // ------------------------------------------------------------
  // FOOTER on every page
  // ------------------------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.neutralGray);

    doc.text('Nuruvent', margin, pageHeight - 18);
    doc.text(
      'Payment report · Confidential',
      pageWidth / 2,
      pageHeight - 18,
      { align: 'center' },
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 18,
      { align: 'right' },
    );
  }

  doc.save(filename);
}
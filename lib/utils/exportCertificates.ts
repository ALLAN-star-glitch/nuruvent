// lib/utils/exportCertificates.ts

import { Certificate } from '../types/certificates';

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

const LOGO_SRC = '/logo.png';

// ============================================================
// COLUMNS
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
  get: (c: Certificate) => string | number;
}

export const getCertificateExportColumns = (
  fallbackIssuer: string,
): ExportColumn[] => [
  { key: 'id',                label: 'Certificate ID',   get: (c) => c.id },
  { key: 'verification_code', label: 'Verify Code',      get: (c) => c.verification_code },
  { key: 'recipient_name',    label: 'Recipient Name',   get: (c) => c.recipient_name },
  { key: 'recipient_email',   label: 'Recipient Email',  get: (c) => c.recipient_email },
  { key: 'event_title',       label: 'Event/Course',     get: (c) => c.metadata?.context_title || '—' },
  { key: 'issuer_name',       label: 'Issuer',           get: (c) => c.metadata?.issuer_name || fallbackIssuer },
  { key: 'completed_at',      label: 'Completed At',     get: (c) => (c.completed_at ? formatShortDate(c.completed_at) : '—') },
  { key: 'issued_at',         label: 'Issued At',        get: (c) => (c.issued_at ? formatShortDate(c.issued_at) : '—') },
  { key: 'status',            label: 'Status',           get: (c) => c.status },
  { key: 'revocation_reason', label: 'Revoke Reason',    get: (c) => c.revocation_reason || '—' },
  { key: 'pdf_url',           label: 'PDF URL',          get: (c) => c.pdf_url || '—' },
];

export const getPDFColumns = (fallbackIssuer: string): ExportColumn[] => [
  { key: 'recipient_name',    label: 'Name',         get: (c) => c.recipient_name },
  { key: 'recipient_email',   label: 'Email',        get: (c) => c.recipient_email },
  { key: 'event_title',       label: 'Event/Course', get: (c) => c.metadata?.context_title || '—' },
  { key: 'issuer_name',       label: 'Issuer',       get: (c) => c.metadata?.issuer_name || fallbackIssuer },
  { key: 'completed_at',      label: 'Completed',    get: (c) => (c.completed_at ? formatShortDate(c.completed_at) : '—') },
  { key: 'issued_at',         label: 'Issued',       get: (c) => (c.issued_at ? formatShortDate(c.issued_at) : '—') },
  { key: 'status',            label: 'Status',       get: (c) => c.status },
  { key: 'verification_code', label: 'Verify Code',  get: (c) => c.verification_code },
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

interface CertificateTotals {
  total: number;
  active: number;
  revoked: number;
}

function computeTotals(rows: Certificate[]): CertificateTotals {
  let active = 0;
  let revoked = 0;

  for (const r of rows) {
    if (r.status === 'active') active++;
    else if (r.status === 'revoked') revoked++;
  }

  return { total: rows.length, active, revoked };
}

// ============================================================
// CSV
// ============================================================

export function exportCertificatesToCSV(
  rows: Certificate[],
  fallbackIssuer: string,
  filename = `certificates-${todayStamp()}.csv`,
) {
  const columns = getCertificateExportColumns(fallbackIssuer);
  const headers = columns.map((c) => c.label);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      columns.map((c) => escape(c.get(r))).join(','),
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

export function exportCertificatesToJSON(
  rows: Certificate[],
  fallbackIssuer: string,
  filename = `certificates-${todayStamp()}.json`,
) {
  const columns = getCertificateExportColumns(fallbackIssuer);
  const data = rows.map((r) =>
    Object.fromEntries(columns.map((c) => [c.key, c.get(r)])),
  );
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

// ============================================================
// EXCEL
// ============================================================

export async function exportCertificatesToExcel(
  rows: Certificate[],
  fallbackIssuer: string,
  filename = `certificates-${todayStamp()}.xlsx`,
) {
  const XLSX = await import('xlsx');
  const columns = getCertificateExportColumns(fallbackIssuer);
  const data = rows.map((r) =>
    Object.fromEntries(columns.map((c) => [c.label, c.get(r)])),
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Certificates');
  XLSX.writeFile(wb, filename);
}

// ============================================================
// PDF
// ============================================================

export interface ExportCertificatesPDFOptions {
  title?: string;
  subtitle?: string;
  hostName?: string;
  filtersSummary?: string;
  filename?: string;
}

export async function exportCertificatesToPDF(
  rows: Certificate[],
  options: ExportCertificatesPDFOptions = {},
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const title = options.title ?? 'Certificates';
  const subtitle = options.subtitle ?? '';
  const hostName = options.hostName ?? 'Organizer';
  const filtersSummary = options.filtersSummary ?? '';
  const filename = options.filename ?? `certificates-${todayStamp()}.pdf`;

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
    doc.text(`Issued by ${hostName}`, textLeft, metaY);
    metaY += 18;
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
  const totals = computeTotals(rows);

  const totalsY = metaY + 24;
  const totalsBlockH = 62;
  const innerPad = 16;

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

  const colW = (pageWidth - margin * 2 - innerPad * 2) / 3;
  const labelY = totalsY + 6;
  const valueY = totalsY + 30;

  let colX = margin + innerPad;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('TOTAL ISSUED', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.neutralDark);
  doc.text(String(totals.total), colX, valueY);

  colX += colW;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('ACTIVE', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BRAND.tertiary[0], BRAND.tertiary[1], BRAND.tertiary[2]);
  doc.text(String(totals.active), colX, valueY);

  colX += colW;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.neutralGray);
  doc.text('REVOKED', colX, labelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(BRAND.error[0], BRAND.error[1], BRAND.error[2]);
  doc.text(String(totals.revoked), colX, valueY);

  const tableStartY = totalsY + totalsBlockH + 16;

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.5);
  doc.line(margin, headerHeight - 8, pageWidth - margin, headerHeight - 8);

  // ------------------------------------------------------------
  // TABLE
  // ------------------------------------------------------------
  const columns = getPDFColumns(hostName);
  const head = [columns.map((c) => c.label)];
  const body = rows.map((r) => columns.map((c) => String(c.get(r) ?? '')));

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
      0:  { cellWidth: 110, overflow: 'linebreak' },
      1:  { cellWidth: 140, overflow: 'linebreak' },
      2:  { cellWidth: 'auto', overflow: 'linebreak' },
      3:  { cellWidth: 80, overflow: 'linebreak' },
      4:  { cellWidth: 65, overflow: 'linebreak' },
      5:  { cellWidth: 65, overflow: 'linebreak' },
      6:  { cellWidth: 60, overflow: 'linebreak' },
      7:  { cellWidth: 85, overflow: 'linebreak' },
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
      'Certificate report · Confidential',
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
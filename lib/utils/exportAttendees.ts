// lib/utils/exportAttendees.ts
import type { CrossEventAttendee } from '@/lib/types/attendance';

// ============================================================
// BRAND
// ============================================================

/** Nuruvent brand palette — keep in sync with globals.css. */
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

/**
 * Path to the logo. Adjust to wherever your logo lives in /public.
 * A transparent PNG works best.
 */
const LOGO_SRC = '/logo.png';

// ============================================================
// COLUMNS — full set (CSV / Excel / JSON)
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
  get: (a: CrossEventAttendee) => string | number;
}

export const ATTENDEE_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'display_name', label: 'Name', get: (a) => a.display_name },
  { key: 'email', label: 'Email', get: (a) => a.email || '—' },
  { key: 'phone', label: 'Phone', get: (a) => a.phone || '—' },
  { key: 'event_name', label: 'Event', get: (a) => a.event_name },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (a) => a.event_start_date ?? '',
  },
  { key: 'effective_status', label: 'Status', get: (a) => a.effective_status },
  { key: 'is_host', label: 'Host', get: (a) => (a.is_host ? 'Yes' : 'No') },
  {
    key: 'sessions_attended',
    label: 'Sessions Attended',
    get: (a) => a.sessions_attended,
  },
  {
    key: 'sessions_total',
    label: 'Sessions Total',
    get: (a) => a.sessions_total,
  },
  {
    key: 'total_duration_seconds',
    label: 'Duration (s)',
    get: (a) => a.total_duration_seconds,
  },
  {
    key: 'registered_at',
    label: 'Registered',
    get: (a) => a.registered_at ?? '',
  },
  {
    key: 'last_activity_at',
    label: 'Last Activity',
    get: (a) => a.last_activity_at ?? '',
  },
];

// ============================================================
// COLUMNS — trimmed set (PDF only)
// ============================================================

export const PDF_COLUMNS: ExportColumn[] = [
  { key: 'display_name', label: 'Name', get: (a) => a.display_name },
  { key: 'email', label: 'Email', get: (a) => a.email || '—' },
  { key: 'phone', label: 'Phone', get: (a) => a.phone || '—' },
  { key: 'event_name', label: 'Event', get: (a) => a.event_name },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (a) =>
      a.event_start_date ? formatShortDate(a.event_start_date) : '—',
  },
  { key: 'effective_status', label: 'Status', get: (a) => a.effective_status },
  { key: 'is_host', label: 'Host', get: (a) => (a.is_host ? 'Yes' : '—') },
  {
    key: 'sessions',
    label: 'Sessions',
    get: (a) => `${a.sessions_attended} / ${a.sessions_total}`,
  },
  {
    key: 'duration',
    label: 'Duration',
    get: (a) => formatDurationHuman(a.total_duration_seconds),
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
 * Human-readable duration: "45m", "2h", "2h 15m".
 * Returns "—" for zero, negative, or missing values.
 */
function formatDurationHuman(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

/**
 * Fetches the logo and returns it as a data URL so jsPDF can embed
 * it without needing a server. Returns null on any failure so the
 * PDF still renders without the logo.
 */
async function loadLogoDataUrl(): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const res = await fetch(LOGO_SRC, { cache: 'force-cache' });
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
// CSV
// ============================================================

export function exportToCSV(
  rows: CrossEventAttendee[],
  filename = `attendees-${todayStamp()}.csv`,
) {
  const headers = ATTENDEE_EXPORT_COLUMNS.map((c) => c.label);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      ATTENDEE_EXPORT_COLUMNS.map((c) => escape(c.get(r))).join(','),
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

export function exportToJSON(
  rows: CrossEventAttendee[],
  filename = `attendees-${todayStamp()}.json`,
) {
  const data = rows.map((r) =>
    Object.fromEntries(ATTENDEE_EXPORT_COLUMNS.map((c) => [c.key, c.get(r)])),
  );
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

// ============================================================
// EXCEL
// ============================================================

export async function exportToExcel(
  rows: CrossEventAttendee[],
  filename = `attendees-${todayStamp()}.xlsx`,
) {
  const XLSX = await import('xlsx');
  const data = rows.map((r) =>
    Object.fromEntries(ATTENDEE_EXPORT_COLUMNS.map((c) => [c.label, c.get(r)])),
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendees');
  XLSX.writeFile(wb, filename);
}

// ============================================================
// PDF
// ============================================================

export interface ExportPDFOptions {
  /** Main heading, e.g. "Computer Science Workshop Attendees". */
  title?: string;
  /** Optional sub-heading under the title. */
  subtitle?: string;
  /** Optional host name shown in the header. */
  hostName?: string;
  /** Optional filter summary, e.g. "Status: Registered · Search: anna". */
  filtersSummary?: string;
  /** Output filename (without path). */
  filename?: string;
}

export async function exportToPDF(
  rows: CrossEventAttendee[],
  options: ExportPDFOptions = {},
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const title = options.title ?? 'Attendees';
  const subtitle = options.subtitle ?? '';
  const hostName = options.hostName ?? '';
  const filtersSummary = options.filtersSummary ?? '';
  const filename = options.filename ?? `attendees-${todayStamp()}.pdf`;

  // A4 landscape, points. Narrower margins than before to give the
  // table more horizontal room.
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;

  // ------------------------------------------------------------
  // HEADER — white, minimal. Only thin accent bars use brand color.
  // ------------------------------------------------------------
  const headerHeight = 110;

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setFillColor(...BRAND.secondary);
  doc.rect(0, 2, pageWidth, 1, 'F');

  // ------------------------------------------------------------
  // LOGO — bigger, top-left.
  // ------------------------------------------------------------
  const logo = await loadLogoDataUrl();
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
  // TITLE + META — dark text on white, right of the logo.
  // ------------------------------------------------------------
  doc.setTextColor(...BRAND.neutralDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(title, textLeft, 52);

  let metaY = 72;
  if (hostName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.neutralGray);
    doc.text(`Hosted by ${hostName}`, textLeft, metaY);
    metaY += 16;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.neutralGray);

  const metaParts: string[] = [];
  if (subtitle) metaParts.push(subtitle);
  metaParts.push(`Generated ${todayPretty()}`);
  metaParts.push(`${rows.length} record${rows.length === 1 ? '' : 's'}`);
  doc.text(metaParts.join('  ·  '), textLeft, metaY);
  metaY += 14;

  if (filtersSummary) {
    doc.setFontSize(9);
    doc.text(filtersSummary, textLeft, metaY);
  }

  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.5);
  doc.line(margin, headerHeight - 8, pageWidth - margin, headerHeight - 8);

  // ------------------------------------------------------------
  // TABLE — 9-column trimmed set, auto widths, ellipsize overflow.
  // ------------------------------------------------------------
  const head = [PDF_COLUMNS.map((c) => c.label)];
  const body = rows.map((r) =>
    PDF_COLUMNS.map((c) => String(c.get(r) ?? '')),
  );

  autoTable(doc, {
    head,
    body,
    startY: headerHeight + 8,
    margin: { left: margin, right: margin, top: headerHeight + 8, bottom: 50 },
    tableWidth: 'auto',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
      textColor: BRAND.neutralDark,
      lineColor: BRAND.border,
      lineWidth: 0.5,
      overflow: 'ellipsize',
      valign: 'middle',
    },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: BRAND.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
    },
    alternateRowStyles: {
      fillColor: BRAND.lightGray,
    },
    bodyStyles: {
      lineColor: BRAND.border,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 110 }, // Name
      1: { cellWidth: 'auto' }, // Email
      2: { cellWidth: 85 }, // Phone
      3: { cellWidth: 'auto' }, // Event
      4: { cellWidth: 72 }, // Event Date
      5: { cellWidth: 68 }, // Status
      6: { cellWidth: 40 }, // Host
      7: { cellWidth: 60 }, // Sessions
      8: { cellWidth: 60 }, // Duration
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
      'Attendee report · Confidential',
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
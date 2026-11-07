// lib/utils/exportAttendees.ts
import type { CrossEventAttendee } from '@/lib/types/attendance';

// ============================================================
// BRAND
// ============================================================

const BRAND = {
  primary:     [26, 115, 232]  as [number, number, number],
  secondary:   [251, 188, 4]   as [number, number, number],
  tertiary:    [52, 168, 83]   as [number, number, number],
  error:       [234, 67, 53]   as [number, number, number],
  neutralDark: [32, 33, 36]    as [number, number, number],
  neutralGray: [95, 99, 104]   as [number, number, number],
  lightGray:   [248, 249, 250] as [number, number, number],
  border:      [232, 234, 237] as [number, number, number],
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
// UTILITIES
// ============================================================

/** Maps raw backend statuses to user-friendly labels. */
function statusLabel(status: string | undefined): string {
  if (!status) return 'Unknown';
  if (status === 'full' || status === 'confirmed') return 'Attended';
  if (status === 'partial' || status === 'joined') return 'Partial';
  if (status === 'no_show') return 'No Show';
  if (status === 'registered') return 'Registered';
  return status;
}

/** 
 * Capitalizes the first letter of every word. 
 * e.g. "carol kim" -> "Carol Kim"
 */
function toTitleCase(name: string | undefined): string {
  if (!name) return '—';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Sanitizes string for filename use. */
function sanitizeFilename(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[\s\u2010-\u2015/\\:]+/g, '-')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'attendees'
  );
}

// ============================================================
// COLUMNS — canonical set (CSV / Excel / JSON)
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
  get: (a: CrossEventAttendee) => string | number;
}

export const ATTENDEE_EXPORT_COLUMNS: ExportColumn[] = [
  // ✅ Apply Title Case to the name
  { key: 'display_name', label: 'Name', get: (a) => toTitleCase(a.display_name) },
  { key: 'email', label: 'Email', get: (a) => a.email || '—' },
  { key: 'phone', label: 'Phone', get: (a) => a.phone || '—' },
  { key: 'event_name', label: 'Event', get: (a) => a.event_name },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (a) => a.event_start_date ?? '',
  },
  {
    key: 'effective_status',
    label: 'Attendance Status',
    get: (a) => statusLabel(a.effective_status),
  },
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
    label: 'Registered At',
    get: (a) => a.registered_at ?? '',
  },
  {
    key: 'last_activity_at',
    label: 'Last Activity',
    get: (a) => a.last_activity_at ?? '',
  },
];

// ============================================================
// COLUMNS — human set (PDF only)
// ============================================================

export const PDF_COLUMNS: ExportColumn[] = [
  // ✅ Apply Title Case to the name here too
  { key: 'display_name', label: 'Name', get: (a) => toTitleCase(a.display_name) },
  { key: 'email', label: 'Email', get: (a) => a.email || '—' },
  { key: 'phone', label: 'Phone', get: (a) => a.phone || '—' },
  { key: 'event_name', label: 'Event', get: (a) => a.event_name },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (a) =>
      a.event_start_date ? formatShortDate(a.event_start_date) : '—',
  },
  {
    key: 'effective_status',
    label: 'Attendance',
    get: (a) => statusLabel(a.effective_status),
  },
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
  {
    key: 'registered_at',
    label: 'Registered',
    get: (a) => (a.registered_at ? formatShortDate(a.registered_at) : '—'),
  },
];

// ============================================================
// UTILITIES (cont.)
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

function formatDurationHuman(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
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
  title?: string;
  subtitle?: string;
  hostName?: string;
  platforms?: string[];
  filtersSummary?: string;
  sessionName?: string;
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
  const platforms = options.platforms ?? [];
  const filtersSummary = options.filtersSummary ?? '';
  const sessionName = options.sessionName ?? '';

  const rawNameParts = [title];
  if (sessionName) rawNameParts.push(sessionName);
  rawNameParts.push(todayStamp());
  const filename = options.filename ?? `${sanitizeFilename(rawNameParts.join(' '))}.pdf`;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;

  const headerHeight = 170;

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 2, 'F');
  doc.setFillColor(...BRAND.secondary);
  doc.rect(0, 2, pageWidth, 1, 'F');

  const logo = await loadImageDataUrl(LOGO_SRC);
  let textLeft = margin;

  if (logo) {
    const targetH = 56;
    const aspect = logo.width / logo.height;
    const targetW = Math.min(280, targetH * aspect);
    const logoY = 26;
    doc.addImage(logo.dataUrl, 'PNG', margin, logoY, targetW, targetH, undefined, 'FAST');
    textLeft = margin + targetW + 24;
  }

  doc.setTextColor(...BRAND.neutralDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(title, textLeft, 52);

  let metaY = 72;
  if (sessionName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...BRAND.primary);
    doc.text(sessionName, textLeft, metaY);
    metaY += 20;
  }

  if (hostName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.neutralGray);
    doc.text(`Hosted by ${hostName}`, textLeft, metaY);
    metaY += 18;
  }

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
        doc.addImage(icon.dataUrl, 'PNG', cursorX, metaY - 9, iconW, iconH, undefined, 'FAST');
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

  const head = [PDF_COLUMNS.map((c) => c.label)];
  const body = rows.map((r) => PDF_COLUMNS.map((c) => String(c.get(r) ?? '')));

  autoTable(doc, {
    head,
    body,
    startY: headerHeight + 8,
    margin: {
      left: margin,
      right: margin,
      top: headerHeight + 8,
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
    alternateRowStyles: {
      fillColor: BRAND.lightGray,
    },
    bodyStyles: {
      lineColor: BRAND.border,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 110, overflow: 'linebreak' },
      1: { cellWidth: 190, overflow: 'linebreak' },
      2: { cellWidth: 80,  overflow: 'linebreak' },
      3: { cellWidth: 'auto', overflow: 'linebreak' },
      4: { cellWidth: 70,  overflow: 'linebreak' },
      5: { cellWidth: 68,  overflow: 'linebreak' },
      6: { cellWidth: 60,  overflow: 'linebreak' },
      7: { cellWidth: 60,  overflow: 'linebreak' },
      8: { cellWidth: 72,  overflow: 'linebreak' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const text = String(data.cell.raw ?? '');
      if (text.length > 60) data.cell.styles.fontSize = 8;
      if (text.length > 90) data.cell.styles.fontSize = 7;
    },
  });

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
// lib/utils/exportRegistrations.ts
import type { CrossEventRegistration } from '@/lib/types/registration';

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

/** Capitalizes first letter of every word. */
function toTitleCase(name: string | undefined): string {
  if (!name) return '—';
  return name
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Sanitizes string for use in filenames. */
function sanitizeFilename(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[\s\u2010-\u2015/\\:]+/g, '-')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'registrations'
  );
}

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

function eventFormat(r: CrossEventRegistration): string {
  if (r.is_hybrid) return 'Hybrid';
  if (r.is_virtual) return 'Virtual';
  return 'In person';
}

function eventLocation(r: CrossEventRegistration): string {
  if (r.is_virtual && !r.is_hybrid) return 'Online';
  if (r.in_person_location) return r.in_person_location;
  const parts = [r.venue_name, r.venue_city, r.venue_country].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
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
// COLUMNS — canonical set (CSV / Excel / JSON)
// ============================================================

export interface ExportColumn {
  key: string;
  label: string;
  get: (r: CrossEventRegistration) => string | number;
}

export const REGISTRATION_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'registration_number', label: 'Reg #',         get: (r) => r.registration_number },
  // ✅ Title case
  { key: 'attendee_name',       label: 'Name',          get: (r) => toTitleCase(r.attendee_name) },
  { key: 'email',               label: 'Email',         get: (r) => r.email || '—' },
  { key: 'phone',               label: 'Phone',         get: (r) => r.phone || '—' },
  { key: 'event_name',          label: 'Event',         get: (r) => r.event_name || '—' },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (r) => (r.event_start_date ? formatShortDate(r.event_start_date) : '—'),
  },
  { key: 'status_label',        label: 'Status',        get: (r) => r.status_label || r.status || '—' },
  { key: 'ticket_name',         label: 'Ticket',        get: (r) => r.ticket_name || '—' },
  { key: 'is_guest',            label: 'Type',          get: (r) => (r.is_guest ? 'Guest' : 'Account') },
  { key: 'format',              label: 'Format',        get: (r) => eventFormat(r) },
  { key: 'location',            label: 'Location',      get: (r) => eventLocation(r) },
  { key: 'created_at',          label: 'Registered At', get: (r) => r.created_at || '' },
];

// ============================================================
// COLUMNS — human set (PDF only)
// ============================================================

export const PDF_COLUMNS: ExportColumn[] = [
  { key: 'registration_number', label: 'Reg #',   get: (r) => r.registration_number },
  // ✅ Title case
  { key: 'attendee_name',       label: 'Name',    get: (r) => toTitleCase(r.attendee_name) },
  { key: 'email',               label: 'Email',   get: (r) => r.email || '—' },
  { key: 'event_name',          label: 'Event',   get: (r) => r.event_name || '—' },
  {
    key: 'event_start_date',
    label: 'Event Date',
    get: (r) => (r.event_start_date ? formatShortDate(r.event_start_date) : '—'),
  },
  { key: 'status_label',        label: 'Status',  get: (r) => r.status_label || r.status || '—' },
  { key: 'ticket_name',         label: 'Ticket',  get: (r) => r.ticket_name || '—' },
  { key: 'format',              label: 'Format',  get: (r) => eventFormat(r) },
  {
    key: 'created_at',
    label: 'Registered',
    get: (r) => (r.created_at ? formatShortDate(r.created_at) : '—'),
  },
];

// ============================================================
// CSV
// ============================================================

export function exportRegistrationsToCSV(
  rows: CrossEventRegistration[],
  filename = `registrations-${todayStamp()}.csv`,
) {
  const headers = REGISTRATION_EXPORT_COLUMNS.map((c) => c.label);
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      REGISTRATION_EXPORT_COLUMNS.map((c) => escape(c.get(r))).join(','),
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

export function exportRegistrationsToJSON(
  rows: CrossEventRegistration[],
  filename = `registrations-${todayStamp()}.json`,
) {
  const data = rows.map((r) =>
    Object.fromEntries(REGISTRATION_EXPORT_COLUMNS.map((c) => [c.key, c.get(r)])),
  );
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

// ============================================================
// EXCEL
// ============================================================

export async function exportRegistrationsToExcel(
  rows: CrossEventRegistration[],
  filename = `registrations-${todayStamp()}.xlsx`,
) {
  const XLSX = await import('xlsx');
  const data = rows.map((r) =>
    Object.fromEntries(REGISTRATION_EXPORT_COLUMNS.map((c) => [c.label, c.get(r)])),
  );
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
  XLSX.writeFile(wb, filename);
}

// ============================================================
// PDF
// ============================================================

export interface ExportRegistrationsPDFOptions {
  title?: string;
  subtitle?: string;
  hostName?: string;
  platforms?: string[];
  filtersSummary?: string;
  filename?: string;
}

export async function exportRegistrationsToPDF(
  rows: CrossEventRegistration[],
  options: ExportRegistrationsPDFOptions = {},
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const title = options.title ?? 'Registrations';
  const subtitle = options.subtitle ?? '';
  const hostName = options.hostName ?? '';
  const platforms = options.platforms ?? [];
  const filtersSummary = options.filtersSummary ?? '';

  // ✅ Sanitized filename fallback
  const rawNameParts = [title];
  if (subtitle) rawNameParts.push(subtitle);
  rawNameParts.push(todayStamp());
  const filename = options.filename ?? `${sanitizeFilename(rawNameParts.join(' '))}.pdf`;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;

  const headerHeight = 130;

  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 2, 'F');
  doc.setFillColor(...BRAND.secondary);
  doc.rect(0, 2, pageWidth, 1, 'F');

  // Logo
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

  // Title
  doc.setTextColor(...BRAND.neutralDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(title, textLeft, 52);

  // Host
  let metaY = 72;
  if (hostName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.neutralGray);
    doc.text(`Hosted by ${hostName}`, textLeft, metaY);
    metaY += 18;
  }

  // Platforms
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

  // Meta line
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

  // Table
  const head = [PDF_COLUMNS.map((c) => c.label)];
  const body = rows.map((r) => PDF_COLUMNS.map((c) => String(c.get(r) ?? '')));

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
      overflow: 'linebreak',
      valign: 'middle',
      cellWidth: 'wrap',
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
      0: { cellWidth: 70,  overflow: 'linebreak' }, // Reg #
      1: { cellWidth: 100, overflow: 'linebreak' }, // Name
      2: { cellWidth: 'auto', overflow: 'linebreak' }, // Email
      3: { cellWidth: 'auto', overflow: 'linebreak' }, // Event
      4: { cellWidth: 72,  overflow: 'linebreak' }, // Event Date
      5: { cellWidth: 68,  overflow: 'linebreak' }, // Status
      6: { cellWidth: 80,  overflow: 'linebreak' }, // Ticket
      7: { cellWidth: 60,  overflow: 'linebreak' }, // Format
      8: { cellWidth: 72,  overflow: 'linebreak' }, // Registered
    },
  });

  // Footer
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
      'Registration report · Confidential',
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
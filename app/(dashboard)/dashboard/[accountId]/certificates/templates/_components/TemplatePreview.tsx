// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplatePreview.tsx

'use client';

import { CertificateTemplateDesign } from '@/lib/types/certificates';
import { QrCode } from 'lucide-react';

interface Props {
  design: CertificateTemplateDesign;
  /** Optional — pass `sm` for the compact card mini-preview. */
  size?: 'sm' | 'md' | 'lg';
}

const SAMPLE = {
  recipient_name: 'Jane Doe',
  context_title: 'Advanced Go Workshop',
  context_date: '15 October 2026',
  context_duration: '2 hours',
  issuer_name: 'Nuruvent',
};

function substitute(text: string | undefined, vars: Record<string, string>) {
  if (!text) return '';
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v),
    text,
  );
}

const SIZES = {
  sm: {
    pad: 'p-3',
    title: 'text-[10px]',
    subtitle: 'text-[7px]',
    name: 'text-sm',
    body: 'text-[7px]',
    sigName: 'text-[7px]',
    sigTitle: 'text-[6px]',
    footer: 'text-[6px]',
    rule: 'w-10 h-px',
    nameRule: 'w-10 h-px',
    logo: 'h-6',
    sig: 'h-5',
    qr: 'h-8 w-8',
    qrIcon: 'h-5 w-5',
    gap: 'gap-1',
    verified: 'text-[6px]',
    watermark: 'text-[7px]',
  },
  md: {
    pad: 'p-6',
    title: 'text-base',
    subtitle: 'text-[11px]',
    name: 'text-2xl',
    body: 'text-[11px]',
    sigName: 'text-[11px]',
    sigTitle: 'text-[9px]',
    footer: 'text-[9px]',
    rule: 'w-24 h-0.5',
    nameRule: 'w-24 h-0.5',
    logo: 'h-10',
    sig: 'h-10',
    qr: 'h-14 w-14',
    qrIcon: 'h-8 w-8',
    gap: 'gap-2',
    verified: 'text-[9px]',
    watermark: 'text-[11px]',
  },
  lg: {
    pad: 'p-8 sm:p-10',
    title: 'text-xl sm:text-2xl',
    subtitle: 'text-xs sm:text-sm',
    name: 'text-2xl sm:text-4xl',
    body: 'text-xs sm:text-sm',
    sigName: 'text-xs sm:text-sm',
    sigTitle: 'text-[10px] sm:text-xs',
    footer: 'text-[10px] sm:text-xs',
    rule: 'w-24 sm:w-32 h-0.5',
    nameRule: 'w-24 sm:w-32 h-0.5',
    logo: 'h-10 sm:h-14',
    sig: 'h-10 sm:h-14',
    qr: 'h-14 sm:h-20 w-14 sm:w-20',
    qrIcon: 'h-8 sm:h-11 w-8 sm:w-11',
    gap: 'gap-2 sm:gap-3',
    verified: 'text-[10px] sm:text-xs',
    watermark: 'text-xs sm:text-sm',
  },
} as const;

export function TemplatePreview({ design, size = 'md' }: Props) {
  const s = SIZES[size];

  const bg = design.background_color ?? '#FFFFFF';
  const text = design.text_color ?? '#1A1A1A';
  const accent = design.accent_color ?? '#0A6EBD';
  const borderColor = design.border_color ?? accent;
  const muted = '#808080';

  const title = substitute(design.title_text, SAMPLE) || 'Certificate of Completion';
  const subtitle = substitute(design.subtitle_text, SAMPLE) || 'This certifies that';
  const body =
    substitute(design.body_text, SAMPLE) ||
    `has successfully completed ${SAMPLE.context_title} on ${SAMPLE.context_date}.`;
  const footer = substitute(design.footer_text, SAMPLE) || 'Verify at nuruvent.com/verify';
  const watermark = substitute(design.watermark_text, SAMPLE);
  const signatoryName = design.signatory_name ?? '';
  const signatoryTitle = design.signatory_title ?? '';

  const hasBorder = design.border_style === 'single' || design.border_style === 'double';
  const isDouble = design.border_style === 'double';

  return (
    <div
      className="relative aspect-[297/210] w-full overflow-hidden rounded-lg shadow-lg"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: design.font_family || 'Georgia',
      }}
    >
      {/* Background image (premium) */}
      {design.background_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${design.background_url})` }}
        />
      )}

      {/* Border frame */}
      {hasBorder && (
        <>
          <div
            className="pointer-events-none absolute inset-2 rounded"
            style={{ border: `1px solid ${borderColor}` }}
          />
          {isDouble && (
            <div
              className="pointer-events-none absolute inset-3 rounded"
              style={{ border: `1px solid ${borderColor}` }}
            />
          )}
        </>
      )}

      {/* Flow content — no justify-center, so nothing overlaps */}
      <div
        className={`relative flex h-full flex-col items-center ${s.gap} ${s.pad}`}
      >
        {/* Logo + seal */}
        {(design.logo_url || design.seal_url) && (
          <div className="absolute inset-x-6 top-4 flex items-start justify-between">
            {design.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={design.logo_url}
                alt="Logo"
                className={`${s.logo} w-auto max-w-[100px] object-contain`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span />
            )}
            {design.seal_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={design.seal_url}
                alt="Seal"
                className={`${s.logo} w-auto max-w-[100px] object-contain`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span />
            )}
          </div>
        )}

        {/* Top spacer — pushes content down from logo */}
        <div className="h-2" />

        {/* Title */}
        <h1
          className={`${s.title} text-center font-bold uppercase tracking-wider`}
          style={{ color: accent }}
        >
          {title}
        </h1>

        {/* Accent rule */}
        <div className={s.rule} style={{ backgroundColor: accent }} />

        {/* Subtitle */}
        <p className={`${s.subtitle} text-center`}>{subtitle}</p>

        {/* Watermark (premium) */}
        {watermark && (
          <p
            className={`${s.watermark} text-center uppercase tracking-widest opacity-60`}
            style={{ color: text }}
          >
            {watermark}
          </p>
        )}

        {/* Recipient name */}
        <p
          className={`${s.name} text-center font-bold leading-tight`}
          style={{ color: accent }}
        >
          {SAMPLE.recipient_name}
        </p>

        {/* Name underline */}
        <div className={s.nameRule} style={{ backgroundColor: accent }} />

        {/* Body */}
        <p className={`${s.body} max-w-[85%] text-center leading-snug`}>
          {body}
        </p>

        {/* Bottom block — pushed to the bottom by mt-auto */}
        <div className="mt-auto w-full flex items-end justify-between pt-2">
          {/* Left: signature */}
          <div className="flex flex-col items-start">
            {design.signature_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={design.signature_url}
                alt="Signature"
                className={`${s.sig} mb-1 w-auto object-contain`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {design.signature_line && (
              <div
                className="mb-1 w-16 sm:w-20 border-t"
                style={{ borderColor: text + '60' }}
              />
            )}
            {signatoryName && (
              <p className={`${s.sigName} font-semibold leading-tight`}>
                {signatoryName}
              </p>
            )}
            {signatoryTitle && (
              <p className={`${s.sigTitle} leading-tight`} style={{ color: muted }}>
                {signatoryTitle}
              </p>
            )}
          </div>

          {/* Right: QR + verified badge */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`${s.qr} flex items-center justify-center rounded bg-white shadow-sm`}
              style={{ border: `1px solid ${accent}30` }}
            >
              <QrCode className={s.qrIcon} style={{ color: accent }} />
            </div>
            {design.verify_badge && (
              <span
                className={`${s.verified} font-bold uppercase tracking-wide`}
                style={{ color: accent }}
              >
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {/* Footer — in flow, not absolute */}
        {footer && (
          <p className={`text-center ${s.footer} pt-1`} style={{ color: muted }}>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
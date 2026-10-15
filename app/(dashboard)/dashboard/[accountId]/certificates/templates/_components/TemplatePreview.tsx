// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplatePreview.tsx

'use client';

import { CertificateTemplateDesign } from '@/lib/types/certificates';
import { Award, QrCode } from 'lucide-react';



interface Props {
  design: CertificateTemplateDesign;
}

const SAMPLE = {
  recipient_name: 'Jane Doe',
  context_title: 'Advanced Go Workshop',
  context_date: '2026-10-15',
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

export function TemplatePreview({ design }: Props) {
  const bg = design.background_color ?? '#FFFFFF';
  const text = design.text_color ?? '#1A1A1A';
  const accent = design.accent_color ?? '#0A6EBD';

  const title = substitute(design.title_text, SAMPLE);
  const subtitle = substitute(design.subtitle_text, SAMPLE);
  const body = substitute(design.body_text, SAMPLE);
  const footer = substitute(design.footer_text, SAMPLE);

  return (
    <div
      className="relative aspect-[297/210] w-full overflow-hidden rounded-lg border-2 shadow-sm"
      style={{
        backgroundColor: bg,
        color: text,
        borderColor: accent + '40',
        fontFamily: design.font_family || 'Georgia',
      }}
    >
      {/* Background image */}
      {design.background_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${design.background_url})` }}
        />
      )}

      <div className="relative flex h-full flex-col items-center justify-center gap-2 p-4 sm:gap-3 sm:p-6">
        {/* Logo + seal row */}
        {(design.logo_url || design.seal_url) && (
          <div className="absolute inset-x-4 top-3 flex items-start justify-between sm:inset-x-6 sm:top-4">
            {design.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={design.logo_url}
                alt="Logo"
                className="h-8 w-auto max-w-[80px] object-contain sm:h-10"
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
                className="h-8 w-auto max-w-[80px] object-contain sm:h-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span />
            )}
          </div>
        )}

        {/* Title */}
        <h1
          className="text-center text-[10px] font-bold uppercase tracking-wide sm:text-xs"
          style={{ color: text }}
        >
          {title || 'Certificate of Completion'}
        </h1>
        <div
          className="h-0.5 w-12 rounded-full sm:w-16"
          style={{ backgroundColor: accent }}
        />

        {/* Subtitle */}
        <p className="text-center text-[8px] sm:text-[10px]">{subtitle}</p>

        {/* Recipient */}
        <p
          className="text-center text-sm font-bold sm:text-base"
          style={{ color: accent }}
        >
          {SAMPLE.recipient_name}
        </p>

        {/* Body */}
        <p className="max-w-[80%] text-center text-[8px] leading-relaxed sm:text-[10px]">
          {body}
        </p>

        {/* Signature + QR */}
        <div className="absolute inset-x-4 bottom-6 flex items-end justify-between sm:inset-x-6 sm:bottom-8">
          <div className="text-left">
            {design.signature_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={design.signature_url}
                alt="Signature"
                className="mb-1 h-6 w-auto object-contain sm:h-8"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {design.signatory_name && (
              <>
                <div
                  className="mb-0.5 h-px w-16"
                  style={{ backgroundColor: text + '40' }}
                />
                <p className="text-[7px] font-medium sm:text-[9px]">
                  {design.signatory_name}
                </p>
                {design.signatory_title && (
                  <p className="text-[6px] opacity-70 sm:text-[8px]">
                    {design.signatory_title}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded bg-white shadow-sm sm:h-12 sm:w-12"
              style={{ border: `1px solid ${accent}30` }}
            >
              <QrCode className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: accent }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <p className="absolute inset-x-4 bottom-1 text-center text-[6px] opacity-60 sm:inset-x-6 sm:bottom-2 sm:text-[7px]">
            {footer}
          </p>
        )}

        {/* Issuer mark */}
        <div className="absolute left-4 top-4 flex items-center gap-1 opacity-50 sm:left-6 sm:top-6">
          <Award className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: accent }} />
          <span
            className="text-[6px] font-semibold uppercase tracking-wider sm:text-[8px]"
            style={{ color: accent }}
          >
            {SAMPLE.issuer_name}
          </span>
        </div>
      </div>
    </div>
  );
}
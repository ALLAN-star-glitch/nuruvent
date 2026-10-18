// app/(dashboard)/dashboard/me/certificates/_components/CertificateCard.tsx

'use client';

import { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDownloadCertificateMutation } from '@/lib/store/api/certificatesApi';
import { Certificate } from '@/lib/types/certificates';

// ============================================================
// HELPERS
// ============================================================

function formatDate(value: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

// ============================================================
// COMPONENT
// ============================================================

export function CertificateCard({ cert }: { cert: Certificate }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadCertificate] = useDownloadCertificateMutation();

  const title = cert.metadata?.context_title ?? 'Certificate';
  const issuer = cert.metadata?.issuer_name ?? 'Nuruvent';
  const isRevoked = cert.status === 'revoked';

 const handleDownload = async () => {
  if (downloading) return;

  setDownloading(true);
  const toastId = toast.loading('Preparing your certificate…');

  try {
    let finalUrl: string | null = null;

    // Poll until the worker has cached the PDF
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = await downloadCertificate(cert.id).unwrap();

      if (result.status === 'ready' && result.url) {
        finalUrl = result.url;
        break;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!finalUrl) {
      toast.error('Certificate is taking too long. Try again in a moment.', {
        id: toastId,
      });
      return;
    }

    // Fetch the PDF as a blob and trigger an in-page download (no new tab)
    const res = await fetch(finalUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `${cert.recipient_name.replace(/\s+/g, '_')}_certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

    toast.success('Certificate downloaded', { id: toastId });
  } catch (err) {
    console.error('[download] error', err);
    const message =
      err instanceof Error ? err.message : 'Failed to download certificate';
    toast.error(message, { id: toastId });
  } finally {
    setDownloading(false);
  }
};

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cert.verification_code);
      toast.success('Verification code copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleVerify = () => {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '');
    window.open(
      `${base}/verify/${cert.verification_code}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <Card className="flex flex-col border-border transition-colors hover:border-primary/40">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-full bg-primary/10 p-2.5">
            <Award className="h-5 w-5 text-primary" />
          </div>
          {isRevoked ? (
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive"
            >
              Revoked
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </Badge>
          )}
        </div>

        {/* Title + issuer */}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {issuer}
          </p>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Issued {formatDate(cert.issued_at)}
          </span>
          {cert.metadata?.context_date && (
            <span className="inline-flex items-center gap-1">
              <Award className="h-3 w-3" />
              Completed {cert.metadata.context_date}
            </span>
          )}
        </div>

        {/* Verification code row */}
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 p-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Verification code
            </p>
            <p className="truncate font-mono text-xs text-foreground">
              {cert.verification_code}
            </p>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 cursor-pointer"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy code</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 cursor-pointer"
            onClick={handleDownload}
            disabled={downloading || isRevoked}
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  onClick={handleVerify}
                >
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Verify in new tab</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
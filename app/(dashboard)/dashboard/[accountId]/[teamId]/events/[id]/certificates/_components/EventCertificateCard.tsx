// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/EventCertificateCard.tsx

'use client';

import {
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Certificate } from '@/lib/types/certificates';



interface Props {
  cert: Certificate;
  onSend: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
}

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

export function EventCertificateCard({
  cert,
  onSend,
  onRevoke,
  onDownload,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const isRevoked = cert.status === 'revoked';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload(cert);
    } finally {
      setDownloading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cert.verification_code);
      toast.success('Verification code copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {cert.recipient_name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {cert.recipient_email}
            </p>
          </div>
          {isRevoked ? (
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive"
            >
              <XCircle className="mr-1 h-3 w-3" />
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

        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 p-2">
          <button
            type="button"
            onClick={copyCode}
            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left"
            title="Copy code"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Verification code
              </p>
              <p className="truncate font-mono text-xs text-foreground">
                {cert.verification_code}
              </p>
            </div>
            <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Issued
            </p>
            <p className="text-xs text-foreground">
              {formatDate(cert.issued_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 cursor-pointer"
            onClick={handleDownload}
            disabled={downloading || isRevoked}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 cursor-pointer"
            onClick={() => onSend(cert)}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRevoke(cert)}
            disabled={isRevoked}
            title="Revoke"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
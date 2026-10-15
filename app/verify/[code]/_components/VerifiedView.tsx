// app/verify/[code]/_components/VerifiedView.tsx

import {
  Award,
  CalendarCheck,
  CheckCircle2,
  FileBadge,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type { VerifiedCertificate } from './types';

// ============================================================
// HELPERS
// ============================================================

function formatDate(value: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

function titleCase(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// ============================================================
// COMPONENT
// ============================================================

export function VerifiedView({ cert }: { cert: VerifiedCertificate }) {
  const title = cert.metadata?.context_title ?? '—';
  const issuer = cert.metadata?.issuer_name ?? 'Nuruvent';
  const duration = cert.metadata?.context_duration;

  return (
    <Card className="w-full max-w-2xl border-border shadow-sm">
      <CardContent className="p-6 sm:p-8">
        {/* Header: verified badge */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              Certificate Verified
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This certificate is valid and issued by {issuer}.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        </div>

        <Separator className="my-6" />

        {/* Certificate summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-6">
          <div className="text-center">
            <Award className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              This certifies that
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground sm:text-xl">
              {cert.recipient_name}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              has successfully completed
            </p>
            <h3 className="mt-1 text-base font-medium text-primary sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              on {formatDate(cert.completed_at)}
            </p>
            {duration && (
              <p className="mt-1 text-xs text-muted-foreground">
                Duration: {duration}
              </p>
            )}
          </div>
        </div>

        {/* Detail grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow
            icon={<FileBadge className="h-4 w-4" />}
            label="Verification code"
            value={<span className="font-mono text-sm">{cert.verification_code}</span>}
          />
          <DetailRow
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Issued on"
            value={formatDate(cert.issued_at)}
          />
          <DetailRow
            icon={<Award className="h-4 w-4" />}
            label="Context"
            value={titleCase(cert.context_type)}
          />
          <DetailRow
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Issuer"
            value={issuer}
          />
        </div>

        {/* Footer note */}
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
          This verification is provided by Nuruvent. Anyone with the
          verification code can confirm this certificate&apos;s authenticity.
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SUB-COMPONENT
// ============================================================

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
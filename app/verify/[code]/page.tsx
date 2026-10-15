// app/verify/[code]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useVerifyCertificateQuery } from '@/lib/store/api/certificatesApi';

import { InvalidView } from './_components/InvalidView';
import { NotFoundView } from './_components/NotFoundView';
import { VerifiedView } from './_components/VerifiedView';
import { VerifySkeleton } from './_components/VerifySkeleton';

export default function VerifyCertificatePage() {
  const params = useParams<{ code: string }>();
  const code = params?.code ?? '';

  const { data, error, isLoading, refetch, isFetching } =
    useVerifyCertificateQuery(code, { skip: !code });

  // ---- Loading ----
  if (isLoading) {
    return (
      <PageShell>
        <VerifySkeleton />
      </PageShell>
    );
  }

  // ---- Invalid (400) ----
  if (isErrorWithStatus(error, 400)) {
    return (
      <PageShell>
        <InvalidView message={extractErrorMessage(error) ?? 'Malformed code'} />
      </PageShell>
    );
  }

  // ---- Not found (404) ----
  if (isErrorWithStatus(error, 404)) {
    return (
      <PageShell>
        <NotFoundView code={code} />
      </PageShell>
    );
  }

  // ---- Generic error ----
  if (error) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {extractErrorMessage(error) ?? 'Something went wrong.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Try again
          </Button>
        </div>
      </PageShell>
    );
  }

  // ---- Verified ----
  if (data?.data) {
    return (
      <PageShell>
        <VerifiedView cert={data.data} />
      </PageShell>
    );
  }

  // ---- Fallback (shouldn't happen) ----
  return (
    <PageShell>
      <NotFoundView code={code} />
    </PageShell>
  );
}

// ============================================================
// LAYOUT
// ============================================================

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Nuruvent
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>Certificate Verification</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          Powered by Nuruvent
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// ERROR HELPERS
// ============================================================

function isErrorWithStatus(error: unknown, status: number): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { status?: number | string };
  return e.status === status;
}

function extractErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const data = (error as { data?: unknown }).data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  return null;
}
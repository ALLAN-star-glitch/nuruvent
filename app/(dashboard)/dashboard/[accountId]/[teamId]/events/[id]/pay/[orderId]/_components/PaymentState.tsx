// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/pay/[orderId]/_components/PaymentStates.tsx

'use client';

import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================
// LOADING
// ============================================================

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        {message}
      </div>
    </div>
  );
}

// ============================================================
// ERROR
// ============================================================

export function ErrorState({
  title,
  message,
  backHref,
  backLabel = 'Go back',
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive/30">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <Link href={backHref}>
            <Button className="cursor-pointer">{backLabel}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// SUCCESS
// ============================================================

export function SuccessState({
  eventTitle,
  attendeeCount,
  redirectHref,
}: {
  eventTitle: string;
  attendeeCount: number;
  redirectHref: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-emerald-200 dark:border-emerald-900">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Payment confirmed
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {attendeeCount} certificate
              {attendeeCount === 1 ? '' : 's'} for{' '}
              <span className="font-medium text-foreground">
                {eventTitle}
              </span>{' '}
              are being issued. Recipients will receive their certificates by
              email shortly.
            </p>
          </div>
          <Link href={redirectHref}>
            <Button className="cursor-pointer">View certificates</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
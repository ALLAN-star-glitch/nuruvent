'use client';

import { use } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useGetEventByIdQuery } from '@/lib/store/api/eventsApi';
import { PaymentsLedger } from '@/components/payments/PaymentsLedger';

export default function EventPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const routeParams = useParams<{ accountId: string; teamId: string }>();
  const accountId = routeParams.accountId;
  const teamId = routeParams.teamId;

  const { data: eventResponse, isLoading } = useGetEventByIdQuery(id);
  const event = eventResponse?.data;

  const title = event?.display_name || event?.name || 'Event';
  const statusLabel = isLoading ? 'Loading event…' : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href={`/dashboard/${accountId}/${teamId}/events/${id}`}
          className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Payments
          </p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight break-words">
            {isLoading ? (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                {statusLabel}
              </span>
            ) : (
              title
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? 'Loading payments…'
              : `Payments collected for this event.`}
          </p>
        </div>
      </div>

      <PaymentsLedger eventId={id} />
    </div>
  );
}
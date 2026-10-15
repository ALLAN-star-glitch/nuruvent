// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/EventCertificatesHeader.tsx

import { ArrowLeft, Award, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
  eventTitle: string;
  eventDate: string;
  backHref: string;
  isFetching: boolean;
  canIssue: boolean;
  onRefresh: () => void;
  onIssue: () => void;
}

export function EventCertificatesHeader({
  eventTitle,
  eventDate,
  backHref,
  isFetching,
  canIssue,
  onRefresh,
  onIssue,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
            <Award className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate">Certificates</span>
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {eventTitle}
            {eventDate && <span className="ml-2 text-xs">· {eventDate}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onRefresh}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={onIssue}
          disabled={!canIssue}
        >
          <Award className="mr-2 h-4 w-4" />
          Issue certificates
        </Button>
      </div>
    </div>
  );
}
// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/EventCertificatesEmpty.tsx

import { Award, FileBadge } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  hasFilters: boolean;
  onClearFilters: () => void;
  onIssue: () => void;
  canIssue: boolean;
}

export function EventCertificatesEmpty({
  hasFilters,
  onClearFilters,
  onIssue,
  canIssue,
}: Props) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          {hasFilters ? (
            <Award className="h-8 w-8 text-muted-foreground" />
          ) : (
            <FileBadge className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {hasFilters ? 'No certificates match' : 'No certificates issued yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? 'Try adjusting your filters.'
              : 'Issue certificates to this event’s attendees.'}
          </p>
        </div>
        {hasFilters ? (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : (
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={onIssue}
            disabled={!canIssue}
          >
            Issue certificates
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
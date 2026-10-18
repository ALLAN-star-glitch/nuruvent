// app/(dashboard)/dashboard/[accountId]/certificates/_components/SelectEventDialog.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useListMyEventsQuery } from '@/lib/store/api/eventsApi';
import { useAppSelector } from '@/lib/store/hooks';
import type { Event } from '@/lib/types/events';

interface Props {
  open: boolean;
  accountId: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (event: Event) => void;
}

export function SelectEventDialog({
  open,
  accountId,
  onOpenChange,
  onSelect,
}: Props) {
  const [search, setSearch] = useState('');
  const params = useParams<{ teamId?: string }>();

  // Priority:
  //   1. Team in the URL (if user is on a team-scoped page)
  //   2. Active team from workspace state (last-used team)
  const urlTeamId = params?.teamId ?? null;
  const workspaceTeamId = useAppSelector((s) => s.workspace.activeTeamId);
  const teamId = urlTeamId ?? workspaceTeamId ?? '';

  // Fetch events for the current team only
  const { data, isLoading } = useListMyEventsQuery(
    {
      scope: 'team',
      team_id: teamId,
      page: 1,
      page_size: 100,
    },
    { skip: !open || !teamId },
  );

  const events = data?.data?.data ?? [];

  const filtered = search.trim()
    ? events.filter((e) =>
        (e.display_name || e.name || '')
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : events;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Issue Certificates</DialogTitle>
          <DialogDescription>
            Choose an event to issue certificates for.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto -mx-2 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !teamId ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No team selected. Switch to a team to see its events.
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events found for this team. Create one first.
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelect(event)}
                  className="flex w-full flex-col items-start gap-1 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent cursor-pointer"
                >
                  <span className="text-sm font-medium text-foreground">
                    {event.display_name || event.name || 'Untitled event'}
                  </span>
                  {event.start_date && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
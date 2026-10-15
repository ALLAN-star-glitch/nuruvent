// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificatesFilters.tsx

'use client';

import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface EventOption {
  id: string;
  title: string;
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: 'all' | 'active' | 'revoked';
  onStatusChange: (v: 'all' | 'active' | 'revoked') => void;
  eventFilter: string;
  onEventChange: (v: string) => void;
  events: EventOption[];
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export function AccountCertificatesFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  eventFilter,
  onEventChange,
  events,
  onReset,
  resultCount,
  totalCount,
}: Props) {
  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== 'all' ||
    eventFilter !== 'all';

  return (
    <Card className="border-border">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by recipient, email, or code…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Event filter */}
          <Select value={eventFilter} onValueChange={onEventChange}>
            <SelectTrigger className="w-full cursor-pointer sm:w-[220px]">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All events
              </SelectItem>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id} className="cursor-pointer">
                  <span className="truncate">{e.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              onStatusChange(v as 'all' | 'active' | 'revoked')
            }
          >
            <SelectTrigger className="w-full cursor-pointer sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All statuses
              </SelectItem>
              <SelectItem value="active" className="cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="revoked" className="cursor-pointer">
                Revoked
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Result count + reset */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {resultCount} of {totalCount} certificate
            {totalCount === 1 ? '' : 's'}
          </span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 cursor-pointer text-xs"
              onClick={onReset}
            >
              Reset filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
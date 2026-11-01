'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { EventCard } from './EventCard';
import type { UIEvent } from './types';

interface Props {
  events: UIEvent[];
  selectedIds: string[];
  onSelectOne: (id: string) => void;
  /** Called when a card is tapped — receives the full event object */
  onRowClick: (event: UIEvent) => void;
  onView: (event: UIEvent) => void;
  onEdit: (event: UIEvent) => void;
  onDuplicate: (event: UIEvent) => void;
  onPublish: (event: UIEvent) => void;
  onRestore: (event: UIEvent) => void;
  onPermanentDelete: (event: UIEvent) => void;
  onMoveToTrash: (event: UIEvent) => void;
  emptyState: React.ReactNode;

  // Pagination — optional. If omitted, no pagination footer is shown.
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  isFetching?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function EventsGrid({
  events,
  selectedIds,
  onSelectOne,
  onRowClick,
  onView,
  onEdit,
  onDuplicate,
  onPublish,
  onRestore,
  onPermanentDelete,
  onMoveToTrash,
  emptyState,
  currentPage,
  pageSize,
  totalItems,
  isFetching,
  onPageChange,
  onPageSizeChange,
}: Props) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {emptyState}
      </div>
    );
  }

  const totalPages = pageSize && totalItems ? Math.ceil(totalItems / pageSize) : 1;
  const safePage = currentPage ?? 1;
  const startIdx = pageSize ? (safePage - 1) * pageSize + 1 : 0;
  const endIdx = pageSize && totalItems ? Math.min(safePage * pageSize, totalItems) : 0;
  const showFooter = !!currentPage && !!pageSize && totalItems != null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isSelected={selectedIds.includes(event.id)}
            onClick={() => onRowClick(event)}
            onView={() => onView(event)}
            onEdit={() => onEdit(event)}
            onDuplicate={() => onDuplicate(event)}
            onPublish={() => onPublish(event)}
            onRestore={() => onRestore(event)}
            onPermanentDelete={() => onPermanentDelete(event)}
            onMoveToTrash={() => onMoveToTrash(event)}
          />
        ))}
      </div>

      {/* Pagination footer */}
      {showFooter && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border border-border/60 rounded-lg bg-background">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Rows per page
              </span>
              {onPageSizeChange && (
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                  <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((n) => (
                      <SelectItem key={n} value={String(n)} className="cursor-pointer">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{startIdx}</span>{' '}
              to <span className="font-medium text-foreground">{endIdx}</span>{' '}
              of <span className="font-medium text-foreground">{totalItems}</span>
            </div>
          </div>

          {totalPages > 1 && onPageChange && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(safePage - 1)}
                disabled={safePage <= 1 || isFetching}
                className="cursor-pointer h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground px-1">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(safePage + 1)}
                disabled={safePage >= totalPages || isFetching}
                className="cursor-pointer h-8"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
'use client';

import { Calendar, Clock, Globe, Lock, Star, Trash2, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { UIEvent } from './types';
import { EventActionsMenu } from './EventActionsMenu';
import { EventStatusBadge } from './EventStatusBadge';
import { EventTypeBadge } from './EventTypeBadge';

function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  event: UIEvent;
  isSelected: boolean;
  onClick: () => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onMoveToTrash: () => void;
}

export function EventCard({
  event,
  isSelected,
  onClick,
  onView,
  onEdit,
  onDuplicate,
  onPublish,
  onRestore,
  onPermanentDelete,
  onMoveToTrash,
}: Props) {
  const isTrashed = event.isDeleted;
  const addedDate = event.publishedAt || event.createdAt;
  const addedLabel = event.publishedAt ? 'Published' : 'Created';
  const percent =
    event.capacity > 0
      ? Math.round((event.registered / event.capacity) * 100)
      : 0;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer border-border/60 transition-all duration-200 hover:shadow-lg',
        isSelected && 'border-primary/50 bg-primary/5',
        isTrashed && 'bg-amber-50/30 opacity-60 dark:bg-amber-950/10',
      )}
    >
      <CardContent className="space-y-3 p-4">
        {/* Top row — type + status */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.typeDisplayName} />
            {event.isFeatured && !isTrashed && (
              <Badge className="bg-secondary-500 text-xs text-white">
                <Star className="mr-1 h-3 w-3" /> Featured
              </Badge>
            )}
            {event.isPrivate && !isTrashed && (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-xs text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400"
              >
                <Lock className="mr-1 h-3 w-3" /> Private
              </Badge>
            )}
          </div>
          {isTrashed ? (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400"
            >
              <Trash2 className="mr-1 h-3 w-3" /> Trashed
            </Badge>
          ) : (
            <EventStatusBadge status={event.statusDisplayName} />
          )}
        </div>

        {/* Title + price row */}
        <div>
          <h3 className="line-clamp-2 font-semibold text-foreground">
            {event.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-primary">{event.priceDisplay}</span>
            <span className="text-border">•</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {event.cpdHours} CPD Hrs
            </span>
          </div>
        </div>

        {/* Date + time */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Added */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Added:</span>
          <span>{formatDateShort(addedDate)}</span>
          <span>({addedLabel})</span>
        </div>

        {/* Registrations */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {event.registered} / {event.capacity || '∞'} registered
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span>{event.platform}</span>
          </div>
          <EventActionsMenu
            isTrashed={isTrashed}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onPublish={onPublish}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            onMoveToTrash={onMoveToTrash}
            small
          />
        </div>
      </CardContent>
    </Card>
  );
}
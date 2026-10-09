'use client';

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
}: Props) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {emptyState}
      </div>
    );
  }

  return (
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
  );
}
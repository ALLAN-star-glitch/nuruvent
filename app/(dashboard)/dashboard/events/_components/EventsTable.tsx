'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Star, Trash2, Lock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { EventStatusBadge } from './EventStatusBadge';
import { EventTypeBadge } from './EventTypeBadge';
import { EventActionsMenu } from './EventActionsMenu';
import type { UIEvent, SortField } from './types';

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
  events: UIEvent[];
  selectedIds: string[];
  selectAll: boolean;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onToggleSort: (field: SortField) => void;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onRowClick: (id: string) => void;
  onView: (event: UIEvent) => void;
  onEdit: (event: UIEvent) => void;
  onDuplicate: (event: UIEvent) => void;
  onPublish: (event: UIEvent) => void;
  onRestore: (event: UIEvent) => void;
  onPermanentDelete: (event: UIEvent) => void;
  onMoveToTrash: (event: UIEvent) => void;
  emptyState: React.ReactNode;
}

function SortableHead({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}) {
  const icon =
    sortField !== field ? (
      <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
    ) : sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );

  return (
    <TableHead
      className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {label}
        {icon}
      </div>
    </TableHead>
  );
}

export function EventsTable({
  events,
  selectedIds,
  selectAll,
  sortField,
  sortDirection,
  onToggleSort,
  onSelectAll,
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
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10 px-4 py-3">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    className="cursor-pointer"
                    disabled={events.length === 0}
                  />
                </TableHead>
                <SortableHead
                  label="Event Title"
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onToggleSort}
                />
                <TableHead className="px-4 py-3">Type</TableHead>
                <SortableHead
                  label="Event Date"
                  field="eventDate"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onToggleSort}
                />
                <SortableHead
                  label="Added"
                  field="addedDate"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onToggleSort}
                />
                <SortableHead
                  label="Registrations"
                  field="current_attendees"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onToggleSort}
                />
                <SortableHead
                  label="Status"
                  field="status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onToggleSort}
                />
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map((event) => {
                  const percentage =
                    event.capacity > 0
                      ? Math.round((event.registered / event.capacity) * 100)
                      : 0;
                  const isSelected = selectedIds.includes(event.id);
                  const isTrashed = event.isDeleted;
                  const addedDate = event.publishedAt || event.createdAt;
                  const addedLabel = event.publishedAt ? 'Published' : 'Created';

                  return (
                    <TableRow
                      key={event.id}
                      onClick={() => onRowClick(event.id)}
                      className={`group cursor-pointer transition-colors hover:bg-accent/60 ${
                        isSelected ? 'bg-primary/5' : ''
                      } ${
                        isTrashed
                          ? 'bg-amber-50/30 opacity-60 dark:bg-amber-950/10'
                          : ''
                      }`}
                    >
                      <TableCell
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onSelectOne(event.id)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="font-semibold text-foreground transition-colors group-hover:text-primary">
                          {event.title}
                          {isTrashed && (
                            <Badge
                              variant="outline"
                              className="ml-2 border-amber-200 bg-amber-50 text-xs text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400"
                            >
                              <Trash2 className="mr-1 h-3 w-3" /> Trashed
                            </Badge>
                          )}
                          {event.isFeatured && !isTrashed && (
                            <Badge className="ml-2 bg-secondary-500 text-xs text-white">
                              <Star className="mr-1 h-3 w-3" /> Featured
                            </Badge>
                          )}
                          {event.isPrivate && !isTrashed && (
                            <Badge
                              variant="outline"
                              className="ml-2 border-amber-200 bg-amber-50 text-xs text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400"
                            >
                              <Lock className="mr-1 h-3 w-3" /> Private
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{event.platform}</span>
                          <span className="text-border">•</span>
                          <span className="font-medium text-primary">
                            {event.priceDisplay}
                          </span>
                          <span className="text-border">•</span>
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {event.cpdHours} CPD Hrs
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <EventTypeBadge type={event.typeDisplayName} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-sm">{event.date}</span>
                          <span className="text-xs text-muted-foreground">
                            {event.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDateShort(addedDate)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {addedLabel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="w-36">
                          <div className="mb-1 flex justify-between text-xs font-medium text-foreground">
                            <span>
                              {event.registered} / {event.capacity || '∞'}
                            </span>
                            <span className="text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
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
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <EventActionsMenu
                          isTrashed={isTrashed}
                          onView={() => onView(event)}
                          onEdit={() => onEdit(event)}
                          onDuplicate={() => onDuplicate(event)}
                          onPublish={() => onPublish(event)}
                          onRestore={() => onRestore(event)}
                          onPermanentDelete={() => onPermanentDelete(event)}
                          onMoveToTrash={() => onMoveToTrash(event)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {emptyState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MoreVertical,
  Phone,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import type { CrossEventRegistration } from '@/lib/types/registration';
import { StatusBadge } from '@/components/registrations/status_badge';

function initials(name?: string): string {
  const n = (name ?? '').trim();
  if (!n) return '?';
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  registrations: CrossEventRegistration[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  isRowSelected: (r: CrossEventRegistration) => boolean;
  onSelectOne: (r: CrossEventRegistration) => void;
  onView: (r: CrossEventRegistration) => void;
  onGoToEvent: (eventId: string) => void;
  onItemsPerPageChange: (n: number) => void;
  onPageChange: (n: number) => void;
}

export function RegistrationsGrid(props: Props) {
  const {
    registrations,
    total,
    currentPage,
    itemsPerPage,
    totalPages,
    isRowSelected,
    onSelectOne,
    onView,
    onGoToEvent,
    onItemsPerPageChange,
    onPageChange,
  } = props;

  const [isMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {registrations.length > 0 ? (
          registrations.map((r) => {
            const selected = isRowSelected(r);
            return (
              <Card
                key={r.id}
                className={`group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  selected ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onClick={() => onSelectOne(r)}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {r.is_guest && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Guest
                      </Badge>
                    )}
                    <StatusBadge status={r.status} label={r.status_label} />
                  </div>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials(r.attendee_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-foreground">
                        {r.attendee_name || '—'}
                      </h3>
                      {r.email ? (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Mail className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="break-all">{r.email}</span>
                        </div>
                      ) : (
                        <div className="text-xs italic text-muted-foreground">
                          No email on file
                        </div>
                      )}
                      {r.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span className="break-words">{r.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="break-words font-medium text-foreground">
                      {r.event_name}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{formatDate(r.event_start_date)}</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 border-t border-border pt-2 text-xs">
                    <span className="min-w-0 text-muted-foreground">
                      Ticket:{' '}
                      <span className="break-words font-medium text-foreground">
                        {r.ticket_name || '—'}
                      </span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatDate(r.created_at)}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-border pt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="-ml-2 h-7 cursor-pointer px-2 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                      onClick={() => onView(r)}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View details
                    </Button>
                    {!isMobile && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer p-0"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onView(r)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onGoToEvent(r.event_id)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Go to Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-8 w-8 text-muted-foreground/60" />
              <p className="font-medium">No registrations found</p>
              <p className="text-sm">Try adjusting your search or filter.</p>
            </div>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => onItemsPerPageChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5" className="cursor-pointer">
                  5
                </SelectItem>
                <SelectItem value="10" className="cursor-pointer">
                  10
                </SelectItem>
                <SelectItem value="20" className="cursor-pointer">
                  20
                </SelectItem>
                <SelectItem value="50" className="cursor-pointer">
                  50
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 cursor-pointer p-0"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 cursor-pointer p-0"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MoreVertical,
  Phone,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Checkbox } from '@/components/ui/checkbox';
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

type SortField = 'created_at' | 'attendee_name' | 'event_name' | 'status';

interface Props {
  registrations: CrossEventRegistration[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  isRowSelected: (r: CrossEventRegistration) => boolean;
  selectAll: boolean;
  onToggleSort: (f: SortField) => void;
  onSelectAll: () => void;
  onSelectOne: (r: CrossEventRegistration) => void;
  onView: (r: CrossEventRegistration) => void;
  onGoToEvent: (eventId: string) => void;
  onItemsPerPageChange: (n: number) => void;
  onPageChange: (n: number) => void;
}

export function RegistrationsTable(props: Props) {
  const {
    registrations,
    total,
    currentPage,
    itemsPerPage,
    totalPages,
    isRowSelected,
    selectAll,
    onToggleSort,
    onSelectAll,
    onSelectOne,
    onView,
    onGoToEvent,
    onItemsPerPageChange,
    onPageChange,
  } = props;

  // Preserve the sort-arrow logic from HostingTab — put it inline here.
  const sortArrow = (field: SortField) => (
    <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
  );

  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10 px-4 py-3">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={onSelectAll}
                    className="cursor-pointer"
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                  onClick={() => onToggleSort('attendee_name')}
                >
                  <div className="flex items-center">
                    Attendee {sortArrow('attendee_name')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                  onClick={() => onToggleSort('event_name')}
                >
                  <div className="flex items-center">
                    Event {sortArrow('event_name')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                  onClick={() => onToggleSort('status')}
                >
                  <div className="flex items-center">
                    Status {sortArrow('status')}
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3">Ticket</TableHead>
                <TableHead
                  className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                  onClick={() => onToggleSort('created_at')}
                >
                  <div className="flex items-center">
                    Registered {sortArrow('created_at')}
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length > 0 ? (
                registrations.map((r) => {
                  const selected = isRowSelected(r);
                  return (
                    <TableRow
                      key={r.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                        selected ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => onSelectOne(r)}
                    >
                      <TableCell
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => onSelectOne(r)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {initials(r.attendee_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-words font-semibold text-foreground">
                                {r.attendee_name || '—'}
                              </p>
                              {r.is_guest && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-[10px]"
                                >
                                  Guest
                                </Badge>
                              )}
                            </div>
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
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            {r.event_image_url ? (
                              <img
                                src={r.event_image_url}
                                alt={r.event_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium text-foreground">
                              {r.event_name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>{formatDate(r.event_start_date)}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <StatusBadge
                          status={r.status}
                          label={r.status_label}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                        {r.ticket_name || '—'}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(r.created_at)}
                      </TableCell>
                      <TableCell
                        className="px-4 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
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
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/60" />
                      <p className="font-medium">No registrations found</p>
                      <p className="text-sm">
                        Try adjusting your search or filter.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {total > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border p-4 sm:flex-row">
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
                  onClick={() =>
                    onPageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
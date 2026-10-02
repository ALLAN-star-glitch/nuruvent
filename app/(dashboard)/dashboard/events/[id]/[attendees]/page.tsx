/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/dashboard/events/[id]/attendees/page.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Users,
  Mail,
  Calendar,
  Clock as ClockIcon,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import {
  useGetEventAttendeeDetailQuery,
  useGetEventAttendeesQuery,
} from '@/lib/store/api/attendanceApi';
import type {
  AttendanceStatus,
  EventAttendeeDetail,
  EventAttendeeRow,
  ListAttendeesParams,
} from '@/lib/types/attendance';

// ============================================================
// STATUS DISPLAY
// ============================================================

interface StatusDisplay {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusConfig: Record<AttendanceStatus, StatusDisplay> = {
  registered: {
    label: 'Registered',
    color:
      'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
    icon: ClockIcon,
  },
  joined: {
    label: 'Joined',
    color:
      'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50',
    icon: ClockIcon,
  },
  partial: {
    label: 'Partial',
    color:
      'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    icon: ClockIcon,
  },
  full: {
    label: 'Attended',
    color:
      'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    icon: CheckCircle2,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-primary/10 text-primary border-primary/30',
    icon: CheckCircle2,
  },
  'no-show': {
    label: 'No Show',
    color:
      'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    icon: XCircle,
  },
};

const STATUS_OPTIONS: AttendanceStatus[] = [
  'registered',
  'joined',
  'partial',
  'full',
  'confirmed',
  'no-show',
];

// ============================================================
// HELPERS
// ============================================================

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type SortField = 'name' | 'registered_at' | 'status' | 'duration';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

// ============================================================
// PAGE
// ============================================================

export default function EventAttendeesPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params?.id ?? '';

  // ---- Filter / sort / pagination ----
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | AttendanceStatus>(
    'all',
  );
  const [sortField, setSortField] = useState<SortField>('registered_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ---- Selection (visual only) ----
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // ---- Detail dialog ----
  const [openAttendeeId, setOpenAttendeeId] = useState<string | null>(null);

  // ---- Mobile ----
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, sortField, sortDirection, itemsPerPage]);

  useEffect(() => {
    setSelectedIds([]);
    setSelectAll(false);
  }, [currentPage]);

  const queryParams: ListAttendeesParams = useMemo(
    () => ({
      search: searchQuery || undefined,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      sort_by: sortField,
      sort_order: sortDirection,
      page: currentPage,
      page_size: itemsPerPage,
    }),
    [
      searchQuery,
      selectedStatus,
      sortField,
      sortDirection,
      currentPage,
      itemsPerPage,
    ],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    error,
  } = useGetEventAttendeesQuery(
    { eventId, params: queryParams },
    { skip: !eventId },
  );

  const payload = response?.data;
  const attendees: EventAttendeeRow[] = payload?.attendees ?? [];
  const total = payload?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  // ---- Detail query ----
  const { data: detailResponse, isFetching: isDetailLoading } =
    useGetEventAttendeeDetailQuery(
      { eventId, attendeeId: openAttendeeId ?? '' },
      { skip: !eventId || !openAttendeeId },
    );
  const detail: EventAttendeeDetail | undefined = detailResponse?.data;

  // ---- Stats (page-scoped) ----
  const stats = useMemo(() => {
    const attended = attendees.filter(
      (a) => a.effective_status === 'full' || a.effective_status === 'confirmed',
    ).length;
    const registered = attendees.filter(
      (a) => a.effective_status === 'registered',
    ).length;
    const noShow = attendees.filter(
      (a) => a.effective_status === 'no-show',
    ).length;
    return { attended, registered, noShow };
  }, [attendees]);

  const errorMessage = error
    ? (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load attendees'
    : null;

  // ---- Handlers ----
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(attendees.map((a) => a.attendee_id));
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleView = (id: string) => setOpenAttendeeId(id);

  const getActiveFilterCount = () => {
    let n = 0;
    if (searchQuery) n++;
    if (selectedStatus !== 'all') n++;
    return n;
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedStatus('all');
    setSortField('registered_at');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      name: 'Name',
      registered_at: 'Registered',
      status: 'Status',
      duration: 'Duration',
    };
    return labels[sortField];
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Event ID is missing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Attendees</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Everyone registered for this event, with their attendance.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {total}
                </p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Attended (page)
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {stats.attended}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registered (page)
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.registered}
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-950/30">
                <ClockIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  No Show (page)
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.noShow}
                </p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg dark:bg-red-950/30">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Filters */}
      {!isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>

                <Select
                  value={selectedStatus}
                  onValueChange={(v) =>
                    setSelectedStatus(v as 'all' | AttendanceStatus)
                  }
                >
                  <SelectTrigger className="w-full md:w-[170px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'table'
                          ? 'bg-background text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Table View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-background text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    |
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Sort by:
                    </span>
                    <Select
                      value={sortField}
                      onValueChange={(v) => {
                        setSortField(v as SortField);
                        setSortDirection('asc');
                      }}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-xs border-0 bg-transparent focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name" className="text-sm">
                          Name
                        </SelectItem>
                        <SelectItem value="registered_at" className="text-sm">
                          Registered
                        </SelectItem>
                        <SelectItem value="status" className="text-sm">
                          Status
                        </SelectItem>
                        <SelectItem value="duration" className="text-sm">
                          Duration
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() =>
                        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                      }
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                      title={
                        sortDirection === 'asc' ? 'Ascending' : 'Descending'
                      }
                    >
                      {sortDirection === 'asc' ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {isFetching && !isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {total} attendee{total !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {selectedIds.length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {selectedIds.length} attendee
                  {selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedIds([]);
                    setSelectAll(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : errorMessage ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : !isMobile && viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="py-3 px-4 w-10">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center">
                        Attendee
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">Sessions</TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => toggleSort('duration')}
                    >
                      <div className="flex items-center">
                        Duration
                        {getSortIcon('duration')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.length > 0 ? (
                    attendees.map((a) => {
                      const s = statusConfig[a.effective_status];
                      const StatusIcon = s.icon;
                      const isSelected = selectedIds.includes(a.attendee_id);

                      return (
                        <TableRow
                          key={a.attendee_id}
                          className={`hover:bg-muted/40 transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell className="py-4 px-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleSelectOne(a.attendee_id)
                              }
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials(a.display_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">
                                  {a.display_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{a.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${s.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {s.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {a.sessions_attended}
                            </span>{' '}
                            / {a.sessions_total}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-muted-foreground">
                            {formatDuration(a.total_duration_seconds)}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleView(a.attendee_id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/dashboard/events/${eventId}`)
                                  }
                                >
                                  <ArrowRight className="h-4 w-4 mr-2" />
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
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/60" />
                          <p className="font-medium">No attendees found</p>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Rows per page:
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(v) => setItemsPerPage(Number(v))}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
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
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
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
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendees.length > 0 ? (
              attendees.map((a) => {
                const s = statusConfig[a.effective_status];
                const StatusIcon = s.icon;
                const isSelected = selectedIds.includes(a.attendee_id);

                return (
                  <Card
                    key={a.attendee_id}
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      isSelected ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() =>
                      isMobile
                        ? handleView(a.attendee_id)
                        : handleSelectOne(a.attendee_id)
                    }
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {!isMobile && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleSelectOne(a.attendee_id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {initials(a.display_name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <Badge variant="outline" className={`${s.color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {s.label}
                        </Badge>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {a.display_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{a.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                        <span className="text-muted-foreground">
                          Sessions:{' '}
                          <span className="font-medium text-foreground">
                            {a.sessions_attended} / {a.sessions_total}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          {formatDuration(a.total_duration_seconds)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        {isMobile ? (
                          <div className="flex items-center gap-1 text-xs text-primary font-medium">
                            View Details
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0"
                              >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleView(a.attendee_id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/events/${eventId}`)
                                }
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
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
                  <p className="font-medium">No attendees found</p>
                  <p className="text-sm">
                    Try adjusting your search or filter.
                  </p>
                </div>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(v) => setItemsPerPage(Number(v))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
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
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile filter strip */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md bg-background rounded-full shadow-lg border border-border">
            <div className="flex items-center justify-between px-4 py-2.5 gap-2">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 hover:bg-muted rounded-full px-3 py-1.5 transition-colors"
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {searchInput || 'Search'}
                </span>
              </button>

              <div className="w-px h-6 bg-border flex-shrink-0" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 hover:bg-muted rounded-full px-3 py-1.5 transition-colors relative"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              <div className="w-px h-6 bg-border flex-shrink-0" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 hover:bg-muted rounded-full px-3 py-1.5 transition-colors"
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground truncate max-w-[60px]">
                  {getSortLabel()}
                </span>
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-3xl px-0 pb-0"
          showCloseButton={false}
        >
          <div className="px-6 pt-6 pb-8 h-full flex flex-col">
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-semibold">
                  Filter & Sort
                </SheetTitle>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your attendee list
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search attendees..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(v) =>
                    setSelectedStatus(v as 'all' | AttendanceStatus)
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Sort By</Label>
                <Select
                  value={sortField}
                  onValueChange={(v) => setSortField(v as SortField)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="registered_at">Registered</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className="h-11 rounded-xl"
                    onClick={() => setSortDirection('asc')}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Ascending
                  </Button>
                  <Button
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="h-11 rounded-xl"
                    onClick={() => setSortDirection('desc')}
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Descending
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border bg-background pb-2">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => {
                  resetFilters();
                  setIsFilterSheetOpen(false);
                }}
              >
                Reset All
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl"
                onClick={() => setIsFilterSheetOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail dialog — per-session breakdown */}
      <Dialog
        open={openAttendeeId !== null}
        onOpenChange={(open) => !open && setOpenAttendeeId(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
            <DialogDescription>
              Rollup and per-session breakdown.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg">
                    {initials(detail.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {detail.display_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {detail.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant="outline"
                    className={`${
                      statusConfig[detail.effective_status].color
                    } border mt-1`}
                  >
                    {statusConfig[detail.effective_status].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Sessions
                  </Label>
                  <p className="text-sm sm:text-base font-medium">
                    {detail.sessions_attended} / {detail.sessions_total}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Total duration
                  </Label>
                  <p className="text-sm sm:text-base font-medium">
                    {formatDuration(detail.total_duration_seconds)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Registered
                  </Label>
                  <p className="text-sm">
                    {formatDate(detail.registered_at)}
                  </p>
                </div>
              </div>

              {detail.sessions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Sessions
                    </Label>
                    <div className="space-y-2">
                      {detail.sessions.map((sess) => {
                        const s = statusConfig[sess.derived_status];
                        const StatusIcon = s.icon;
                        return (
                          <div
                            key={sess.session_id}
                            className="rounded-lg border border-border bg-card p-3 flex flex-col sm:flex-row sm:items-center gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">
                                {sess.title || 'Untitled session'}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {formatDateTime(sess.scheduled_start)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {formatDuration(sess.total_duration_seconds)}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${s.color} border text-xs`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {s.label}
                              </Badge>
                              {sess.host_confirmed && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-primary border-primary/30 bg-primary/10"
                                >
                                  Confirmed
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setOpenAttendeeId(null)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenAttendeeId(null);
                    router.push(`/dashboard/events/${eventId}`);
                  }}
                  className="w-full sm:w-auto"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Event
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              Could not load attendee details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
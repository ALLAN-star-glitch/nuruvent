/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/attendees/page.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Users,
  Mail,
  Phone,
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
  Crown,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
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
import { useGetEventByIdQuery } from '@/lib/store/api/eventsApi';
import { getEventHostName } from '@/lib/utils/eventDisplay';
import type {
  AttendanceStatus,
  EventAttendeeDetail,
  EventAttendeeRow,
  ListAttendeesParams,
} from '@/lib/types/attendance';

import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
} from '@/lib/utils/exportAttendees';

import { StatsCards } from '@/components/registrations/stat_cards';
import { cn } from '@/lib/utils';

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
type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

export default function EventAttendeesPage() {
  const router = useRouter();
  const params = useParams<{
    id: string;
    accountId: string;
    teamId: string;
  }>();
  const eventId = params?.id ?? '';
  const accountId = params?.accountId;
  const teamId = params?.teamId;

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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [openAttendeeId, setOpenAttendeeId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

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

  const { data: eventResponse } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });
  const event = eventResponse?.data;
  const eventName = event?.display_name ?? event?.name ?? 'Event';
  const eventStartDate = event?.start_date;
  const eventHostName = event ? getEventHostName(event) : '';

  const eventPlatforms = useMemo(() => {
    if (!event?.schedules) return [];
    const seen = new Set<string>();
    for (const s of event.schedules) {
      if (s.platform) seen.add(s.platform);
    }
    return Array.from(seen);
  }, [event?.schedules]);

  const { data: detailResponse, isFetching: isDetailLoading } =
    useGetEventAttendeeDetailQuery(
      { eventId, attendeeId: openAttendeeId ?? '' },
      { skip: !eventId || !openAttendeeId },
    );
  const detail: EventAttendeeDetail | undefined = detailResponse?.data;

  const stats = useMemo(() => {
    const attended = attendees.filter(
      (a) =>
        a.effective_status === 'full' || a.effective_status === 'confirmed',
    ).length;
    const registered = attendees.filter(
      (a) => a.effective_status === 'registered',
    ).length;
    const noShow = attendees.filter(
      (a) => a.effective_status === 'no-show',
    ).length;
    const hosts = attendees.filter((a) => a.is_host).length;
    return { attended, registered, noShow, hosts };
  }, [attendees]);

  const errorMessage = error
    ? (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load attendees'
    : null;

  const isRowSelected = (id: string) => selectedIds.includes(id);

  const selectedAttendees = useMemo(
    () => attendees.filter((a) => selectedIds.includes(a.attendee_id)),
    [attendees, selectedIds],
  );

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
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
      );
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
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

  const handleViewFirstSelected = () => {
    if (selectedAttendees.length === 1) {
      handleView(selectedAttendees[0].attendee_id);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectAll(false);
  };

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

  const handleExport = async (format: ExportFormat) => {
    if (attendees.length === 0) return;
    setIsExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const slug = eventName.replace(/\s+/g, '-').toLowerCase();

      const filtersSummary =
        [
          searchQuery ? `Search: "${searchQuery}"` : null,
          selectedStatus !== 'all' ? `Status: ${selectedStatus}` : null,
        ]
          .filter(Boolean)
          .join('  ·  ') || undefined;

      const rows = attendees.map((a) => ({
        ...a,
        event_name: eventName,
        event_slug: '',
        event_start_date: eventStartDate ?? '',
        event_id: eventId,
      })) as unknown as Parameters<typeof exportToCSV>[0];

      if (format === 'csv') {
        exportToCSV(rows, `${slug}-attendees-${stamp}.csv`);
      } else if (format === 'json') {
        exportToJSON(rows, `${slug}-attendees-${stamp}.json`);
      } else if (format === 'xlsx') {
        await exportToExcel(rows, `${slug}-attendees-${stamp}.xlsx`);
      } else if (format === 'pdf') {
        await exportToPDF(rows, {
          title: `${eventName} Attendees`,
          subtitle: 'Event attendee directory',
          hostName: eventHostName,
          platforms: eventPlatforms,
          filtersSummary,
          filename: `${slug}-attendees-${stamp}.pdf`,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const statsItems = [
    {
      label: 'Total',
      value: total,
      sub: 'attendees',
      tone: 'primary' as const,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Attended',
      value: stats.attended,
      sub: 'on this page',
      tone: 'emerald' as const,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: 'Hosts',
      value: stats.hosts,
      sub: 'on this page',
      tone: 'amber' as const,
      icon: <Crown className="h-4 w-4" />,
    },
    {
      label: 'No Show',
      value: stats.noShow,
      sub: 'on this page',
      tone: 'sky' as const,
      icon: <XCircle className="h-4 w-4" />,
    },
  ];

  if (!eventId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/dashboard/${accountId}/${teamId}/events/${eventId}`}
            className="shrink-0 cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {eventName} Attendees
            </h1>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <p className="truncate text-sm text-muted-foreground">
                Everyone registered for this event, with their attendance.
              </p>
              {eventStartDate && (
                <>
                  <span className="shrink-0 text-muted-foreground">·</span>
                  <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(eventStartDate)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full cursor-pointer sm:w-auto"
              disabled={isExporting || attendees.length === 0}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExport('xlsx')}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExport('csv')}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleExport('json')}
            >
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <>
          <StatsCardsSkeleton cards={4} desktopColumns={4} />
          <Card className="border-border/60 shadow-none">
            <CardContent className="flex items-center justify-center p-12 sm:p-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </>
      ) : errorMessage ? (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm">{errorMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsCards stats={statsItems} />

          {!isMobile && (
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-4 md:flex-row">
                    <div className="relative w-full flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-9"
                      />
                    </div>

                    <Select
                      value={selectedStatus}
                      onValueChange={(v) =>
                        setSelectedStatus(v as 'all' | AttendanceStatus)
                      }
                    >
                      <SelectTrigger className="w-full cursor-pointer md:w-[170px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-pointer">
                          All Status
                        </SelectItem>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="cursor-pointer"
                          >
                            {statusConfig[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-3 sm:flex-row">
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`cursor-pointer rounded-md p-1.5 transition-colors ${
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
                          className={`cursor-pointer rounded-md p-1.5 transition-colors ${
                            viewMode === 'grid'
                              ? 'bg-background text-primary shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Grid View"
                        >
                          <Grid3x3 className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        |
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          Sort by:
                        </span>
                        <Select
                          value={sortField}
                          onValueChange={(v) => {
                            setSortField(v as SortField);
                            setSortDirection('asc');
                          }}
                        >
                          <SelectTrigger className="h-8 w-[130px] cursor-pointer border-0 bg-transparent text-xs focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="name"
                              className="cursor-pointer text-sm"
                            >
                              Name
                            </SelectItem>
                            <SelectItem
                              value="registered_at"
                              className="cursor-pointer text-sm"
                            >
                              Registered
                            </SelectItem>
                            <SelectItem
                              value="status"
                              className="cursor-pointer text-sm"
                            >
                              Status
                            </SelectItem>
                            <SelectItem
                              value="duration"
                              className="cursor-pointer text-sm"
                            >
                              Duration
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <button
                          onClick={() =>
                            setSortDirection((d) =>
                              d === 'asc' ? 'desc' : 'asc',
                            )
                          }
                          className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                        >
                          {sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isFetching && !isLoading && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {total} attendee{total !== 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 cursor-pointer text-xs"
                        onClick={resetFilters}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedIds.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <span className="text-sm font-medium text-foreground">
                      {selectedIds.length} attendee
                      {selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedAttendees.length === 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={handleViewFirstSelected}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="cursor-pointer"
                        onClick={clearSelection}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!isMobile && viewMode === 'table' ? (
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-10 px-4 py-3">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            className="cursor-pointer"
                          />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                          onClick={() => toggleSort('name')}
                        >
                          <div className="flex items-center">
                            Attendee
                            {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                          onClick={() => toggleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </TableHead>
                        <TableHead className="px-4 py-3">Sessions</TableHead>
                        <TableHead
                          className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                          onClick={() => toggleSort('duration')}
                        >
                          <div className="flex items-center">
                            Duration
                            {getSortIcon('duration')}
                          </div>
                        </TableHead>
                        <TableHead className="px-4 py-3 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendees.length > 0 ? (
                        attendees.map((a) => {
                          const s = statusConfig[a.effective_status];
                          const StatusIcon = s.icon;
                          const isSelected = isRowSelected(a.attendee_id);

                          return (
                            <TableRow
                              key={a.attendee_id}
                              className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                isSelected ? 'bg-primary/5' : ''
                              }`}
                              onClick={() => handleSelectOne(a.attendee_id)}
                            >
                              <TableCell
                                className="px-4 py-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleSelectOne(a.attendee_id)
                                  }
                                  className="cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {initials(a.display_name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate font-semibold text-foreground">
                                        {a.display_name}
                                      </p>
                                      {a.is_host && (
                                        <Badge
                                          variant="outline"
                                          className="shrink-0 border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400"
                                        >
                                          <Crown className="mr-1 h-3 w-3" />
                                          Host
                                        </Badge>
                                      )}
                                    </div>

                                    {a.email ? (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3 shrink-0" />
                                        <span className="truncate">
                                          {a.email}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="text-xs italic text-muted-foreground">
                                        No email on file
                                      </div>
                                    )}

                                    {a.phone && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span className="truncate">
                                          {a.phone}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <Badge
                                  variant="outline"
                                  className={`${s.color} border`}
                                >
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {s.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                  {a.sessions_attended}
                                </span>{' '}
                                / {a.sessions_total}
                                {a.sessions_confirmed > 0 && (
                                  <span className="ml-2 text-xs text-primary">
                                    · {a.sessions_confirmed} confirmed
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                                {formatDuration(a.total_duration_seconds)}
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
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        handleView(a.attendee_id)
                                      }
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/${accountId}/${teamId}/events/${eventId}`,
                                        )
                                      }
                                    >
                                      <ArrowRight className="mr-2 h-4 w-4" />
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
                  <div className="flex flex-col items-center justify-between gap-4 border-t border-border p-4 sm:flex-row">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Rows per page:
                      </span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(v) => setItemsPerPage(Number(v))}
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
                          className="h-8 w-8 cursor-pointer p-0"
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(p + 1, totalPages),
                            )
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {attendees.length > 0 ? (
                  attendees.map((a) => {
                    const s = statusConfig[a.effective_status];
                    const StatusIcon = s.icon;
                    const isSelected = isRowSelected(a.attendee_id);

                    return (
                      <Card
                        key={a.attendee_id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          isSelected ? 'border-primary/50 bg-primary/5' : ''
                        }`}
                        onClick={() => handleSelectOne(a.attendee_id)}
                      >
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {!isMobile && (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleSelectOne(a.attendee_id)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer"
                                />
                              )}
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials(a.display_name)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {a.is_host && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400"
                                >
                                  <Crown className="mr-1 h-3 w-3" />
                                  Host
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={`${s.color} border`}
                              >
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {s.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-foreground">
                              {a.display_name}
                            </h3>

                            {a.email ? (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{a.email}</span>
                              </div>
                            ) : (
                              <div className="text-xs italic text-muted-foreground">
                                No email on file
                              </div>
                            )}

                            {a.phone && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span className="truncate">{a.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
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

                          <div
                            className="flex items-center justify-between border-t border-border pt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              className="-ml-2 h-7 cursor-pointer px-2 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                              onClick={() => handleView(a.attendee_id)}
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
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuLabel>
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => handleView(a.attendee_id)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/${accountId}/${teamId}/events/${eventId}`,
                                      )
                                    }
                                  >
                                    <ArrowRight className="mr-2 h-4 w-4" />
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
                <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(v) => setItemsPerPage(Number(v))}
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
                        className="h-8 w-8 cursor-pointer p-0"
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
        </>
      )}

      {/* Mobile filter strip */}
      {isMobile && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
          <div className="pointer-events-auto mx-auto max-w-md rounded-full border border-border bg-background shadow-lg">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-muted"
              >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm text-foreground">
                  {searchInput || 'Search'}
                </span>
              </button>

              <div className="h-6 w-px shrink-0 bg-border" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-muted"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              <div className="h-6 w-px shrink-0 bg-border" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-muted"
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[60px] truncate text-sm text-foreground">
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
          <div className="flex h-full flex-col px-6 pb-8 pt-6">
            <SheetHeader className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-semibold">
                  Filter & Sort
                </SheetTitle>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your attendee list
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex-1 overflow-y-auto pb-6">
              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search attendees..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(v) =>
                    setSelectedStatus(v as 'all' | AttendanceStatus)
                  }
                >
                  <SelectTrigger className="h-11 w-full cursor-pointer rounded-xl">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All Status
                    </SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="cursor-pointer"
                      >
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Sort By</Label>
                <Select
                  value={sortField}
                  onValueChange={(v) => setSortField(v as SortField)}
                >
                  <SelectTrigger className="h-11 cursor-pointer rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name" className="cursor-pointer">
                      Name
                    </SelectItem>
                    <SelectItem
                      value="registered_at"
                      className="cursor-pointer"
                    >
                      Registered
                    </SelectItem>
                    <SelectItem value="status" className="cursor-pointer">
                      Status
                    </SelectItem>
                    <SelectItem value="duration" className="cursor-pointer">
                      Duration
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className="h-11 cursor-pointer rounded-xl"
                    onClick={() => setSortDirection('asc')}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Ascending
                  </Button>
                  <Button
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="h-11 cursor-pointer rounded-xl"
                    onClick={() => setSortDirection('desc')}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Descending
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border bg-background pt-4 pb-2">
              <Button
                variant="outline"
                className="h-11 flex-1 cursor-pointer rounded-xl"
                onClick={() => {
                  resetFilters();
                  setIsFilterSheetOpen(false);
                }}
              >
                Reset All
              </Button>
              <Button
                className="h-11 flex-1 cursor-pointer rounded-xl"
                onClick={() => setIsFilterSheetOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail dialog — unchanged */}
      <Dialog
        open={openAttendeeId !== null}
        onOpenChange={(open) => !open && setOpenAttendeeId(null)}
      >
        <DialogContent
          className={[
            'w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)]',
            'sm:w-full sm:max-w-lg',
            'max-h-[90vh] overflow-y-auto overflow-x-hidden',
            'p-4 sm:p-6',
            'min-w-0',
          ].join(' ')}
        >
          <DialogHeader className="min-w-0">
            <DialogTitle className="text-base sm:text-lg">
              Attendee Details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Rollup and per-session breakdown.
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="min-w-0 space-y-4 sm:space-y-6">
              {/* ... your existing detail body, unchanged ... */}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 h-5 w-5" />
              Could not load attendee details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StatsCardsSkeleton({
  cards = 4,
  desktopColumns = 4,
}: {
  cards?: number;
  desktopColumns?: 3 | 4 | 5;
}) {
  const DESKTOP_COLS: Record<3 | 4 | 5, string> = {
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
  };

  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-2.5 sm:gap-3',
        DESKTOP_COLS[desktopColumns],
      )}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="border-border shadow-sm">
          <CardContent className="p-2.5 sm:p-3">
            <Shimmer className="h-6 w-6 rounded-md" />
            <Shimmer className="mt-1.5 h-5 w-12 rounded" />
            <Shimmer className="mt-1 h-3 w-20 rounded" />
            <Shimmer className="mt-0.5 h-2.5 w-16 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-background/40 before:to-transparent',
        'before:animate-[shimmer_1.6s_infinite]',
        className,
      )}
    />
  );
}
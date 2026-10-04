/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Ticket,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
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
  Loader2,
  AlertCircle,
  User,
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

import { useListAllRegistrationsQuery } from '@/lib/store/api/registrationsApi';
import type {
  CrossEventRegistration,
  ListAllRegistrationsParams,
} from '@/lib/types/registration';

import {
  exportRegistrationsToCSV,
  exportRegistrationsToExcel,
  exportRegistrationsToJSON,
  exportRegistrationsToPDF,
} from '@/lib/utils/exportRegistrations';

// ============================================================
// STATUS DISPLAY
// ============================================================

interface StatusDisplay {
  label: string;
  color: string;
  dot: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusConfig: Record<string, StatusDisplay> = {
  confirmed: {
    label: 'Confirmed',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    color:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    dot: 'bg-amber-500',
    icon: ClockIcon,
  },
  cancelled: {
    label: 'Cancelled',
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  canceled: {
    label: 'Cancelled',
    color:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  attended: {
    label: 'Attended',
    color: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
    icon: CheckCircle2,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    icon: ClockIcon,
  },
};

const FALLBACK_STATUS: StatusDisplay = {
  label: 'Unknown',
  color: 'bg-muted text-muted-foreground border-border',
  dot: 'bg-muted-foreground',
  icon: ClockIcon,
};

const STATUS_FILTER_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'attended', label: 'Attended' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'expired', label: 'Expired' },
];

// ============================================================
// HELPERS
// ============================================================

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

function getStatusVisual(slug: string, label?: string): StatusDisplay {
  const base = statusConfig[(slug ?? '').toLowerCase()] ?? FALLBACK_STATUS;
  return label ? { ...base, label } : base;
}

type SortField = 'created_at' | 'attendee_name' | 'event_name' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

// ============================================================
// IMAGE FALLBACK
// ============================================================

/**
 * Graceful image that hides itself on load failure so the muted
 * gradient background behind it becomes visible instead.
 */
function EventCoverImage({
  src,
  alt,
  className,
  fallbackSize = 'md',
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackSize?: 'sm' | 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  const iconClass =
    fallbackSize === 'sm'
      ? 'h-4 w-4'
      : fallbackSize === 'md'
      ? 'h-6 w-6'
      : 'h-10 w-10';

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
      <Calendar className={`${iconClass} text-muted-foreground/60`} />
    </div>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function HostingTab() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [selectedReg, setSelectedReg] =
    useState<CrossEventRegistration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

  const queryParams: ListAllRegistrationsParams = useMemo(
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
  } = useListAllRegistrationsQuery(queryParams);

  const payload = response?.data;
  const registrations: CrossEventRegistration[] = payload?.registrations ?? [];
  const total = payload?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const errorMessage = error
    ? (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load registrations'
    : null;

  const isRowSelected = (r: CrossEventRegistration) => selectedIds.includes(r.id);

  const selectedRegs = useMemo(
    () => registrations.filter((r) => selectedIds.includes(r.id)),
    [registrations, selectedIds],
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
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />;
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
      setSelectedIds(registrations.map((r) => r.id));
      setSelectAll(true);
    }
  };

  const handleSelectOne = (r: CrossEventRegistration) => {
    setSelectedIds((prev) =>
      prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id],
    );
  };

  const handleView = (reg: CrossEventRegistration) => {
    setSelectedReg(reg);
    setIsViewDialogOpen(true);
  };

  const handleViewFirstSelected = () => {
    if (selectedRegs.length === 1) handleView(selectedRegs[0]);
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
    setSortField('created_at');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      created_at: 'Newest',
      attendee_name: 'Name',
      event_name: 'Event',
      status: 'Status',
    };
    return labels[sortField];
  };

  const handleExport = async (format: ExportFormat) => {
    if (registrations.length === 0) return;
    setIsExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);

      const filtersSummary =
        [
          searchQuery ? `Search: "${searchQuery}"` : null,
          selectedStatus !== 'all' ? `Status: ${selectedStatus}` : null,
        ]
          .filter(Boolean)
          .join('  ·  ') || undefined;

      if (format === 'csv') {
        exportRegistrationsToCSV(registrations, `registrations-${stamp}.csv`);
      } else if (format === 'json') {
        exportRegistrationsToJSON(registrations, `registrations-${stamp}.json`);
      } else if (format === 'xlsx') {
        await exportRegistrationsToExcel(
          registrations,
          `registrations-${stamp}.xlsx`,
        );
      } else if (format === 'pdf') {
        await exportRegistrationsToPDF(registrations, {
          title: 'Registrations',
          subtitle: 'Across all your events',
          filtersSummary,
          filename: `registrations-${stamp}.pdf`,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
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

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[190px] cursor-pointer">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All statuses
                    </SelectItem>
                    {STATUS_FILTER_OPTIONS.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="cursor-pointer"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="cursor-pointer w-full md:w-auto shrink-0"
                      disabled={isExporting || registrations.length === 0}
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
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
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleExport('xlsx')}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleExport('csv')}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => handleExport('json')}
                    >
                      <FileJson className="h-4 w-4 mr-2" />
                      JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
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
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
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
                      <SelectTrigger className="h-8 w-[140px] text-xs border-0 bg-transparent focus:ring-0 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at" className="text-sm cursor-pointer">
                          Newest first
                        </SelectItem>
                        <SelectItem value="attendee_name" className="text-sm cursor-pointer">
                          Name
                        </SelectItem>
                        <SelectItem value="event_name" className="text-sm cursor-pointer">
                          Event
                        </SelectItem>
                        <SelectItem value="status" className="text-sm cursor-pointer">
                          Status
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() =>
                        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                      }
                      className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer"
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
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
                    {total} registration{total !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
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
                  {selectedIds.length} registration
                  {selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  {selectedRegs.length === 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={handleViewFirstSelected}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View details
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading / Error / Table / Grid */}
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
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                      onClick={() => toggleSort('attendee_name')}
                    >
                      <div className="flex items-center">
                        Attendee
                        {getSortIcon('attendee_name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                      onClick={() => toggleSort('event_name')}
                    >
                      <div className="flex items-center">
                        Event
                        {getSortIcon('event_name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">Ticket</TableHead>
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                      onClick={() => toggleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Registered
                        {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length > 0 ? (
                    registrations.map((r) => {
                      const s = getStatusVisual(r.status, r.status_label);
                      const StatusIcon = s.icon;
                      const isSelected = isRowSelected(r);

                      return (
                        <TableRow
                          key={r.id}
                          className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleSelectOne(r)}
                        >
                          <TableCell
                            className="py-4 px-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectOne(r)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials(r.attendee_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-foreground break-words">
                                    {r.attendee_name || '—'}
                                  </p>
                                  {r.is_guest && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] shrink-0"
                                    >
                                      Guest
                                    </Badge>
                                  )}
                                </div>
                                {r.email ? (
                                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3 shrink-0 mt-0.5" />
                                    <span className="break-all">{r.email}</span>
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground italic">
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
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                <EventCoverImage
                                  src={r.event_image_url}
                                  alt={r.event_name}
                                  className="h-full w-full object-cover"
                                  fallbackSize="sm"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground break-words">
                                  {r.event_name}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  <span>{formatDate(r.event_start_date)}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge
                              variant="outline"
                              className={`${s.color} border`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${s.dot}`}
                              />
                              {s.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-muted-foreground">
                            {r.ticket_name || '—'}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-sm text-muted-foreground">
                            {formatDate(r.created_at)}
                          </TableCell>
                          <TableCell
                            className="py-4 px-4 text-right"
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
                                  onClick={() => handleView(r)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    router.push(`/dashboard/events/${r.event_id}`)
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
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
                      <SelectItem value="5" className="cursor-pointer">5</SelectItem>
                      <SelectItem value="10" className="cursor-pointer">10</SelectItem>
                      <SelectItem value="20" className="cursor-pointer">20</SelectItem>
                      <SelectItem value="50" className="cursor-pointer">50</SelectItem>
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
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {registrations.length > 0 ? (
              registrations.map((r) => {
                const s = getStatusVisual(r.status, r.status_label);
                const StatusIcon = s.icon;
                const isSelected = isRowSelected(r);

                return (
                  <Card
                    key={r.id}
                    className={`group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${
                      isSelected ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelectOne(r)}
                  >
                    {/* ── Cover image banner ─────────────────────── */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      <EventCoverImage
                        src={r.event_image_url}
                        alt={r.event_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackSize="lg"
                      />

                      {/* Status / guest badges float over the image */}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 flex-wrap justify-end max-w-[calc(100%-1rem)]">
                        {r.is_guest && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-background/85 backdrop-blur-sm shrink-0"
                          >
                            Guest
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`${s.color} border bg-background/90 backdrop-blur-sm shrink-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {s.label}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* ── Attendee ─────────────────────────── */}
                      <div className="flex items-start gap-3">
                        {!isMobile && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectOne(r)}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-pointer mt-0.5 shrink-0"
                          />
                        )}
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initials(r.attendee_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground break-words">
                            {r.attendee_name || '—'}
                          </h3>
                          {r.email ? (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 shrink-0 mt-0.5" />
                              <span className="break-all">{r.email}</span>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
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

                      {/* ── Event ────────────────────────────── */}
                      <div className="space-y-1 text-xs">
                        <p className="font-medium text-foreground break-words">
                          {r.event_name}
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{formatDate(r.event_start_date)}</span>
                        </div>
                      </div>

                      {/* ── Ticket + date ────────────────────── */}
                      <div className="flex items-start justify-between pt-2 border-t border-border text-xs gap-3">
                        <span className="text-muted-foreground min-w-0">
                          Ticket:{' '}
                          <span className="font-medium text-foreground break-words">
                            {r.ticket_name || '—'}
                          </span>
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {formatDate(r.created_at)}
                        </span>
                      </div>

                      {/* ── Actions ──────────────────────────── */}
                      <div
                        className="flex items-center justify-between pt-2 border-t border-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="cursor-pointer h-7 text-xs px-2 -ml-2 text-primary hover:text-primary hover:bg-primary/5"
                          onClick={() => handleView(r)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View details
                        </Button>
                        {!isMobile && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0 cursor-pointer"
                              >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleView(r)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  router.push(`/dashboard/events/${r.event_id}`)
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
                  <p className="font-medium">No registrations found</p>
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
                  <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="cursor-pointer">5</SelectItem>
                    <SelectItem value="10" className="cursor-pointer">10</SelectItem>
                    <SelectItem value="20" className="cursor-pointer">20</SelectItem>
                    <SelectItem value="50" className="cursor-pointer">50</SelectItem>
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
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
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

      {/* Mobile filter strip — floats ABOVE the bottom tab bar */}
      {isMobile && (
        <div
          className="fixed inset-x-0 z-40 px-4 pointer-events-none"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
        >
          <div className="pointer-events-auto mx-auto max-w-md bg-background/90 backdrop-blur-md rounded-full shadow-lg border border-border/70">
            <div className="flex items-center justify-between px-4 py-2.5 gap-2">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 hover:bg-muted rounded-full px-3 py-1.5 transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {searchInput || 'Search'}
                </span>
              </button>

              <div className="w-px h-6 bg-border flex-shrink-0" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 hover:bg-muted rounded-full px-3 py-1.5 transition-colors relative cursor-pointer"
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
                className="flex items-center gap-1.5 hover:bg-muted rounded-full px-3 py-1.5 transition-colors cursor-pointer"
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
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your registration list
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-11 rounded-xl w-full cursor-pointer">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All statuses
                    </SelectItem>
                    {STATUS_FILTER_OPTIONS.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="cursor-pointer"
                      >
                        {s.label}
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
                  <SelectTrigger className="h-11 rounded-xl cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at" className="cursor-pointer">
                      Newest first
                    </SelectItem>
                    <SelectItem value="attendee_name" className="cursor-pointer">
                      Name
                    </SelectItem>
                    <SelectItem value="event_name" className="cursor-pointer">
                      Event
                    </SelectItem>
                    <SelectItem value="status" className="cursor-pointer">
                      Status
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className="h-11 rounded-xl cursor-pointer"
                    onClick={() => setSortDirection('asc')}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Ascending
                  </Button>
                  <Button
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="h-11 rounded-xl cursor-pointer"
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
                className="flex-1 h-11 rounded-xl cursor-pointer"
                onClick={() => {
                  resetFilters();
                  setIsFilterSheetOpen(false);
                }}
              >
                Reset All
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl cursor-pointer"
                onClick={() => setIsFilterSheetOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Detail dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>Registration for one event.</DialogDescription>
          </DialogHeader>

          {selectedReg && (
            <div className="space-y-4 sm:space-y-6">
              {/* Event cover banner inside the dialog too */}
              {selectedReg.event_image_url && (
                <div className="relative -mx-6 -mt-2 aspect-[16/9] overflow-hidden bg-muted">
                  <EventCoverImage
                    src={selectedReg.event_image_url}
                    alt={selectedReg.event_name}
                    className="h-full w-full object-cover"
                    fallbackSize="lg"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 sm:gap-4">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg">
                    {initials(selectedReg.attendee_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold break-words">
                      {selectedReg.attendee_name || '—'}
                    </h3>
                    {selectedReg.is_guest && (
                      <Badge variant="outline" className="text-[10px]">
                        Guest
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                    {selectedReg.email || 'No email on file'}
                  </p>
                  {selectedReg.phone && (
                    <p className="text-xs sm:text-sm text-muted-foreground break-words flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0" />
                      {selectedReg.phone}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 min-w-0">
                  <Label className="text-xs text-muted-foreground">Event</Label>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {selectedReg.event_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedReg.event_start_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge
                    variant="outline"
                    className={`${
                      getStatusVisual(selectedReg.status, selectedReg.status_label)
                        .color
                    } border mt-1`}
                  >
                    {
                      getStatusVisual(selectedReg.status, selectedReg.status_label)
                        .label
                    }
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Registration #
                  </Label>
                  <p className="text-sm font-mono break-all">
                    {selectedReg.registration_number}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ticket</Label>
                  <p className="text-sm break-words">
                    {selectedReg.ticket_name || '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Format</Label>
                  <p className="text-sm">
                    {selectedReg.is_hybrid
                      ? 'Hybrid'
                      : selectedReg.is_virtual
                      ? 'Virtual'
                      : 'In person'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="text-sm break-words">
                    {selectedReg.is_virtual && !selectedReg.is_hybrid
                      ? 'Online'
                      : selectedReg.in_person_location ||
                        [
                          selectedReg.venue_name,
                          selectedReg.venue_city,
                          selectedReg.venue_country,
                        ]
                          .filter(Boolean)
                          .join(', ') ||
                        '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Registered
                  </Label>
                  <p className="text-sm">{formatDate(selectedReg.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Attendee type
                  </Label>
                  <p className="text-sm">
                    {selectedReg.is_guest ? 'Guest' : 'Account'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm cursor-pointer"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    router.push(
                      `/dashboard/events/${selectedReg.event_id}/registrations`,
                    );
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2 shrink-0" />
                  <span className="break-words text-left">
                    Event Registrations
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm cursor-pointer"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    router.push(`/dashboard/events/${selectedReg.event_id}`);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2 shrink-0" />
                  <span className="break-words text-left">Go to Event</span>
                </Button>
              </div>

              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
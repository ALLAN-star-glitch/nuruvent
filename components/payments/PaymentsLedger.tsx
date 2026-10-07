/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid3x3,
  List,
  Loader2,
  MoreVertical,
  Receipt,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';



import { MethodBadge, getMethodVisual } from './method-badge';
import {
  ExportPaymentsDialog,
  type ExportFormat,
} from './export-payments-dialog';
import { PaymentsListSkeleton } from './skeleton-loaders';

import {
  useListPaymentsQuery,
  useGetPaymentStatsQuery,
} from '@/lib/store/api/paymentsApi';
import { useListMyEventsQuery } from '@/lib/store/api/eventsApi';
import {
  exportPaymentsToCSV,
  exportPaymentsToExcel,
  exportPaymentsToJSON,
  exportPaymentsToPDF,
} from '@/lib/utils/exportPayments';
import type {
  PaymentListItem,
  ListPaymentsParams,
  PaymentStats,
} from '@/lib/types/payments';
import { EmptyState } from '../registrations/empty_state';
import { MobileFilterStrip } from '../registrations/mobile-filter-strip';
import { StatsCards } from '../registrations/stat_cards';
import { StatusBadge } from '../registrations/status_badge';

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

function formatCurrency(minor: number, currency: string = 'KES'): string {
  const amount = (minor ?? 0) / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function slugifyReportName(name: string): string {
  const slug = (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'payments';
}

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_FILTER_OPTIONS = [
  { value: 'succeeded', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'expired', label: 'Expired' },
];

const METHOD_FILTER_OPTIONS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Card' },
];

type SortField = 'created_at' | 'amount' | 'completed_at';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

// ============================================================
// COMPONENT
// ============================================================

export interface PaymentsLedgerProps {
  eventId?: string;
  compact?: boolean;
}

export function PaymentsLedger({ eventId, compact }: PaymentsLedgerProps) {
  const isScoped = !!eventId;
  const isCompact = compact ?? isScoped;

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [selectedPayment, setSelectedPayment] = useState<PaymentListItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);

  // ---- Responsive ----
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile('matches' in e ? e.matches : mql.matches);
    };
    onChange(mql);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const effectiveEventId =
    eventId ?? (selectedEventId === 'all' ? undefined : selectedEventId);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatus,
    selectedMethod,
    selectedEventId,
    sortField,
    sortDirection,
    itemsPerPage,
    eventId,
  ]);

  const { data: eventsResponse } = useListMyEventsQuery(
    { page: 1, page_size: 100, sort_by: 'created_at', sort_order: 'desc' },
    { skip: isScoped },
  );

  const events = useMemo(() => {
    const list = eventsResponse?.data?.data ?? [];
    return list.map((e) => ({
      id: e.id,
      title: e.display_name || e.name || 'Untitled event',
    }));
  }, [eventsResponse]);

  const queryParams: ListPaymentsParams = useMemo(
    () => ({
      page: currentPage,
      page_size: itemsPerPage,
      search: searchQuery || undefined,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      method: selectedMethod === 'all' ? undefined : selectedMethod,
      event_id: effectiveEventId,
      sort_by: sortField,
      sort_order: sortDirection,
    }),
    [
      currentPage,
      itemsPerPage,
      searchQuery,
      selectedStatus,
      selectedMethod,
      effectiveEventId,
      sortField,
      sortDirection,
    ],
  );

  const {
    data: listResponse,
    isLoading,
    isFetching,
    error,
  } = useListPaymentsQuery(queryParams);

  const { data: statsResponse } = useGetPaymentStatsQuery(
    effectiveEventId ? { event_id: effectiveEventId } : undefined,
  );

  const payments: PaymentListItem[] = listResponse?.data?.payments ?? [];
  const total = listResponse?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const stats: PaymentStats = statsResponse?.data ?? {
    total_revenue: 0,
    total_platform_fees: 0,
    total_processing_fees: 0,
    total_net: 0,
    transaction_count: 0,
    currency: 'KES',
    by_status: {},
  };

  const errorMessage = error
    ? (error as { data?: { message?: string } })?.data?.message ??
      'Failed to load payments'
    : null;

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
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary" />
    );
  };

  const handleView = (payment: PaymentListItem) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const getActiveFilterCount = () => {
    let n = 0;
    if (searchQuery) n++;
    if (selectedStatus !== 'all') n++;
    if (selectedMethod !== 'all') n++;
    if (!isScoped && selectedEventId !== 'all') n++;
    return n;
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedMethod('all');
    setSelectedEventId('all');
    setSortField('created_at');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      created_at: 'Newest',
      amount: 'Amount',
      completed_at: 'Completed',
    };
    return labels[sortField];
  };

  const defaultReportName = () => {
    const month = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (isScoped || effectiveEventId) {
      const ev = events.find((e) => e.id === effectiveEventId);
      return ev ? `${ev.title} — Payments ${month}` : `Payments ${month}`;
    }
    return `Payments Report — ${month}`;
  };

  const filtersSummary = () =>
    [
      searchQuery ? `Search: "${searchQuery}"` : null,
      selectedStatus !== 'all' ? `Status: ${selectedStatus}` : null,
      selectedMethod !== 'all' ? `Method: ${selectedMethod}` : null,
      effectiveEventId
        ? `Event: ${
            events.find((e) => e.id === effectiveEventId)?.title ?? effectiveEventId
          }`
        : null,
    ]
      .filter(Boolean)
      .join('  ·  ') || undefined;

  const handleExport = async (format: ExportFormat, name: string) => {
    if (payments.length === 0) return;
    setIsExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const filenameBase = `${slugifyReportName(name)}-${stamp}`;
      const summary = filtersSummary();

      if (format === 'csv') {
        exportPaymentsToCSV(payments, `${filenameBase}.csv`);
      } else if (format === 'json') {
        exportPaymentsToJSON(payments, `${filenameBase}.json`);
      } else if (format === 'xlsx') {
        await exportPaymentsToExcel(payments, `${filenameBase}.xlsx`);
      } else if (format === 'pdf') {
        await exportPaymentsToPDF(payments, {
          title: name.trim() || 'Payments',
          subtitle: isScoped
            ? 'Payments for this event'
            : 'Across all your events',
          filtersSummary: summary,
          filename: `${filenameBase}.pdf`,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const openExportDialog = (format: ExportFormat) => {
    setExportFormat(format);
  };

  const eventTitle = effectiveEventId
    ? events.find((e) => e.id === effectiveEventId)?.title
    : undefined;

  return (
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'pb-24' : ''}`}>
      {/* Header — unscoped only */}
      {!isScoped && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Payments
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Track payments across your events and see what you&apos;ll receive.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full cursor-pointer sm:w-auto"
                disabled={isExporting || payments.length === 0}
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
                onClick={() => openExportDialog('pdf')}
              >
                <FileText className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('xlsx')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('csv')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('json')}
              >
                <FileJson className="mr-2 h-4 w-4" /> JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Compact export — scoped view */}
      {isScoped && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={isExporting || payments.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3.5 w-3.5" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('pdf')}
              >
                <FileText className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('xlsx')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('csv')}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openExportDialog('json')}
              >
                <FileJson className="mr-2 h-4 w-4" /> JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Loading state — full skeleton */}
      {isLoading ? (
        <PaymentsListSkeleton
          compact={isCompact}
          view={isMobile ? 'grid' : viewMode}
        />
      ) : (
        <>
          {/* Stats */}
          <StatsCards
            stats={[
              {
                label: 'Total Revenue',
                value: formatCurrency(stats.total_revenue, stats.currency),
                sub: 'gross earnings',
                tone: 'primary',
                icon: <DollarSign className="h-4 w-4" />,
              },
              {
                label: 'Platform Fee',
                value: formatCurrency(stats.total_platform_fees, stats.currency),
                sub: 'Nuruvent charge',
                tone: 'amber',
                icon: <Receipt className="h-4 w-4" />,
              },
              {
                label: 'Processing',
                value: formatCurrency(
                  stats.total_processing_fees,
                  stats.currency,
                ),
                sub: 'payment provider',
                tone: 'sky',
                icon: <CreditCard className="h-4 w-4" />,
              },
              {
                label: 'You Receive',
                value: formatCurrency(stats.total_net, stats.currency),
                sub: 'net to payout',
                tone: 'emerald',
                icon: <TrendingUp className="h-4 w-4" />,
              },
            ]}
          />

          {/* Desktop filters */}
          {!isMobile && (
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-4">
                    <div className="relative w-full flex-1 lg:min-w-[220px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by attendee, event, or transaction ID…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-9"
                      />
                    </div>

                    {!isScoped && (
                      <Select
                        value={selectedEventId}
                        onValueChange={setSelectedEventId}
                      >
                        <SelectTrigger className="w-full cursor-pointer lg:w-[200px]">
                          <SelectValue placeholder="All events" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">
                            All events
                          </SelectItem>
                          {events.map((e) => (
                            <SelectItem
                              key={e.id}
                              value={e.id}
                              className="cursor-pointer"
                            >
                              <span className="inline-block max-w-[180px] truncate align-middle">
                                {e.title}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full cursor-pointer lg:w-[150px]">
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

                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger className="w-full cursor-pointer lg:w-[150px]">
                        <SelectValue placeholder="All methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-pointer">
                          All methods
                        </SelectItem>
                        {METHOD_FILTER_OPTIONS.map((m) => (
                          <SelectItem
                            key={m.value}
                            value={m.value}
                            className="cursor-pointer"
                          >
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border pt-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`cursor-pointer rounded-md p-1.5 transition-colors ${
                            viewMode === 'table'
                              ? 'bg-background text-primary shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Table View"
                          aria-label="Table view"
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
                          aria-label="Grid view"
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
                            setSortDirection('desc');
                          }}
                        >
                          <SelectTrigger className="h-8 w-[130px] cursor-pointer border-0 bg-transparent text-xs focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="created_at"
                              className="cursor-pointer text-sm"
                            >
                              Newest first
                            </SelectItem>
                            <SelectItem
                              value="amount"
                              className="cursor-pointer text-sm"
                            >
                              Amount
                            </SelectItem>
                            <SelectItem
                              value="completed_at"
                              className="cursor-pointer text-sm"
                            >
                              Completed
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
                          title={
                            sortDirection === 'asc' ? 'Ascending' : 'Descending'
                          }
                          aria-label={
                            sortDirection === 'asc'
                              ? 'Sort ascending'
                              : 'Sort descending'
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

                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isFetching && !isLoading && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {total} payment{total !== 1 ? 's' : ''}
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
              </CardContent>
            </Card>
          )}

          {/* Body */}
          {errorMessage ? (
            <Card className="border-destructive/30">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <p className="text-sm">{errorMessage}</p>
              </CardContent>
            </Card>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-5 w-5 text-primary" />}
              eyebrow="Payments"
              title="No payments yet"
              sub={
                getActiveFilterCount() > 0
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Once attendees start paying, transactions will appear here.'
              }
            />
          ) : !isMobile && viewMode === 'table' ? (
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[720px]">
                    <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead
                          className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                          onClick={() => toggleSort('created_at')}
                        >
                          <div className="flex items-center">
                            Attendee
                            {getSortIcon('created_at')}
                          </div>
                        </TableHead>
                        {!isCompact && (
                          <TableHead className="px-4 py-3">Event</TableHead>
                        )}
                        <TableHead
                          className="cursor-pointer select-none px-4 py-3 transition-colors hover:text-primary"
                          onClick={() => toggleSort('amount')}
                        >
                          <div className="flex items-center">
                            Amount
                            {getSortIcon('amount')}
                          </div>
                        </TableHead>
                        <TableHead className="px-4 py-3">Net</TableHead>
                        <TableHead className="px-4 py-3">Status</TableHead>
                        <TableHead className="px-4 py-3">Method</TableHead>
                        <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow
                          key={p.id}
                          className="transition-colors hover:bg-muted/40"
                        >
                          <TableCell className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials(p.attendee_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="break-words font-semibold text-foreground">
                                  {p.attendee_name || '—'}
                                </p>
                                {p.attendee_email && (
                                  <p className="break-all text-xs text-muted-foreground">
                                    {p.attendee_email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          {!isCompact && (
                            <TableCell className="px-4 py-4">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-medium text-foreground">
                                  {p.event_title || '—'}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  <span>{formatDate(p.event_start_date)}</span>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="px-4 py-4">
                            <p className="whitespace-nowrap font-semibold text-foreground">
                              {formatCurrency(p.amount, p.currency)}
                            </p>
                            <p className="whitespace-nowrap text-xs text-amber-600 dark:text-amber-400">
                              Fees:{' '}
                              {formatCurrency(
                                p.platform_fee + p.processing_fee,
                                p.currency,
                              )}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <p className="whitespace-nowrap font-semibold text-emerald-600">
                              {formatCurrency(p.net_to_organizer, p.currency)}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge
                              status={p.status}
                              label={p.status_label}
                              variant="icon"
                            />
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <MethodBadge
                              method={p.method}
                              label={p.method_label}
                            />
                            <p className="mt-1 max-w-[160px] break-all text-xs text-muted-foreground">
                              {p.transaction_id || '—'}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-right">
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
                                  onClick={() => handleView(p)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
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
                          {[5, 10, 20, 50].map((n) => (
                            <SelectItem
                              key={n}
                              value={String(n)}
                              className="cursor-pointer"
                            >
                              {n}
                            </SelectItem>
                          ))}
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
                          aria-label="Previous page"
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
                          aria-label="Next page"
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
              {/* Grid view */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {payments.map((p) => (
                  <Card
                    key={p.id}
                    className="group cursor-pointer overflow-hidden border-border/70 transition-all duration-200 hover:shadow-lg"
                    onClick={() => handleView(p)}
                  >
                    <CardContent className="space-y-3 p-3 sm:p-4">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <StatusBadge
                          status={p.status}
                          label={p.status_label}
                          variant="icon"
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary sm:text-sm">
                            {initials(p.attendee_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-semibold text-foreground sm:text-base">
                            {p.attendee_name || '—'}
                          </h3>
                          {p.attendee_email && (
                            <p className="line-clamp-1 break-all text-xs text-muted-foreground">
                              {p.attendee_email}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isCompact && (
                        <div className="space-y-1 text-xs">
                          <p className="line-clamp-2 break-words font-medium text-foreground">
                            {p.event_title || '—'}
                          </p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{formatDate(p.event_start_date)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-xs">
                        <span className="truncate text-muted-foreground">
                          Amount:{' '}
                          <span className="font-medium text-foreground">
                            {formatCurrency(p.amount, p.currency)}
                          </span>
                        </span>
                        <MethodBadge method={p.method} label={p.method_label} />
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-xs">
                        <span className="truncate text-muted-foreground">
                          Net:{' '}
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(p.net_to_organizer, p.currency)}
                          </span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-primary">
                          View
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                        {[5, 10, 20, 50].map((n) => (
                          <SelectItem
                            key={n}
                            value={String(n)}
                            className="cursor-pointer"
                          >
                            {n}
                          </SelectItem>
                        ))}
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
                        aria-label="Previous page"
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
                        aria-label="Next page"
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
            <MobileFilterStrip
              searchValue={searchInput}
              onSearchClick={() => setIsFilterSheetOpen(true)}
              filterCount={getActiveFilterCount()}
              onFilterClick={() => setIsFilterSheetOpen(true)}
              sortLabel={getSortLabel()}
              sortDirection={sortDirection}
              onSortClick={() => setIsFilterSheetOpen(true)}
            />
          )}
        </>
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
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your payment list
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex-1 overflow-y-auto pb-6">
              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search payments…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
              </div>

              {!isScoped && (
                <div className="mb-5 space-y-1.5">
                  <Label className="text-sm font-medium">Event</Label>
                  <Select
                    value={selectedEventId}
                    onValueChange={setSelectedEventId}
                  >
                    <SelectTrigger className="h-11 w-full cursor-pointer rounded-xl">
                      <SelectValue placeholder="All events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">
                        All events
                      </SelectItem>
                      {events.map((e) => (
                        <SelectItem
                          key={e.id}
                          value={e.id}
                          className="cursor-pointer"
                        >
                          <span className="inline-block max-w-[260px] truncate align-middle">
                            {e.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="h-11 w-full cursor-pointer rounded-xl">
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

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-sm font-medium">Method</Label>
                  <Select
                    value={selectedMethod}
                    onValueChange={setSelectedMethod}
                  >
                    <SelectTrigger className="h-11 w-full cursor-pointer rounded-xl">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">
                        All methods
                      </SelectItem>
                      {METHOD_FILTER_OPTIONS.map((m) => (
                        <SelectItem
                          key={m.value}
                          value={m.value}
                          className="cursor-pointer"
                        >
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                    <SelectItem value="created_at" className="cursor-pointer">
                      Newest first
                    </SelectItem>
                    <SelectItem value="amount" className="cursor-pointer">
                      Amount
                    </SelectItem>
                    <SelectItem value="completed_at" className="cursor-pointer">
                      Completed
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

      {/* Payment detail dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Payment details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View payment, attendee, and fee breakdown.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-bold text-foreground sm:text-2xl">
                    {formatCurrency(
                      selectedPayment.amount,
                      selectedPayment.currency,
                    )}
                  </h2>
                  <p className="break-all text-xs text-muted-foreground sm:text-sm">
                    {selectedPayment.registration_number ||
                      selectedPayment.id.slice(0, 8)}
                  </p>
                </div>
                <StatusBadge
                  status={selectedPayment.status}
                  label={selectedPayment.status_label}
                  variant="icon"
                  className="shrink-0"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Attendee
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {initials(selectedPayment.attendee_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium">
                        {selectedPayment.attendee_name}
                      </p>
                      <p className="break-all text-xs text-muted-foreground">
                        {selectedPayment.attendee_email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-xs text-muted-foreground">Event</Label>
                  <p className="mt-1 break-words text-sm font-medium">
                    {selectedPayment.event_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedPayment.event_start_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Method</Label>
                  <div className="mt-1">
                    <MethodBadge
                      method={selectedPayment.method}
                      label={selectedPayment.method_label}
                    />
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Transaction ID
                  </Label>
                  <p className="mt-1 break-all font-mono text-sm font-medium">
                    {selectedPayment.transaction_id || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Initiated
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedPayment.initiated_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Completed
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedPayment.completed_at)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">
                  Fee breakdown
                </Label>
                <div className="space-y-2 rounded-lg bg-muted/40 p-3 sm:p-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Amount charged</span>
                    <span className="whitespace-nowrap font-medium">
                      {formatCurrency(
                        selectedPayment.amount,
                        selectedPayment.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Platform fee (
                      {Math.round(selectedPayment.platform_fee_rate * 10000) /
                        100}
                      %)
                    </span>
                    <span className="whitespace-nowrap font-medium text-amber-600">
                      −
                      {formatCurrency(
                        selectedPayment.platform_fee,
                        selectedPayment.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Processing (
                      {Math.round(selectedPayment.processing_fee_rate * 10000) /
                        100}
                      %)
                    </span>
                    <span className="whitespace-nowrap font-medium text-muted-foreground">
                      −
                      {formatCurrency(
                        selectedPayment.processing_fee,
                        selectedPayment.currency,
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold">You receive</span>
                    <span className="whitespace-nowrap font-bold text-emerald-600">
                      {formatCurrency(
                        selectedPayment.net_to_organizer,
                        selectedPayment.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="w-full cursor-pointer sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export dialog */}
      <ExportPaymentsDialog
        open={exportFormat !== null}
        onOpenChange={(open) => !open && setExportFormat(null)}
        format={exportFormat}
        defaultName={defaultReportName()}
        paymentsCount={payments.length}
        eventTitle={eventTitle}
        filtersSummary={filtersSummary()}
        isExporting={isExporting}
        onExport={handleExport}
      />
    </div>
  );
}
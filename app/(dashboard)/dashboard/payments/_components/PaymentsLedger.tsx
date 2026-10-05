/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, CreditCard, Calendar, MoreVertical, Eye, Download,
  CheckCircle2, XCircle, Clock as ClockIcon, AlertCircle, Filter,
  TrendingUp, DollarSign, Receipt, FileText, FileSpreadsheet, FileJson,
  Loader2, Grid3x3, List, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, X, ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';

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
import { PaymentListItem, ListPaymentsParams, PaymentStats } from '@/lib/types/payments';

// ============================================================
// STATUS / METHOD DISPLAY
// ============================================================

interface StatusDisplay {
  label: string;
  color: string;
  dot: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusConfig: Record<string, StatusDisplay> = {
  succeeded: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    dot: 'bg-amber-500',
    icon: ClockIcon,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
    icon: AlertCircle,
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

const methodConfig: Record<string, { label: string; color: string }> = {
  mpesa: {
    label: 'M-Pesa',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  },
  card: {
    label: 'Card',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
  },
};

const FALLBACK_METHOD = {
  label: 'Unknown',
  color: 'bg-muted text-muted-foreground border-border',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'succeeded', label: 'Completed' },
  { value: 'pending',   label: 'Pending' },
  { value: 'failed',    label: 'Failed' },
  { value: 'refunded',  label: 'Refunded' },
  { value: 'expired',   label: 'Expired' },
];

const METHOD_FILTER_OPTIONS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card',  label: 'Card' },
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

function formatCurrency(minor: number, currency: string = 'KES'): string {
  const amount = (minor ?? 0) / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusVisual(slug: string, label?: string): StatusDisplay {
  const base = statusConfig[(slug ?? '').toLowerCase()] ?? FALLBACK_STATUS;
  return label ? { ...base, label } : base;
}

function getMethodVisual(slug: string, label?: string) {
  const base = methodConfig[(slug ?? '').toLowerCase()] ?? FALLBACK_METHOD;
  return label ? { ...base, label } : base;
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

type SortField = 'created_at' | 'amount' | 'completed_at';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

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
  const [reportName, setReportName] = useState('');

  // ---- Responsive breakpoint -----------------------------------
  // Use matchMedia instead of resize so we get the correct value
  // on first paint (no layout shift) and less main-thread churn.
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
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />
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

  const openExportDialog = (format: ExportFormat) => {
    setReportName(defaultReportName());
    setExportFormat(format);
  };

  const handleExport = async (format: ExportFormat, name: string) => {
    if (payments.length === 0) return;
    setIsExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const filenameBase = `${slugifyReportName(name)}-${stamp}`;

      const filtersSummary =
        [
          searchQuery ? `Search: "${searchQuery}"` : null,
          selectedStatus !== 'all' ? `Status: ${selectedStatus}` : null,
          selectedMethod !== 'all' ? `Method: ${selectedMethod}` : null,
          effectiveEventId
            ? `Event: ${events.find((e) => e.id === effectiveEventId)?.title ?? effectiveEventId}`
            : null,
        ]
          .filter(Boolean)
          .join('  ·  ') || undefined;

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
          filtersSummary,
          filename: `${filenameBase}.pdf`,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    // Bottom padding on mobile reserves space for the fixed filter bar.
    <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'pb-24' : ''}`}>
      {/* Header — only when NOT scoped. */}
      {!isScoped && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Track payments across your events and see what you&apos;ll receive.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer w-full sm:w-auto"
                disabled={isExporting || payments.length === 0}
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
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('pdf')}>
                <FileText className="h-4 w-4 mr-2" />PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('xlsx')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('json')}>
                <FileJson className="h-4 w-4 mr-2" />JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Compact export — scoped view only */}
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
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('pdf')}>
                <FileText className="h-4 w-4 mr-2" />PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('xlsx')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openExportDialog('json')}>
                <FileJson className="h-4 w-4 mr-2" />JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Stats — 2-up on small screens, 4-up on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                  Total Revenue
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground mt-1 break-words">
                  {formatCurrency(stats.total_revenue, stats.currency)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-primary/10 text-primary rounded-lg shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                  Platform Fee
                </p>
                <p className="text-lg sm:text-2xl font-bold text-amber-600 mt-1 break-words">
                  {formatCurrency(stats.total_platform_fees, stats.currency)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-lg dark:bg-amber-950/30 shrink-0">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                  Processing
                </p>
                <p className="text-lg sm:text-2xl font-bold text-muted-foreground mt-1 break-words">
                  {formatCurrency(stats.total_processing_fees, stats.currency)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-muted text-muted-foreground rounded-lg shrink-0">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                  You Receive
                </p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600 mt-1 break-words">
                  {formatCurrency(stats.total_net, stats.currency)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950/30 shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop / tablet filters.
          Renders whenever not mobile. Uses a two-row layout:
          row 1 = search + selects (wraps at lg), row 2 = view/sort/count. */}
      {!isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
                <div className="relative flex-1 w-full lg:min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by attendee, event, or transaction ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>

                {!isScoped && (
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="w-full lg:w-[200px] cursor-pointer">
                      <SelectValue placeholder="All events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">
                        All events
                      </SelectItem>
                      {events.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="cursor-pointer">
                          <span className="truncate max-w-[180px] inline-block align-middle">
                            {e.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full lg:w-[150px] cursor-pointer">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All statuses
                    </SelectItem>
                    {STATUS_FILTER_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="cursor-pointer">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger className="w-full lg:w-[150px] cursor-pointer">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All methods
                    </SelectItem>
                    {METHOD_FILTER_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="cursor-pointer">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
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
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
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

                  <span className="text-xs text-muted-foreground hidden sm:inline">|</span>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Sort by:
                    </span>
                    <Select
                      value={sortField}
                      onValueChange={(v) => {
                        setSortField(v as SortField);
                        setSortDirection('desc');
                      }}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-xs border-0 bg-transparent focus:ring-0 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at" className="text-sm cursor-pointer">
                          Newest first
                        </SelectItem>
                        <SelectItem value="amount" className="text-sm cursor-pointer">
                          Amount
                        </SelectItem>
                        <SelectItem value="completed_at" className="text-sm cursor-pointer">
                          Completed
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                      className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer"
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                      aria-label={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
                    >
                      {sortDirection === 'asc' ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between sm:justify-end">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {isFetching && !isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {total} payment{total !== 1 ? 's' : ''}
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
          </CardContent>
        </Card>
      )}

      {/* Body */}
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
              {/* min-w forces horizontal scroll on tablets rather than
                  crushing columns. Sticky header for long lists. */}
              <Table className="min-w-[720px]">
                <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                      onClick={() => toggleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Attendee
                        {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    {!isCompact && (
                      <TableHead className="py-3 px-4">Event</TableHead>
                    )}
                    <TableHead
                      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors select-none"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        {getSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">Net</TableHead>
                    <TableHead className="py-3 px-4">Status</TableHead>
                    <TableHead className="py-3 px-4">Method</TableHead>
                    <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                    payments.map((p) => {
                      const s = getStatusVisual(p.status, p.status_label);
                      const m = getMethodVisual(p.method, p.method_label);
                      const StatusIcon = s.icon;

                      return (
                        <TableRow key={p.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="py-4 px-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials(p.attendee_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground break-words">
                                  {p.attendee_name || '—'}
                                </p>
                                {p.attendee_email && (
                                  <p className="text-xs text-muted-foreground break-all">
                                    {p.attendee_email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          {!isCompact && (
                            <TableCell className="py-4 px-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                  {p.event_image_url ? (
                                    <img
                                      src={p.event_image_url}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground break-words">
                                    {p.event_title || '—'}
                                  </p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 shrink-0" />
                                    <span>{formatDate(p.event_start_date)}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="py-4 px-4">
                            <p className="font-semibold text-foreground whitespace-nowrap">
                              {formatCurrency(p.amount, p.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              Fees: {formatCurrency(p.platform_fee + p.processing_fee, p.currency)}
                            </p>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <p className="font-semibold text-emerald-600 whitespace-nowrap">
                              {formatCurrency(p.net_to_organizer, p.currency)}
                            </p>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${s.color} border whitespace-nowrap`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {s.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${m.color} border whitespace-nowrap`}>
                              {m.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1 break-all max-w-[160px]">
                              {p.transaction_id || '—'}
                            </p>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
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
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
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
                        colSpan={isCompact ? 6 : 7}
                        className="py-12 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-muted-foreground/60" />
                          <p className="font-medium">No payments found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria.</p>
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
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
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
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
          {/* Grid: 1 col on phones, 2 on sm, 3 on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {payments.length > 0 ? (
              payments.map((p) => {
                const s = getStatusVisual(p.status, p.status_label);
                const m = getMethodVisual(p.method, p.method_label);
                const StatusIcon = s.icon;

                return (
                  <Card
                    key={p.id}
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border-border/70"
                    onClick={() => handleView(p)}
                  >
                    {/* Shorter media on phones; 16/9 from sm up */}
                    <div className="relative aspect-[2/1] sm:aspect-[16/9] w-full overflow-hidden bg-muted">
                      {p.event_image_url ? (
                        <img
                          src={p.event_image_url}
                          alt={p.event_title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-secondary/10">
                          <Calendar className="h-10 w-10 text-muted-foreground/60" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 flex-wrap justify-end max-w-[calc(100%-1rem)]">
                        <Badge
                          variant="outline"
                          className={`${s.color} border bg-background/90 backdrop-blur-sm shrink-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {s.label}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3 sm:p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                            {initials(p.attendee_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground break-words text-sm sm:text-base">
                            {p.attendee_name || '—'}
                          </h3>
                          {p.attendee_email && (
                            <p className="text-xs text-muted-foreground break-all line-clamp-1">
                              {p.attendee_email}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isCompact && (
                        <div className="space-y-1 text-xs">
                          <p className="font-medium text-foreground break-words line-clamp-2">
                            {p.event_title || '—'}
                          </p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{formatDate(p.event_start_date)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border text-xs gap-2">
                        <span className="text-muted-foreground truncate">
                          Amount:{' '}
                          <span className="font-medium text-foreground">
                            {formatCurrency(p.amount, p.currency)}
                          </span>
                        </span>
                        <Badge variant="outline" className={`${m.color} border text-xs shrink-0`}>
                          {m.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border text-xs gap-2">
                        <span className="text-muted-foreground truncate">
                          Net:{' '}
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(p.net_to_organizer, p.currency)}
                          </span>
                        </span>
                        <span className="text-primary inline-flex items-center gap-1 shrink-0">
                          View
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <CreditCard className="h-8 w-8 text-muted-foreground/60" />
                  <p className="font-medium">No payments found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria.</p>
                </div>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
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
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

      {/* Mobile filter strip — only mounted on mobile.
          Rendered inline (not fixed) so it never overlaps content,
          and sits right above the bottom of the page. */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md bg-background/95 backdrop-blur-md rounded-full shadow-lg border border-border/70">
            <div className="flex items-center justify-between px-2 py-2 gap-1">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 flex-1 min-w-0 hover:bg-muted rounded-full px-3 py-2 transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {searchInput || 'Search'}
                </span>
              </button>

              <div className="w-px h-6 bg-border flex-shrink-0" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 hover:bg-muted rounded-full px-2.5 py-2 transition-colors relative cursor-pointer shrink-0"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground truncate max-w-[70px]">
                  {getActiveFilterCount() > 0 ? `Filters` : 'Filter'}
                </span>
                {getActiveFilterCount() > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              <div className="w-px h-6 bg-border flex-shrink-0" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1 hover:bg-muted rounded-full px-2.5 py-2 transition-colors cursor-pointer shrink-0"
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
                <SheetTitle className="text-xl font-semibold">Filter & Sort</SheetTitle>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your payment list
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              {!isScoped && (
                <div className="space-y-1.5 mb-5">
                  <Label className="text-sm font-medium">Event</Label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="h-11 rounded-xl w-full cursor-pointer">
                      <SelectValue placeholder="All events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">
                        All events
                      </SelectItem>
                      {events.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="cursor-pointer">
                          <span className="truncate max-w-[260px] inline-block align-middle">
                            {e.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="space-y-1.5 min-w-0">
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
                        <SelectItem key={s.value} value={s.value} className="cursor-pointer">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-sm font-medium">Method</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="h-11 rounded-xl w-full cursor-pointer">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">
                        All methods
                      </SelectItem>
                      {METHOD_FILTER_OPTIONS.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="cursor-pointer">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

      {/* Payment detail dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Payment Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View payment, attendee, and fee breakdown.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 sm:space-y-6">
              {/* Only show the banner if we're not compact AND there's room.
                  Use -mx-4 sm:-mx-6 to match the responsive padding. */}
              {selectedPayment.event_image_url && !isCompact && (
                <div className="relative -mx-4 sm:-mx-6 aspect-[2/1] sm:aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={selectedPayment.event_image_url}
                    alt={selectedPayment.event_title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">
                    {selectedPayment.registration_number || selectedPayment.id.slice(0, 8)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    getStatusVisual(selectedPayment.status, selectedPayment.status_label).color
                  } border shrink-0`}
                >
                  {getStatusVisual(selectedPayment.status, selectedPayment.status_label).label}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Attendee</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials(selectedPayment.attendee_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium break-words">
                        {selectedPayment.attendee_name}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        {selectedPayment.attendee_email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <Label className="text-xs text-muted-foreground">Event</Label>
                  <p className="text-sm font-medium mt-1 break-words">
                    {selectedPayment.event_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedPayment.event_start_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Method</Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`${
                        getMethodVisual(selectedPayment.method, selectedPayment.method_label).color
                      } border`}
                    >
                      {getMethodVisual(selectedPayment.method, selectedPayment.method_label).label}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="text-sm font-mono font-medium mt-1 break-all">
                    {selectedPayment.transaction_id || '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Initiated</Label>
                  <p className="text-sm">{formatDate(selectedPayment.initiated_at)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Completed</Label>
                  <p className="text-sm">{formatDate(selectedPayment.completed_at)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-medium">Fee Breakdown</Label>
                <div className="rounded-lg bg-muted/40 p-3 sm:p-4 space-y-2">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Amount charged</span>
                    <span className="font-medium whitespace-nowrap">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Platform fee ({Math.round(selectedPayment.platform_fee_rate * 10000) / 100}%)
                    </span>
                    <span className="font-medium text-amber-600 whitespace-nowrap">
                      −{formatCurrency(selectedPayment.platform_fee, selectedPayment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Processing ({Math.round(selectedPayment.processing_fee_rate * 10000) / 100}%)
                    </span>
                    <span className="font-medium text-muted-foreground whitespace-nowrap">
                      −{formatCurrency(selectedPayment.processing_fee, selectedPayment.currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold">You receive</span>
                    <span className="font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(selectedPayment.net_to_organizer, selectedPayment.currency)}
                    </span>
                  </div>
                </div>
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

      {/* Report name dialog */}
      <Dialog
        open={exportFormat !== null}
        onOpenChange={(open) => {
          if (!open) {
            setExportFormat(null);
            setReportName('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Give the report a name. It becomes the file name and the title on the PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="report-name" className="text-sm font-medium">
                Report name
              </Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g. Computer Science Webinar — October"
                autoFocus
              />
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payments included</span>
                <span className="font-medium">{payments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium uppercase">{exportFormat}</span>
              </div>
              {effectiveEventId && (
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground shrink-0">Event</span>
                  <span className="font-medium text-right break-words">
                    {events.find((e) => e.id === effectiveEventId)?.title ?? '—'}
                  </span>
                </div>
              )}
              {getActiveFilterCount() > 0 && (
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-border/60">
                  <span className="text-muted-foreground shrink-0">Filters</span>
                  <span className="text-xs text-right break-words">
                    {[
                      searchQuery ? `Search: "${searchQuery}"` : null,
                      selectedStatus !== 'all' ? `Status: ${selectedStatus}` : null,
                      selectedMethod !== 'all' ? `Method: ${selectedMethod}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setExportFormat(null);
                setReportName('');
              }}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!exportFormat) return;
                const fmt = exportFormat;
                const name = reportName;
                setExportFormat(null);
                setReportName('');
                await handleExport(fmt, name);
              }}
              disabled={isExporting || reportName.trim().length === 0}
              className="w-full sm:w-auto cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download {exportFormat?.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
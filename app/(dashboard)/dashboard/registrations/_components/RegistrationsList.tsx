'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock as ClockIcon,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid3x3,
  List,
  Loader2,
  Search,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { RegistrationsGrid } from './RegistrationsGrid';
import { RegistrationsTable } from './RegistrationsTable';
import { EmptyState } from '@/components/registrations/empty_state';
import { MobileFilterStrip } from '@/components/registrations/mobile-filter-strip';
import { StatsCards } from '@/components/registrations/stat_cards';
import { RegistrationsDetailDialog } from './RegistrationsDetailDialog';
import { RegistrationsListSkeleton } from '@/components/registrations/skeleton-loaders';



const STATUS_FILTER_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'attended', label: 'Attended' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'expired', label: 'Expired' },
];

type SortField = 'created_at' | 'attendee_name' | 'event_name' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

export function RegistrationsList() {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [selectedStatus, sortField, sortDirection, itemsPerPage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectAll(false);
  };

  const activeFilterCount = () => {
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

  const sortLabel = () => {
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

  // ---- KPI stats ----
  const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
  const pending = registrations.filter((r) => r.status === 'pending').length;
  const guests = registrations.filter((r) => r.is_guest).length;

  const stats = [
    {
      label: 'Total',
      value: total,
      sub: 'across your events',
      tone: 'primary' as const,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Confirmed',
      value: confirmed,
      sub: 'on this page',
      tone: 'emerald' as const,
    },
    {
      label: 'Pending',
      value: pending,
      sub: 'awaiting payment',
      tone: 'amber' as const,
    },
    {
      label: 'Guests',
      value: guests,
      sub: 'no account',
      tone: 'sky' as const,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Desktop filter card */}
      {!isMobile && (
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-10 rounded-xl pl-10 sm:h-11"
                  />
                </div>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-10 w-full cursor-pointer rounded-xl md:w-[190px] sm:h-11">
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
                      className="h-10 w-full shrink-0 cursor-pointer rounded-xl sm:h-11 md:w-auto"
                      disabled={isExporting || registrations.length === 0}
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
                      <SelectTrigger className="h-8 w-[140px] cursor-pointer border-0 bg-transparent text-xs focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at" className="cursor-pointer text-sm">
                          Newest first
                        </SelectItem>
                        <SelectItem value="attendee_name" className="cursor-pointer text-sm">
                          Name
                        </SelectItem>
                        <SelectItem value="event_name" className="cursor-pointer text-sm">
                          Event
                        </SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">
                          Status
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() =>
                        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                      }
                      className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
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

                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isFetching && !isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {total} registration{total !== 1 ? 's' : ''}
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
                  {selectedIds.length} registration
                  {selectedIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  {selectedRegs.length === 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleView(selectedRegs[0])}
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

      <StatsCards stats={stats} />

            {isLoading ? (
        <RegistrationsListSkeleton />
      ) : errorMessage ? (
              <Card className="border-destructive/30">
          <CardContent className="p-12 text-center text-sm text-destructive sm:p-16">
            {errorMessage}
          </CardContent>
        </Card>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5 text-primary" />}
          eyebrow="Registration center"
          title="No registrations yet"
          sub="Once people register for your events, they'll show up here."
          action={
            <Button
              size="sm"
              className="cursor-pointer rounded-lg"
              onClick={() => router.push('/dashboard/events')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Go to events
            </Button>
          }
        />
      ) : !isMobile && viewMode === 'table' ? (
        <RegistrationsTable
          registrations={registrations}
          total={total}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          isRowSelected={isRowSelected}
          selectAll={selectAll}
          onToggleSort={toggleSort}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onView={handleView}
          onGoToEvent={(id: unknown) => router.push(`/dashboard/events/${id}`)}
          onItemsPerPageChange={setItemsPerPage}
          onPageChange={setCurrentPage}
        />
      ) : (
        <RegistrationsGrid
          registrations={registrations}
          total={total}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          isRowSelected={isRowSelected}
          onSelectOne={handleSelectOne}
          onView={handleView}
          onGoToEvent={(id: unknown) => router.push(`/dashboard/events/${id}`)}
          onItemsPerPageChange={setItemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {isMobile && (
        <MobileFilterStrip
          searchValue={searchInput}
          onSearchClick={() => setIsFilterSheetOpen(true)}
          filterCount={activeFilterCount()}
          onFilterClick={() => setIsFilterSheetOpen(true)}
          sortLabel={sortLabel()}
          sortDirection={sortDirection}
          onSortClick={() => setIsFilterSheetOpen(true)}
        />
      )}

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
                Refine your registration list
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex-1 overflow-y-auto pb-6">
              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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

      <RegistrationsDetailDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        registration={selectedReg}
        onGoToEvent={(id: unknown) => {
          setIsViewDialogOpen(false);
          router.push(`/dashboard/events/${id}`);
        }}
        onGoToEventRegistrations={(id: unknown) => {
          setIsViewDialogOpen(false);
          router.push(`/dashboard/events/${id}/registrations`);
        }}
      />
    </div>
  );
}
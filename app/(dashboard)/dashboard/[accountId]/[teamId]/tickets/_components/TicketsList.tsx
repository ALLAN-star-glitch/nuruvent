'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Loader2,
  RefreshCw,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

import { useListMyRegistrationsQuery } from '@/lib/store/api/registrationsApi';
import { useGetMySessionLinksQuery } from '@/lib/store/api/attendanceApi';
import type { CrossEventRegistration } from '@/lib/types/registration';
import type { SessionLinkGroup } from '@/lib/types/attendance';

import { EmptyState } from '@/components/registrations/empty_state';
import { MobileFilterStrip } from '@/components/registrations/mobile-filter-strip';
import { StatsCards } from '@/components/registrations/stat_cards';
import { MergedRegistration, TicketCard } from './TicketCard';
import { TicketsListSkeleton } from '@/components/registrations/skeleton-loaders';

const STATUS_FILTER_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'attended', label: 'Attended' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'expired', label: 'Expired' },
];

type SortField = 'created_at' | 'event_name' | 'status';
type SortDirection = 'asc' | 'desc';

export function TicketsList() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Cards are collapsed by default. We track which ones are expanded.
  // An empty set means "everything is collapsed".
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      search: searchQuery || undefined,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      sort_by: sortField,
      sort_order: sortDirection,
      page: 1,
      page_size: 100,
    }),
    [searchQuery, selectedStatus, sortField, sortDirection],
  );

  const {
    data: regsData,
    isLoading: regsLoading,
    error: regsError,
    refetch: refetchRegs,
  } = useListMyRegistrationsQuery(queryParams);

  const {
    data: linksData,
    isLoading: linksLoading,
    refetch: refetchLinks,
  } = useGetMySessionLinksQuery();

  const registrations: CrossEventRegistration[] =
    regsData?.data?.registrations ?? [];
  const groups: SessionLinkGroup[] = linksData?.data?.groups ?? [];

  const merged: MergedRegistration[] = useMemo(
    () =>
      registrations.map((r) => {
        const group = groups.find((g) => g.event_id === r.event_id) ?? null;
        return { registration: r, group, links: group?.links ?? [] };
      }),
    [registrations, groups],
  );

  const filtered = useMemo(() => {
    if (!searchQuery) return merged;
    const q = searchQuery.toLowerCase();
    return merged.filter((m) =>
      (m.registration.event_name ?? '').toLowerCase().includes(q),
    );
  }, [merged, searchQuery]);

  const toggleCard = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLoading = regsLoading || linksLoading;
  const errorMessage = regsError
    ? (regsError as { data?: { message?: string } })?.data?.message ??
      'Failed to load your tickets'
    : null;

  const handleRefresh = async () => {
    toast.promise(Promise.all([refetchRegs(), refetchLinks()]), {
      loading: 'Refreshing…',
      success: 'Refreshed',
      error: 'Failed to refresh',
    });
  };

  const handleCancelled = () => {
    refetchRegs();
    refetchLinks();
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
  };

  const sortLabel = () => {
    const labels: Record<SortField, string> = {
      created_at: 'Newest',
      event_name: 'Event',
      status: 'Status',
    };
    return labels[sortField];
  };

  // ---- KPI stats ----
  const total = merged.length;
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcoming = merged.filter(
    (m) =>
      m.registration.event_start_date &&
      new Date(m.registration.event_start_date).getTime() > now,
  ).length;
  const past = merged.filter(
    (m) =>
      m.registration.event_start_date &&
      new Date(m.registration.event_start_date).getTime() <= now,
  ).length;
  const joinReady = merged.filter(
    (m) => m.registration.is_virtual || m.registration.is_hybrid,
  ).length;

  const stats = [
    {
      label: 'Total',
      value: total,
      sub: 'my tickets',
      tone: 'primary' as const,
      icon: <Ticket className="h-4 w-4" />,
    },
    {
      label: 'Upcoming',
      value: upcoming,
      sub: 'events ahead',
      tone: 'emerald' as const,
    },
    {
      label: 'Past',
      value: past,
      sub: 'events behind',
      tone: 'amber' as const,
    },
    {
      label: 'Join ready',
      value: joinReady,
      sub: 'with links',
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
                    placeholder="Search by event name…"
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

                <Button
                  variant="outline"
                  className="h-10 shrink-0 cursor-pointer rounded-xl px-5 sm:h-11"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-3 sm:flex-row">
                <div className="flex w-full items-center gap-2 sm:w-auto">
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
                        <SelectItem
                          value="created_at"
                          className="cursor-pointer text-sm"
                        >
                          Newest first
                        </SelectItem>
                        <SelectItem
                          value="event_name"
                          className="cursor-pointer text-sm"
                        >
                          Event
                        </SelectItem>
                        <SelectItem
                          value="status"
                          className="cursor-pointer text-sm"
                        >
                          Status
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() =>
                        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                      }
                      className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
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

                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {regsLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
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

      {/* Loading — full skeleton replaces stats + list */}
      {isLoading ? (
        <TicketsListSkeleton />
      ) : errorMessage ? (
        <Card className="border-destructive/30">
          <CardContent className="p-12 text-center text-sm text-destructive sm:p-16">
            {errorMessage}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats — only renders after data has loaded */}
          <StatsCards stats={stats} />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Ticket className="h-5 w-5 text-primary" />}
              eyebrow="Your wallet"
              title={
                searchQuery || selectedStatus !== 'all'
                  ? 'No matching tickets'
                  : 'No tickets yet'
              }
              sub={
                searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Events you register for will appear here with their QR passes and join links.'
              }
              action={
                !searchQuery && selectedStatus === 'all' ? (
                  <Link href="/events">
                    <Button size="sm" className="cursor-pointer rounded-lg">
                      <Calendar className="mr-2 h-4 w-4" />
                      Browse events
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
              {filtered.map((m) => (
                <TicketCard
                  key={m.registration.id}
                  merged={m}
                  expanded={expandedIds.has(m.registration.id)}
                  onToggle={() => toggleCard(m.registration.id)}
                  onCancelled={handleCancelled}
                />
              ))}
            </div>
          )}
        </>
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
                Refine your tickets
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex-1 overflow-y-auto pb-6">
              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by event name…"
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
    </div>
  );
}
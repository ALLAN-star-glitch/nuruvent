/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Filter,
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

import { AttendingCard, type MergedRegistration } from './AttendingCard';
import { EmptyState } from './EmptyState';

// ============================================================
// FILTER CONFIG
// ============================================================

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

// ============================================================
// COMPONENT
// ============================================================

export function AttendingTab() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // ---- Mobile breakpoint ----
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ---- Debounced search ----
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ---- Query params ----
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

  const registrations: CrossEventRegistration[] = regsData?.data?.registrations ?? [];
  const groups: SessionLinkGroup[] = linksData?.data?.groups ?? [];

  // ---- Merge registrations with their session-link group ----
  const merged: MergedRegistration[] = useMemo(
    () =>
      registrations.map((r) => {
        const group = groups.find((g) => g.event_id === r.event_id) ?? null;
        return { registration: r, group, links: group?.links ?? [] };
      }),
    [registrations, groups],
  );

  // ---- Client-side search (event name) ----
  const filtered = useMemo(() => {
    if (!searchQuery) return merged;
    const q = searchQuery.toLowerCase();
    return merged.filter((m) =>
      (m.registration.event_name ?? '').toLowerCase().includes(q),
    );
  }, [merged, searchQuery]);

  const toggleCard = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLoading = regsLoading || linksLoading;
  const errorMessage = regsError
    ? (regsError as { data?: { message?: string } })?.data?.message ??
      'Failed to load your registrations'
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
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      created_at: 'Newest',
      event_name: 'Event',
      status: 'Status',
    };
    return labels[sortField];
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Desktop filter card ─────────────────────────────── */}
      {!isMobile && (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              {/* Row 1: search + status + refresh */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by event name…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 h-10 sm:h-11 rounded-xl"
                  />
                </div>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[190px] h-10 sm:h-11 rounded-xl cursor-pointer">
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
                  className="cursor-pointer shrink-0 h-10 sm:h-11 rounded-xl px-5"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Row 2: sort + count + reset */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
                    {regsLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {filtered.length} registration
                    {filtered.length !== 1 ? 's' : ''}
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

      {/* ── Loading ─────────────────────────────────────────── */}
      {isLoading ? (
        <Card className="border-border/70">
          <CardContent className="p-12 sm:p-16 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : errorMessage ? (
        <Card className="border-destructive/30">
          <CardContent className="p-12 sm:p-16 text-center text-destructive text-sm">
            {errorMessage}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-7 w-7 text-muted-foreground" />}
          title={
            searchQuery || selectedStatus !== 'all'
              ? 'No matching registrations'
              : 'No registrations yet'
          }
          sub={
            searchQuery || selectedStatus !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Events you register for will appear here with their join links.'
          }
          action={
            !searchQuery && selectedStatus === 'all' ? (
              <Link href="/dashboard/events">
                <Button size="sm" className="cursor-pointer rounded-lg mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse events
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((m) => (
            <AttendingCard
              key={m.registration.id}
              merged={m}
              expanded={!collapsedIds.has(m.registration.id)}
              onToggle={() => toggleCard(m.registration.id)}
              onCancelled={handleCancelled}
            />
          ))}
        </div>
      )}

      {/* ── Mobile filter strip (floats above the bottom tab bar) ── */}
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

      {/* ── Mobile filter sheet ─────────────────────────────── */}
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
                Refine your registrations
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by event name…"
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
    </div>
  );
}
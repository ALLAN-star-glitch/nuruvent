// app/(dashboard)/dashboard/[accountId]/[teamId]/trash/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  Grid3x3,
  List,
  Loader2,
  Lock,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash,
  Trash2,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

import { useAppSelector } from '@/lib/store/hooks';
import {
  useBulkPermanentlyDeleteEventsMutation,
  useBulkRestoreEventsMutation,
  useGetTrashedEventsQuery,
  usePermanentlyDeleteEventMutation,
  useRestoreEventMutation,
} from '@/lib/store/api/eventsApi';
import type { Event } from '@/lib/types/events';
import {
  formatPrice,
  getEventDuration,
  getEventMinPrice,
  getEventStartTime,
  getEventStatusName,
} from '@/lib/utils/eventDisplay';

// ============================================================
// TYPES
// ============================================================

type SortField = 'name' | 'deletedDate' | 'status' | 'type';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

interface UIEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  time: string;
  registered: number;
  capacity: number;
  priceDisplay: string;
  platform: string;
  cpdHours: number;
  description: string;
  location: string;
  slug: string;
  isFeatured: boolean;
  isPrivate: boolean;
  deletedAt?: string;
  createdAt: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusConfig(statusName: string) {
  const map: Record<string, { color: string; dot: string }> = {
    Draft: {
      color: 'text-muted-foreground bg-muted border-border',
      dot: 'bg-muted-foreground',
    },
    Published: {
      color: 'text-tertiary-600 dark:text-tertiary-400 bg-tertiary-50 dark:bg-tertiary-950/40 border-tertiary-200 dark:border-tertiary-900/50',
      dot: 'bg-tertiary-500',
    },
    Cancelled: {
      color: 'text-destructive bg-destructive/10 border-destructive/30',
      dot: 'bg-destructive',
    },
    Completed: {
      color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-900/50',
      dot: 'bg-primary-500',
    },
  };
  return map[statusName] ?? map.Draft;
}

function getTypeBadgeClass(typeName: string): string {
  const map: Record<string, string> = {
    Workshop: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
    Webinar: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
    Meetup: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
    Bootcamp: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
    Uncategorized: 'bg-muted text-muted-foreground border-border',
  };
  return map[typeName] ?? 'bg-muted text-muted-foreground border-border';
}

function parseDurationMinutes(duration: string): number {
  if (!duration) return 0;
  const h = duration.match(/(\d+)h/);
  const m = duration.match(/(\d+)m/);
  return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
}

function toUIEvent(event: Event): UIEvent {
  const startDate = event.start_date ?? event.schedules?.[0]?.start_date ?? '';
  const startTime = getEventStartTime(event);
  const duration = getEventDuration(event);
  const minPrice = getEventMinPrice(event);
  const statusName = getEventStatusName(event);
  const typeName =
    event.event_type?.display_name || event.event_type?.name || 'Uncategorized';

  const cpdHours = event.event_type?.supports_certificate
    ? Math.round(parseDurationMinutes(duration) / 60)
    : 0;

  const platform = event.is_virtual
    ? event.zoom_link
      ? 'Zoom'
      : event.meet_link
        ? 'Google Meet'
        : 'Virtual'
    : 'In-Person';

  return {
    id: event.id,
    title: event.display_name || event.name || 'Untitled Event',
    type: typeName,
    status: statusName,
    date: startDate ? formatDate(startDate) : 'TBD',
    time: startTime,
    registered: event.current_attendees ?? 0,
    capacity: event.capacity ?? 0,
    priceDisplay: formatPrice(minPrice),
    platform,
    cpdHours,
    description: event.description || '',
    location: event.in_person_location || event.venue?.city || 'Virtual',
    slug: event.slug,
    isFeatured: event.is_featured,
    isPrivate: event.visibility === 'private',
    deletedAt: event.deleted_at,
    createdAt: event.created_at,
  };
}

// ============================================================
// PAGE
// ============================================================

export default function TrashPage() {
  const router = useRouter();


  const routeParams = useParams<{ accountId: string; teamId: string }>();
  const accountId = routeParams.accountId;
  const teamId = routeParams.teamId;

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // ---- Local state ----
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('deletedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const {
    data: trashResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetTrashedEventsQuery(
    { page: currentPage, page_size: pageSize },
    { skip: !isAuthenticated },
  );

  const [restoreEvent] = useRestoreEventMutation();
  const [permanentlyDeleteEvent] = usePermanentlyDeleteEventMutation();
  const [bulkRestoreEvents] = useBulkRestoreEventsMutation();
  const [bulkPermanentlyDeleteEvents] = useBulkPermanentlyDeleteEventsMutation();

  const rawEvents: Event[] = trashResponse?.data?.data ?? [];
  const totalItems = trashResponse?.data?.total ?? 0;

  const uiEvents: UIEvent[] = useMemo(
    () => rawEvents.map(toUIEvent),
    [rawEvents],
  );

  const filteredEvents = useMemo(() => {
    let filtered = [...uiEvents];

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.status.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'deletedDate':
          cmp =
            new Date(a.deletedAt ?? 0).getTime() -
            new Date(b.deletedAt ?? 0).getTime();
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [uiEvents, debouncedSearchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const draftCount = uiEvents.filter((e) => e.status === 'Draft').length;
  const publishedCount = uiEvents.filter((e) => e.status === 'Published').length;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleRowClick = (id: string) => handleSelectEvent(id);

  const handleRestoreEvent = (event: UIEvent) => {
    setSelectedEvent(event);
    setIsRestoreDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedEvent) return;
    try {
      await restoreEvent(selectedEvent.id).unwrap();
      setIsRestoreDialogOpen(false);
      setSelectedEvent(null);
      setSelectedEvents([]);
      setSelectAll(false);
      toast.success(`"${selectedEvent.title}" restored successfully`);
      await refetch();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to restore event';
      toast.error(msg);
    }
  };

  const handlePermanentDelete = (event: UIEvent) => {
    setSelectedEvent(event);
    setIsPermanentDeleteDialogOpen(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!selectedEvent) return;
    try {
      await permanentlyDeleteEvent(selectedEvent.id).unwrap();
      setIsPermanentDeleteDialogOpen(false);
      setSelectedEvent(null);
      setSelectedEvents([]);
      setSelectAll(false);
      toast.success(`"${selectedEvent.title}" permanently deleted`);
      await refetch();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to permanently delete event';
      toast.error(msg);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleRestoreSelected = () => {
    if (selectedEvents.length === 0) return;
    if (selectedEvents.length === 1) {
      const event = uiEvents.find((e) => e.id === selectedEvents[0]);
      if (event) handleRestoreEvent(event);
    } else {
      handleBulkAction('restore');
    }
  };

  const handlePermanentDeleteSelected = () => {
    if (selectedEvents.length === 0) return;
    if (selectedEvents.length === 1) {
      const event = uiEvents.find((e) => e.id === selectedEvents[0]);
      if (event) handlePermanentDelete(event);
    } else {
      handleBulkAction('permanentDelete');
    }
  };

  const handleBulkRestore = async () => {
    const count = selectedEvents.length;
    try {
      await bulkRestoreEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      toast.success(`${count} events restored successfully`);
      await refetch();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to restore events';
      toast.error(msg);
    }
  };

  const handleBulkPermanentDelete = async () => {
    const count = selectedEvents.length;
    try {
      await bulkPermanentlyDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      toast.success(`${count} events permanently deleted`);
      await refetch();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to permanently delete events';
      toast.error(msg);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map((e) => e.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Trash refreshed successfully!');
    } catch {
      toast.error('Failed to refresh trash');
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronRight className="h-3.5 w-3.5 ml-1 text-primary rotate-[-90deg]" />
      : <ChevronRight className="h-3.5 w-3.5 ml-1 text-primary rotate-90" />;
  };

  const sortLabel = () => {
    const labels: Record<SortField, string> = {
      name: 'Title',
      deletedDate: 'Deleted Date',
      status: 'Status',
      type: 'Type',
    };
    return labels[sortField];
  };

  const handleMobileReset = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSortField('deletedDate');
    setSortDirection('desc');
    setCurrentPage(1);
    setIsFilterSheetOpen(false);
  };

  // ============================================================
  // AUTH / LOADING GATES
  // ============================================================

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        {/* ─── RESPONSIVE: added px-4 so card doesn't touch edges on small phones */}
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-full">
                <Trash2 className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Authentication Required
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please log in to view your trash.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={() => router.push('/signin')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !trashResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        {/* ─── RESPONSIVE: added px-4 */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading trash...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-20 px-3 sm:px-4 md:px-0">
      {/* ─── RESPONSIVE: space-y-4 on mobile, px-3/4 for outer padding, more bottom padding on mobile for fixed bar */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href={`/dashboard/${accountId}/${teamId}/events`}
            className="p-2 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg transition-colors cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 flex-shrink-0" />
              <span className="truncate">Trash</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              View and manage your soft-deleted events.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer w-full sm:w-auto"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="ml-2 sm:ml-0">Refresh</span>
          </Button>
        </div>
      </div>
{/* Stats */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
  <Card className="border-border shadow-sm rounded-2xl">
    <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
      {/* Top row: label + icon bubble */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
          Total in Trash
        </p>
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40">
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
        </span>
      </div>

      {/* Value */}
      <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
        {totalItems}
      </p>

      {/* Sub-caption */}
      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
        events in trash
      </p>
    </CardContent>
  </Card>

  <Card className="border-border shadow-sm rounded-2xl">
    <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
          Drafts
        </p>
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </span>
      </div>

      <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
        {draftCount}
      </p>

      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
        unpublished
      </p>
    </CardContent>
  </Card>

  <Card className="border-border shadow-sm rounded-2xl col-span-2 md:col-span-1">
    <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
          Published
        </p>
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-50 dark:bg-tertiary-950/40">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-tertiary-600 dark:text-tertiary-400" />
        </span>
      </div>

      <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
        {publishedCount}
      </p>

      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
        live events
      </p>
    </CardContent>
  </Card>
</div>

      {/* Desktop filters */}
      {!isMobile && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            {/* ─── RESPONSIVE: tighter padding on small tablets */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4">
                <div className="relative w-full md:w-72 lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search trashed events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 w-full cursor-text"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  {/* ─── RESPONSIVE: allow wrapping on narrow tablets */}
                  <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg shrink-0">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md cursor-pointer ${
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
                      className={`p-1.5 rounded-md cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-background text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="text-xs text-muted-foreground hidden sm:inline">|</span>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>
                    <Select
                      value={sortField}
                      onValueChange={(v: SortField) => {
                        setSortField(v);
                        setSortDirection('asc');
                      }}
                    >
                      <SelectTrigger className="h-8 w-[110px] sm:w-[130px] text-xs border-0 bg-transparent focus:ring-0 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name" className="cursor-pointer text-sm">Title</SelectItem>
                        <SelectItem value="deletedDate" className="cursor-pointer text-sm">Deleted Date</SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">Status</SelectItem>
                        <SelectItem value="type" className="cursor-pointer text-sm">Type</SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() => setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'))}
                      className="p-1 hover:bg-accent rounded-md cursor-pointer"
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {isFetching && <Loader2 className="h-3.5 w-3.5 inline animate-spin mr-1" />}
                    {filteredEvents.length} item{filteredEvents.length !== 1 ? 's' : ''} in trash
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer shrink-0"
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                      setSortField('deletedDate');
                      setSortDirection('desc');
                      setCurrentPage(1);
                    }}
                  >
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk bar */}
            {selectedEvents.length > 0 && (
              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                {/* ─── RESPONSIVE: stack vertically on small screens */}
                <div className="flex items-center gap-2 min-w-0">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {selectedEvents.length} item{selectedEvents.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-tertiary-600 dark:text-tertiary-400 border-tertiary-200 dark:border-tertiary-900/50 hover:bg-tertiary-50 dark:hover:bg-tertiary-950/30 flex-1 sm:flex-none text-xs sm:text-sm"
                    onClick={handleRestoreSelected}
                  >
                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="ml-1 sm:ml-0">
                      {selectedEvents.length === 1 ? 'Restore' : 'Restore All'}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-destructive border-destructive/30 hover:bg-destructive/10 flex-1 sm:flex-none text-xs sm:text-sm"
                    onClick={handlePermanentDeleteSelected}
                  >
                    <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="ml-1 sm:ml-0">
                      {selectedEvents.length === 1 ? 'Delete Permanently' : 'Delete All Permanently'}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer text-xs sm:text-sm"
                    onClick={() => {
                      setSelectedEvents([]);
                      setSelectAll(false);
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="ml-1 sm:ml-0">Clear</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table view */}
      {!isMobile && viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                {/* ─── RESPONSIVE: table stays horizontally scrollable on tablets, columns get tighter padding */}
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-3 px-2 lg:px-4 w-10">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="cursor-pointer"
                        disabled={filteredEvents.length === 0}
                      />
                    </TableHead>
                    <TableHead className="py-3 px-2 lg:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('name')}>
                      <div className="flex items-center whitespace-nowrap">Event Title {sortIcon('name')}</div>
                    </TableHead>
                    <TableHead className="py-3 px-2 lg:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('type')}>
                      <div className="flex items-center whitespace-nowrap">Type {sortIcon('type')}</div>
                    </TableHead>
                    <TableHead className="py-3 px-2 lg:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center whitespace-nowrap">Status {sortIcon('status')}</div>
                    </TableHead>
                    <TableHead className="py-3 px-2 lg:px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('deletedDate')}>
                      <div className="flex items-center whitespace-nowrap">Deleted At {sortIcon('deletedDate')}</div>
                    </TableHead>
                    <TableHead className="py-3 px-2 lg:px-4 text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const isSelected = selectedEvents.includes(event.id);
                      const statusConfig = getStatusConfig(event.status);
                      const typeClass = getTypeBadgeClass(event.type);

                      return (
                        <TableRow
                          key={event.id}
                          onClick={() => handleRowClick(event.id)}
                          className={`hover:bg-accent/60 transition-colors group cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell className="py-3 lg:py-4 px-2 lg:px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectEvent(event.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-3 lg:py-4 px-2 lg:px-4 max-w-[280px]">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {event.title}
                              {event.isFeatured && (
                                <Badge className="ml-2 bg-secondary-500 text-white text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {event.isPrivate && (
                                <Badge variant="outline" className="ml-2 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 lg:gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                              <span className="text-muted-foreground">{event.platform}</span>
                              <span className="text-border">•</span>
                              <span className="text-primary font-medium">{event.priceDisplay}</span>
                              <span className="text-border">•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">{event.cpdHours} CPD Hrs</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 lg:py-4 px-2 lg:px-4">
                            <Badge variant="outline" className={`${typeClass} whitespace-nowrap`}>
                              {event.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 lg:py-4 px-2 lg:px-4">
                            <Badge variant="outline" className={`${statusConfig.color} border whitespace-nowrap`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 lg:py-4 px-2 lg:px-4 text-muted-foreground">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-sm">{formatDate(event.deletedAt)}</span>
                              <span className="text-xs text-muted-foreground">{formatTime(event.deletedAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 lg:py-4 px-2 lg:px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-tertiary-600 dark:text-tertiary-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreEvent(event);
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePermanentDelete(event);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        <EmptyTrashState searchQuery={searchQuery} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalItems > 0 && (
              <PaginationBar
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid view */}
      {!isMobile && viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* ─── RESPONSIVE: added xl:grid-cols-4 for wide desktops, tighter gap on mobile */}
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TrashGridCard
                  key={event.id}
                  event={event}
                  isSelected={selectedEvents.includes(event.id)}
                  onRestore={handleRestoreEvent}
                  onPermanentDelete={handlePermanentDelete}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <EmptyTrashState searchQuery={searchQuery} />
              </div>
            )}
          </div>

          {totalItems > 0 && (
            <div className="bg-card rounded-lg border border-border">
              <PaginationBar
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </>
      )}

      {/* Mobile list */}
      {isMobile && (
        <div className="space-y-3 sm:space-y-4 pb-24">
          {/* ─── RESPONSIVE: tighter spacing on small phones */}
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <TrashGridCard
                key={event.id}
                event={event}
                isSelected={selectedEvents.includes(event.id)}
                onSelect={handleSelectEvent}
                onRestore={handleRestoreEvent}
                onPermanentDelete={handlePermanentDelete}
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <EmptyTrashState searchQuery={searchQuery} />
            </div>
          )}

          {totalItems > 0 && (
            <div className="bg-card rounded-lg border border-border">
              <PaginationBar
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile filter strip */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-3 sm:pb-4 pointer-events-none">
          {/* ─── RESPONSIVE: tighter padding on small phones */}
          <div className="pointer-events-auto mx-auto max-w-md bg-card/95 rounded-full shadow-lg border border-border backdrop-blur-sm">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 gap-1.5 sm:gap-2">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:bg-accent/60 rounded-full px-2.5 sm:px-3 py-1.5"
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {searchQuery || 'Search trash'}
                </span>
              </button>
              <div className="w-px h-6 bg-border flex-shrink-0" />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/60 rounded-full px-2.5 sm:px-3 py-1.5 relative"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground hidden xs:inline">Filters</span>
                {/* ─── RESPONSIVE: hide "Filters" label on very small screens */}
              </button>
              <div className="w-px h-6 bg-border flex-shrink-0" />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/60 rounded-full px-2.5 sm:px-3 py-1.5"
              >
                <span className="text-sm text-muted-foreground truncate max-w-[60px] sm:max-w-[80px]">
                  {sortLabel()}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0 pb-0" showCloseButton={false}>
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 h-full flex flex-col">
            {/* ─── RESPONSIVE: tighter padding on mobile */}
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg sm:text-xl font-semibold">Filter & Sort</SheetTitle>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="cursor-pointer h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your trash list
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-4 sm:mt-6 pb-6">
              <div className="space-y-1.5 mb-4 sm:mb-5">
                <Label className="text-sm font-medium text-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trashed events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-11 border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                {/* ─── RESPONSIVE: single column on very small phones */}
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-sm font-medium text-foreground truncate">Sort By</Label>
                  <Select
                    value={sortField}
                    onValueChange={(v: SortField) => setSortField(v)}
                  >
                    <SelectTrigger className="h-11 cursor-pointer border-border rounded-xl w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name" className="cursor-pointer">Title</SelectItem>
                      <SelectItem value="deletedDate" className="cursor-pointer">Deleted Date</SelectItem>
                      <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
                      <SelectItem value="type" className="cursor-pointer">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-sm font-medium text-foreground truncate">View</Label>
                  <Select
                    value={viewMode}
                    onValueChange={(v: ViewMode) => setViewMode(v)}
                  >
                    <SelectTrigger className="h-11 cursor-pointer border-border rounded-xl w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table" className="cursor-pointer">Table</SelectItem>
                      <SelectItem value="grid" className="cursor-pointer">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className={`h-11 rounded-xl cursor-pointer ${
                      sortDirection === 'asc'
                        ? 'bg-primary-300 text-white hover:bg-primary-400 shadow-sm'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setSortDirection('asc')}
                  >
                    Ascending
                  </Button>
                  <Button
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className={`h-11 rounded-xl cursor-pointer ${
                      sortDirection === 'desc'
                        ? 'bg-primary-300 text-white hover:bg-primary-400 shadow-sm'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setSortDirection('desc')}
                  >
                    Descending
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-4 border-t border-border bg-background pb-2">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl cursor-pointer border-border hover:bg-accent"
                onClick={handleMobileReset}
              >
                Reset All
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                onClick={() => setIsFilterSheetOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Restore dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-full">
          {/* ─── RESPONSIVE: prevent dialog touching edges on small phones */}
          <DialogHeader>
            <DialogTitle className="text-tertiary-600 dark:text-tertiary-400">Restore Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this event from trash?
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-tertiary-50 dark:bg-tertiary-950/30 rounded-lg border border-tertiary-100 dark:border-tertiary-900/50">
                <div className="p-2 bg-tertiary-100 dark:bg-tertiary-950/50 rounded-full flex-shrink-0">
                  <RotateCcw className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{selectedEvent.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            {/* ─── RESPONSIVE: stack buttons vertically on mobile */}
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)} className="cursor-pointer w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-tertiary-500 hover:bg-tertiary-600 text-white w-full sm:w-auto"
              onClick={handleConfirmRestore}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Restore Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent delete dialog */}
      <Dialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-full">
          {/* ─── RESPONSIVE */}
          <DialogHeader>
            <DialogTitle className="text-destructive">Permanently Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="p-2 bg-destructive/20 rounded-full flex-shrink-0">
                  <Trash className="h-5 w-5 text-destructive" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{selectedEvent.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            {/* ─── RESPONSIVE: stack buttons vertically on mobile */}
            <Button
              variant="outline"
              onClick={() => setIsPermanentDeleteDialogOpen(false)}
              className="cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button variant="destructive" className="cursor-pointer w-full sm:w-auto" onClick={handleConfirmPermanentDelete}>
              <Trash className="h-4 w-4 mr-2" /> Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk dialog */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg">
          {/* ─── RESPONSIVE */}
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'restore' && 'Restore Events'}
              {bulkAction === 'permanentDelete' && 'Permanently Delete Events'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to{' '}
              {bulkAction === 'restore' ? 'restore' : 'permanently delete'}{' '}
              <strong>{selectedEvents.length}</strong> event
              {selectedEvents.length > 1 ? 's' : ''}
              {bulkAction === 'permanentDelete' ? '. This action cannot be undone.' : '.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border border-border rounded-lg p-2">
              {selectedEvents.map((id) => {
                const event = uiEvents.find((e) => e.id === id);
                return event ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm min-w-0">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{event.title}</span>
                    <span className="text-muted-foreground flex-shrink-0">—</span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {event.status}
                    </Badge>
                  </div>
                ) : null;
              })}
            </ScrollArea>
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {/* ─── RESPONSIVE: stack buttons vertically on mobile */}
            <AlertDialogCancel className="cursor-pointer w-full sm:w-auto mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={`cursor-pointer w-full sm:w-auto ${
                bulkAction === 'permanentDelete'
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-tertiary-500 hover:bg-tertiary-600 text-white'
              }`}
              onClick={() => {
                if (bulkAction === 'restore') {
                  handleBulkRestore();
                } else if (bulkAction === 'permanentDelete') {
                  handleBulkPermanentDelete();
                }
              }}
            >
              {bulkAction === 'restore' ? 'Restore All' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface TrashGridCardProps {
  event: UIEvent;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  onRestore: (event: UIEvent) => void;
  onPermanentDelete: (event: UIEvent) => void;
}

function TrashGridCard({
  event,
  isSelected,
  onSelect,
  onRestore,
  onPermanentDelete,
}: TrashGridCardProps) {
  const statusConfig = getStatusConfig(event.status);
  const typeClass = getTypeBadgeClass(event.type);

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 border-border ${
        isSelected ? 'border-primary/50 bg-primary/5' : ''
      }`}
    >
      <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        {/* ─── RESPONSIVE: tighter padding & spacing on mobile */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <Badge variant="outline" className={typeClass}>
              {event.type}
            </Badge>
            {event.isFeatured && (
              <Badge className="bg-secondary-500 text-white text-xs">
                <Star className="h-3 w-3 mr-1" /> Featured
              </Badge>
            )}
            {event.isPrivate && (
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs">
                <Lock className="h-3 w-3 mr-1" /> Private
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={`${statusConfig.color} border flex-shrink-0`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
            {event.status}
          </Badge>
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-foreground line-clamp-2">{event.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="text-primary font-medium">{event.priceDisplay}</span>
            <span className="text-border">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">{event.cpdHours} CPD Hrs</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{event.time}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <span className="text-muted-foreground">Deleted:</span>
          <span>{formatDate(event.deletedAt)}</span>
          <span className="text-muted-foreground">({formatTime(event.deletedAt)})</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {event.registered} / {event.capacity || '∞'} registered
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
            <Globe className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{event.platform}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(event.id)}
                className="cursor-pointer"
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 cursor-pointer">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-tertiary-600 dark:text-tertiary-400"
                  onClick={() => onRestore(event)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Restore
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={() => onPermanentDelete(event)}
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTrashState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <Trash2 className="h-8 w-8 text-muted-foreground/40" />
      <p className="font-medium text-center">
        {searchQuery ? `No trashed events match "${searchQuery}"` : 'No events in trash'}
      </p>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {searchQuery
          ? 'Try adjusting your search terms.'
          : 'Deleted events will appear here. You can restore or permanently delete them.'}
      </p>
    </div>
  );
}

interface PaginationBarProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationBar({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-t border-border">
      {/* ─── RESPONSIVE: stack on mobile, tighter padding */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
        <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(Number(v))}>
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
        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
          {totalItems > 0
            ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`
            : '0 of 0'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
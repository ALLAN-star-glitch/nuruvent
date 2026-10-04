// app/(dashboard)/dashboard/events/page.tsx

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Calendar, Users, Clock, MoreVertical, ExternalLink, Edit3,
  Copy, Trash2, CheckCircle2, Video, Filter, Check, Eye, Award, Globe,
  XCircle, Grid3x3, List, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft,
  ChevronRight, X, ArrowRight, Loader2, RefreshCw, AlertTriangle, LogIn,
  AlertCircle, Star, Lock, Trash, RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

import {
  useBulkDeleteEventsMutation,
  useBulkPermanentlyDeleteEventsMutation,
  useBulkPublishEventsMutation,
  useBulkRestoreEventsMutation,
  useDeleteEventMutation,
  useGetTrashedEventsCountQuery,
  useListMyEventsQuery,
  usePermanentlyDeleteEventMutation,
  usePublishEventMutation,
  useRestoreEventMutation,
  useSearchMyEventsQuery,
} from '@/lib/store/api/eventsApi';
import type { Event } from '@/lib/types/events';
import {
  formatPrice,
  getEventDuration,
  getEventLocation,
  getEventMinPrice,
  getEventStartTime,
  getEventStatusName,
  isEventDraft,
  isEventPublished,
} from '@/lib/utils/eventDisplay';

// ============================================================
// TYPES
// ============================================================

type SortField = 'name' | 'eventDate' | 'addedDate' | 'current_attendees' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

interface UIEvent {
  id: string;
  title: string;
  eventTypeId: string;
  eventStatusId: string;
  typeDisplayName: string;
  statusDisplayName: string;
  type: string;
  status: string;
  date: string;
  time: string;
  registered: number;
  capacity: number;
  priceDisplay: string;
  priceValue: number;
  platform: string;
  cpdHours: number;
  description: string;
  host: string;
  location: string;
  image?: string;
  slug: string;
  rawDate: string;
  duration: string;
  certificatePrice: number;
  isVirtual: boolean;
  isFeatured: boolean;
  isPrivate: boolean;
  zoomLink?: string;
  meetLink?: string;
  createdAt: string;
  publishedAt?: string;
  deletedAt?: string;
  isDeleted: boolean;
}

// ============================================================
// HELPERS
// ============================================================

function formatDateShort(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusBadgeConfig(statusName: string) {
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

function toUIEvent(event: Event): UIEvent {
  const startDate = event.start_date ?? event.schedules?.[0]?.start_date ?? '';
  const startTime = getEventStartTime(event);
  const duration = getEventDuration(event);
  const minPrice = getEventMinPrice(event);
  const location = getEventLocation(event);
  const statusName = getEventStatusName(event);
  const typeName = event.event_type?.display_name || event.event_type?.name || 'Event';

  const isDeleted = Boolean(event.deleted_at);

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
    eventTypeId: event.event_type?.id ?? '',
    eventStatusId: event.event_status?.id ?? '',
    typeDisplayName: typeName,
    statusDisplayName: statusName,
    type: typeName,
    status: statusName,
    date: startDate ? formatDateShort(startDate) : 'TBD',
    time: startTime,
    registered: event.current_attendees ?? 0,
    capacity: event.capacity ?? 0,
    priceDisplay: formatPrice(minPrice),
    priceValue: minPrice,
    platform,
    cpdHours,
    description: event.description || '',
    host: event.organizer?.id ?? '',
    location,
    image: event.image_url,
    slug: event.slug,
    rawDate: startDate,
    duration,
    certificatePrice: event.certificate_enabled ? event.certificate_price ?? 0 : 0,
    isVirtual: event.is_virtual,
    isFeatured: event.is_featured,
    isPrivate: event.visibility === 'private',
    zoomLink: event.zoom_link,
    meetLink: event.meet_link,
    createdAt: event.created_at,
    publishedAt: event.published_at,
    deletedAt: event.deleted_at,
    isDeleted,
  };
}

function parseDurationMinutes(duration: string): number {
  if (!duration) return 0;
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours * 60 + mins;
}

// ============================================================
// PAGE
// ============================================================

export default function EventsDashboardPage() {
  const router = useRouter();

  const isAuthenticated = useAuthenticated();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [publishError, setPublishError] = useState<{ message: string; details: string[] } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] = useState(false);
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('eventDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const shouldSearch = debouncedSearchQuery.trim().length > 0;

  const {
    data: listResponse,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
    refetch: refetchList,
  } = useListMyEventsQuery(
    {
      page: currentPage,
      page_size: pageSize,
      only_deleted: activeTab === 'trash' ? true : undefined,
    },
    { skip: shouldSearch || !isAuthenticated },
  );

  const {
    data: searchResponse,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchMyEventsQuery(
    {
      q: debouncedSearchQuery,
      page: currentPage,
      page_size: pageSize,
    },
    { skip: !shouldSearch || !isAuthenticated },
  );

  const { data: trashCountResponse, refetch: refetchTrashCount } =
    useGetTrashedEventsCountQuery(undefined, { skip: !isAuthenticated });

  const trashedEvents = trashCountResponse?.count ?? 0;

  const activeData = shouldSearch ? searchResponse : listResponse;
  const isLoading = isListLoading || isSearchLoading;
  const isFetching = shouldSearch ? isSearchFetching : isListFetching;
  const error = shouldSearch ? searchError : listError;
  const refetch = shouldSearch ? refetchSearch : refetchList;

  const rawEvents: Event[] = activeData?.data?.data ?? [];
  const totalItems = activeData?.data?.total ?? 0;

  const uiEvents: UIEvent[] = useMemo(
    () => rawEvents.map(toUIEvent),
    [rawEvents],
  );

  const [deleteEvent] = useDeleteEventMutation();
  const [permanentlyDeleteEvent] = usePermanentlyDeleteEventMutation();
  const [restoreEvent] = useRestoreEventMutation();
  const [publishEvent] = usePublishEventMutation();
  const [bulkDeleteEvents] = useBulkDeleteEventsMutation();
  const [bulkPermanentlyDeleteEvents] = useBulkPermanentlyDeleteEventsMutation();
  const [bulkRestoreEvents] = useBulkRestoreEventsMutation();
  const [bulkPublishEvents] = useBulkPublishEventsMutation();

  const filteredEvents = useMemo(() => {
    let filtered = [...uiEvents];

    if (activeTab === 'trash') {
      filtered = filtered.filter((e) => e.isDeleted);
    } else if (activeTab !== 'all') {
      const statusMap: Record<string, string> = {
        live: 'Published',
        upcoming: 'Published',
        draft: 'Draft',
        ended: 'Completed',
      };
      const target = statusMap[activeTab];
      if (target) {
        filtered = filtered.filter(
          (e) => !e.isDeleted && e.status === target,
        );
      }
    } else {
      filtered = filtered.filter((e) => !e.isDeleted);
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'eventDate':
          cmp = new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
          break;
        case 'addedDate': {
          const da = a.publishedAt || a.createdAt;
          const db = b.publishedAt || b.createdAt;
          cmp = new Date(da).getTime() - new Date(db).getTime();
          break;
        }
        case 'current_attendees':
          cmp = a.registered - b.registered;
          break;
        case 'price':
          cmp = a.priceValue - b.priceValue;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [uiEvents, activeTab, sortField, sortDirection]);

  const activeEvents = uiEvents.filter((e) => !e.isDeleted);
  const totalEvents = totalItems;
  const totalRegistered = activeEvents.reduce((s, e) => s + e.registered, 0);
  const liveEvents = activeEvents.filter((e) => e.status === 'Published').length;
  const cpdEvents = activeEvents.filter((e) => e.cpdHours > 0).length;

  const handleRowClick = (id: string) => handleSelectEvent(id);
  const handleCardClick = (event: UIEvent) => router.push(`/dashboard/events/${event.id}`);

  const handleDeleteEvent = (event: UIEvent) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await deleteEvent(selectedEvent.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success('Event moved to trash');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete event';
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
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success('Event permanently deleted');
    } catch {
      toast.error('Failed to permanently delete event');
    }
  };

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
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success('Event restored successfully');
    } catch {
      toast.error('Failed to restore event');
    }
  };

  const handlePublishEvent = async (event: UIEvent) => {
    setPublishingEventId(event.id);
    setPublishError(null);
    const loadingToast = toast.loading(`Publishing "${event.title}"...`);

    try {
      await publishEvent(event.id).unwrap();
      toast.dismiss(loadingToast);
      toast.success(`"${event.title}" published successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
      await refetch();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const { message, details } = extractErrorDetails(err, 'Failed to publish event');
      setPublishError({ message, details });
      setIsPublishErrorDialogOpen(true);
    } finally {
      setPublishingEventId(null);
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

  const handleViewSelected = () => {
    if (selectedEvents.length === 1) {
      router.push(`/dashboard/events/${selectedEvents[0]}`);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) return;
    const count = selectedEvents.length;
    try {
      await bulkDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success(`${count} events moved to trash`);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete events';
      toast.error(msg);
    }
  };

  const handleBulkPermanentDelete = async () => {
    try {
      await bulkPermanentlyDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success('Events permanently deleted');
    } catch {
      toast.error('Failed to permanently delete events');
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success('Events restored successfully');
    } catch {
      toast.error('Failed to restore events');
    }
  };

  const handleBulkPublish = async () => {
    const count = selectedEvents.length;
    const loadingToast = toast.loading(`Publishing ${count} events...`);
    try {
      await bulkPublishEvents({ ids: selectedEvents }).unwrap();
      toast.dismiss(loadingToast);
      toast.success(`${count} events published successfully!`, {
        duration: 4000,
        position: 'top-right',
      });
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await refetch();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const { message, details } = extractErrorDetails(err, 'Failed to publish events');
      setPublishError({ message, details });
      setIsPublishErrorDialogOpen(true);
      setIsBulkActionDialogOpen(false);
    }
  };

  const handleBulkDuplicate = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
    router.push(
      `/dashboard/events/new?duplicate=${selectedEvents.join(',')}`,
    );
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (activeTab !== 'all' && activeTab !== 'trash') count++;
    return count;
  };

  const getSortLabel = () => {
    const labels: Record<SortField, string> = {
      name: 'Title',
      eventDate: 'Event Date',
      addedDate: 'Added Date',
      current_attendees: 'Registrations',
      price: 'Price',
      status: 'Status',
    };
    return labels[sortField];
  };

  const handleMobileReset = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveTab('all');
    setSortField('eventDate');
    setSortDirection('desc');
    setCurrentPage(1);
    setIsFilterSheetOpen(false);
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
    toast.promise(
      (async () => {
        await Promise.all([refetch(), refetchTrashCount()]);
      })(),
      {
        loading: 'Refreshing events...',
        success: 'Events refreshed successfully!',
        error: 'Failed to refresh events',
      },
    );
  };

  // ============================================================
  // AUTH GATES
  // ============================================================

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md w-full border-border shadow-sm">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-full">
                <LogIn className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Authentication Required
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please log in to view and manage your events.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={() => router.push('/signin')}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !activeData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {shouldSearch ? 'Searching events...' : 'Loading events...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-destructive/30 shadow-sm">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Failed to load events
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Something went wrong while fetching your events.
            </p>
            <Button variant="outline" className="cursor-pointer" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, monitor, and manage your training sessions, workshops, and webinars.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/events/new" className="cursor-pointer">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Total Events"
          value={totalEvents}
          sub={`${activeEvents.filter((e) => e.status === 'Published').length} published`}
          icon={<Calendar className="h-5 w-5" />}
          bg="bg-primary/10 text-primary"
        />
        <StatCard
          label="Registrations"
          value={totalRegistered}
          sub={`${activeEvents.filter((e) => e.registered > 0).length} events`}
          icon={<Users className="h-5 w-5" />}
          bg="bg-tertiary/10 text-tertiary"
        />
        <StatCard
          label="Live Sessions"
          value={liveEvents}
          sub={`${activeEvents.filter((e) => e.status === 'Draft').length} drafts`}
          icon={<Video className="h-5 w-5" />}
          bg="bg-destructive/10 text-destructive"
        />
        <StatCard
          label="CPD Accredited"
          value={cpdEvents}
          sub={`${activeEvents.reduce((s, e) => s + e.cpdHours, 0)} total hours`}
          icon={<Award className="h-5 w-5" />}
          bg="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
        />
        <TrashCard count={trashedEvents} onClick={() => router.push('/dashboard/trash')} />
      </div>

      {/* Desktop filters */}
      {!isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {['all', 'live', 'upcoming', 'draft', 'ended'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                        activeTab === tab
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search events..."
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg">
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

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>
                    <Select
                      value={sortField}
                      onValueChange={(value: SortField) => {
                        setSortField(value);
                        setSortDirection('asc');
                      }}
                    >
                      <SelectTrigger className="h-8 w-[130px] text-xs border-0 bg-transparent focus:ring-0 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name" className="cursor-pointer text-sm">Title</SelectItem>
                        <SelectItem value="eventDate" className="cursor-pointer text-sm">Event Date</SelectItem>
                        <SelectItem value="addedDate" className="cursor-pointer text-sm">Added Date</SelectItem>
                        <SelectItem value="current_attendees" className="cursor-pointer text-sm">Registrations</SelectItem>
                        <SelectItem value="price" className="cursor-pointer text-sm">Price</SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">Status</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'))}
                      className="p-1 hover:bg-accent rounded-md cursor-pointer"
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
                  <span className="text-xs text-muted-foreground">
                    {isFetching && <Loader2 className="h-3.5 w-3.5 inline animate-spin mr-1" />}
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                    {shouldSearch && searchQuery && (
                      <span className="text-muted-foreground ml-1">(searching &quot;{searchQuery}&quot;)</span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                      setActiveTab('all');
                      setSortField('eventDate');
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

            {/* Bulk actions */}
            {selectedEvents.length > 0 && (
              <BulkActionsBar
                selectedIds={selectedEvents}
                uiEvents={uiEvents}
                activeTab={activeTab}
                publishingEventId={publishingEventId}
                onClear={() => {
                  setSelectedEvents([]);
                  setSelectAll(false);
                }}
                onView={handleViewSelected}
                onEdit={(id) => router.push(`/dashboard/events/${id}/edit`)}
                onPublish={(event) => handlePublishEvent(event)}
                onBulkAction={handleBulkAction}
                onDeleteEvent={handleDeleteEvent}
              />
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
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-3 px-4 w-10">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="cursor-pointer"
                        disabled={filteredEvents.length === 0}
                      />
                    </TableHead>
                    <SortableHead label="Event Title" field="name" sortField={sortField} onSort={toggleSort} icon={getSortIcon('name')} />
                    <TableHead className="py-3 px-4">Type</TableHead>
                    <SortableHead label="Event Date" field="eventDate" sortField={sortField} onSort={toggleSort} icon={getSortIcon('eventDate')} />
                    <SortableHead label="Added" field="addedDate" sortField={sortField} onSort={toggleSort} icon={getSortIcon('addedDate')} />
                    <SortableHead label="Registrations" field="current_attendees" sortField={sortField} onSort={toggleSort} icon={getSortIcon('current_attendees')} />
                    <SortableHead label="Status" field="status" sortField={sortField} onSort={toggleSort} icon={getSortIcon('status')} />
                    <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const percentage =
                        event.capacity > 0
                          ? Math.round((event.registered / event.capacity) * 100)
                          : 0;
                      const statusConfig = getStatusBadgeConfig(event.statusDisplayName);
                      const typeClass = getTypeBadgeClass(event.typeDisplayName);
                      const isSelected = selectedEvents.includes(event.id);
                      const isTrashed = event.isDeleted;
                      const addedDate = event.publishedAt || event.createdAt;
                      const addedLabel = event.publishedAt ? 'Published' : 'Created';

                      return (
                        <TableRow
                          key={event.id}
                          onClick={() => handleRowClick(event.id)}
                          className={`hover:bg-accent/60 transition-colors group cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          } ${isTrashed ? 'opacity-60 bg-amber-50/30 dark:bg-amber-950/10' : ''}`}
                        >
                          <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectEvent(event.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {event.title}
                              {isTrashed && (
                                <Badge variant="outline" className="ml-2 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs">
                                  <Trash2 className="h-3 w-3 mr-1" /> Trashed
                                </Badge>
                              )}
                              {event.isFeatured && !isTrashed && (
                                <Badge className="ml-2 bg-secondary-500 text-white text-xs">
                                  <Star className="h-3 w-3 mr-1" /> Featured
                                </Badge>
                              )}
                              {event.isPrivate && !isTrashed && (
                                <Badge variant="outline" className="ml-2 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs">
                                  <Lock className="h-3 w-3 mr-1" /> Private
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              <span className="text-muted-foreground">{event.platform}</span>
                              <span className="text-border">•</span>
                              <span className="text-primary font-medium">{event.priceDisplay}</span>
                              <span className="text-border">•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-medium">{event.cpdHours} CPD Hrs</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={typeClass}>
                              {event.typeDisplayName}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm">{event.date}</span>
                              <span className="text-xs text-muted-foreground">{event.time}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm">{formatDateShort(addedDate)}</span>
                              <span className="text-xs text-muted-foreground">{addedLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <AttendanceBar
                              current={event.registered}
                              capacity={event.capacity}
                              percent={percentage}
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            {isTrashed ? (
                              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40">
                                <Trash2 className="h-3 w-3 mr-1" /> Trashed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`${statusConfig.color} border`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                                {event.statusDisplayName}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-right">
                            <EventActionsMenu
                              event={event}
                              isTrashed={isTrashed}
                              onView={() => router.push(`/dashboard/events/${event.id}`)}
                              onEdit={() => router.push(`/dashboard/events/${event.id}/edit`)}
                              onDuplicate={() => router.push(`/dashboard/events/new?duplicate=${event.id}`)}
                              onPublish={() => handlePublishEvent(event)}
                              onRestore={() => handleRestoreEvent(event)}
                              onPermanentDelete={() => handlePermanentDelete(event)}
                              onMoveToTrash={() => handleDeleteEvent(event)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        <EmptyState activeTab={activeTab} searchQuery={searchQuery} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventGridCard
                  key={event.id}
                  event={event}
                  isSelected={selectedEvents.includes(event.id)}
                  onSelect={handleSelectEvent}
                  onClick={() => handleCardClick(event)}
                  onView={() => router.push(`/dashboard/events/${event.id}`)}
                  onEdit={() => router.push(`/dashboard/events/${event.id}/edit`)}
                  onDuplicate={() => router.push(`/dashboard/events/new?duplicate=${event.id}`)}
                  onPublish={() => handlePublishEvent(event)}
                  onRestore={() => handleRestoreEvent(event)}
                  onPermanentDelete={() => handlePermanentDelete(event)}
                  onMoveToTrash={() => handleDeleteEvent(event)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <EmptyState activeTab={activeTab} searchQuery={searchQuery} />
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

      {/* Mobile floating filter strip */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md bg-card/95 rounded-full shadow-lg border border-border backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-2.5 gap-2">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:bg-accent/60 rounded-full px-3 py-1.5"
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{searchQuery || 'Search'}</span>
              </button>
              <div className="w-px h-6 bg-border flex-shrink-0" />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/60 rounded-full px-3 py-1.5 relative"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
              <div className="w-px h-6 bg-border flex-shrink-0" />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/60 rounded-full px-3 py-1.5"
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate max-w-[60px]">{getSortLabel()}</span>
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

      {/* Mobile list */}
      {isMobile && (
        <div className="space-y-4 pb-24">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventGridCard
                key={event.id}
                event={event}
                isSelected={selectedEvents.includes(event.id)}
                onSelect={handleSelectEvent}
                onClick={() => handleCardClick(event)}
                onView={() => router.push(`/dashboard/events/${event.id}`)}
                onEdit={() => router.push(`/dashboard/events/${event.id}/edit`)}
                onDuplicate={() => router.push(`/dashboard/events/new?duplicate=${event.id}`)}
                onPublish={() => handlePublishEvent(event)}
                onRestore={() => handleRestoreEvent(event)}
                onPermanentDelete={() => handlePermanentDelete(event)}
                onMoveToTrash={() => handleDeleteEvent(event)}
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <EmptyState activeTab={activeTab} searchQuery={searchQuery} />
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

      {/* Mobile filter sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0 pb-0" showCloseButton={false}>
          <div className="px-6 pt-6 pb-8 h-full flex flex-col">
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-semibold">Filter & Sort</SheetTitle>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="cursor-pointer h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your event list
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium text-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-11 border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-sm font-medium text-foreground truncate">Status</Label>
                  <Select
                    value={activeTab}
                    onValueChange={(v) => {
                      setActiveTab(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-11 cursor-pointer border-border rounded-xl w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">All</SelectItem>
                      <SelectItem value="live" className="cursor-pointer">Live</SelectItem>
                      <SelectItem value="upcoming" className="cursor-pointer">Upcoming</SelectItem>
                      <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                      <SelectItem value="ended" className="cursor-pointer">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="eventDate" className="cursor-pointer">Event Date</SelectItem>
                      <SelectItem value="addedDate" className="cursor-pointer">Added Date</SelectItem>
                      <SelectItem value="current_attendees" className="cursor-pointer">Registrations</SelectItem>
                      <SelectItem value="price" className="cursor-pointer">Price</SelectItem>
                      <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className={`h-11 rounded-xl cursor-pointer ${
                      sortDirection === 'asc'
                        ? 'bg-primary-300 text-white hover:bg-primary-400 shadow-sm'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setSortDirection('asc')}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" /> Ascending
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
                    <ArrowDown className="h-4 w-4 mr-2" /> Descending
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border bg-background pb-2">
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

      {/* Move to trash dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move this event to trash? You can restore it later.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-full">
                  <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedEvent.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent delete dialog */}
      <Dialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Permanently Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="p-2 bg-destructive/20 rounded-full">
                  <Trash className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedEvent.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPermanentDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button variant="destructive" className="cursor-pointer" onClick={handleConfirmPermanentDelete}>
              <Trash className="h-4 w-4 mr-2" /> Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-tertiary-600 dark:text-tertiary-400">Restore Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this event from trash?
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-tertiary-50 dark:bg-tertiary-950/30 rounded-lg border border-tertiary-100 dark:border-tertiary-900/50">
                <div className="p-2 bg-tertiary-100 dark:bg-tertiary-950/50 rounded-full">
                  <RotateCcw className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedEvent.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRestoreDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-tertiary-500 hover:bg-tertiary-600 text-white"
              onClick={handleConfirmRestore}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Restore Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish error dialog */}
      <Dialog open={isPublishErrorDialogOpen} onOpenChange={setIsPublishErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> Cannot Publish Event
            </DialogTitle>
            <DialogDescription className="text-destructive">
              {publishError?.message || 'Failed to publish event'}
            </DialogDescription>
          </DialogHeader>

          {publishError?.details && publishError.details.length > 0 && (
            <div className="py-4">
              <p className="text-sm font-medium text-foreground mb-2">Please fix the following issues:</p>
              <ul className="space-y-2">
                {publishError.details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsPublishErrorDialogOpen(false)}
              className="w-full sm:w-auto cursor-pointer"
            >
              Close
            </Button>
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              onClick={() => {
                setIsPublishErrorDialogOpen(false);
                router.push(`/dashboard/events/${publishingEventId || selectedEvent?.id}/edit`);
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" /> Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk action dialog */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'publish' && 'Publish Events'}
              {bulkAction === 'duplicate' && 'Duplicate Events'}
              {bulkAction === 'delete' && 'Move to Trash'}
              {bulkAction === 'permanentDelete' && 'Permanently Delete Events'}
              {bulkAction === 'restore' && 'Restore Events'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to{' '}
              {bulkAction === 'publish' && 'publish'}
              {bulkAction === 'duplicate' && 'duplicate'}
              {bulkAction === 'delete' && 'move to trash'}
              {bulkAction === 'permanentDelete' && 'permanently delete'}
              {bulkAction === 'restore' && 'restore'}{' '}
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
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{event.title}</span>
                    <span className="text-muted-foreground">—</span>
                    <Badge variant="outline" className="text-xs">
                      {event.isDeleted ? 'Trashed' : event.statusDisplayName}
                    </Badge>
                  </div>
                ) : null;
              })}
            </ScrollArea>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={`cursor-pointer ${
                bulkAction === 'permanentDelete' || bulkAction === 'delete'
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : bulkAction === 'restore'
                    ? 'bg-tertiary-500 hover:bg-tertiary-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              onClick={() => {
                if (bulkAction === 'publish') {
                  setIsBulkActionDialogOpen(false);
                  handleBulkPublish();
                } else if (bulkAction === 'duplicate') {
                  handleBulkDuplicate();
                } else if (bulkAction === 'delete') {
                  handleBulkDelete();
                } else if (bulkAction === 'permanentDelete') {
                  handleBulkPermanentDelete();
                } else if (bulkAction === 'restore') {
                  handleBulkRestore();
                }
              }}
            >
              {bulkAction === 'publish' && <CheckCircle2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'duplicate' && <Copy className="h-4 w-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'permanentDelete' && <Trash className="h-4 w-4 mr-2" />}
              {bulkAction === 'restore' && <RotateCcw className="h-4 w-4 mr-2" />}
              {bulkAction === 'publish' && 'Publish All'}
              {bulkAction === 'duplicate' && 'Duplicate All'}
              {bulkAction === 'delete' && 'Move to Trash'}
              {bulkAction === 'permanentDelete' && 'Delete Permanently'}
              {bulkAction === 'restore' && 'Restore All'}
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

function useAuthenticated() {
  return useAppSelectorSafe((state) => state.auth.isAuthenticated);
}

function useAppSelectorSafe<T>(selector: (state: { auth: { isAuthenticated: boolean } }) => T): T {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAppSelector } = require('@/lib/store/hooks');
  return useAppSelector(selector);
}

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  bg: string;
}

function StatCard({ label, value, sub, icon, bg }: StatCardProps) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
          <div className={`p-2.5 sm:p-3 rounded-lg ${bg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrashCard({ count, onClick }: { count: number; onClick: () => void }) {
  const isActive = count > 0;
  return (
    <Card
      className={`${
        isActive
          ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20 ring-1 ring-amber-200/50 dark:ring-amber-900/30 shadow-md shadow-amber-100/30 dark:shadow-amber-950/20'
          : 'border-border bg-muted/50'
      } transition-all duration-300 cursor-pointer hover:shadow-lg`}
      onClick={isActive ? onClick : undefined}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
              Trash
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl sm:text-3xl font-bold ${isActive ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>
                {count}
              </p>
              {isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {count} item{count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              {isActive ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  Click to view & restore <ArrowRight className="h-3 w-3" />
                </span>
              ) : (
                'Empty'
              )}
            </p>
          </div>
          <div
            className={`p-3 rounded-xl transition-all duration-300 ${
              isActive ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shadow-inner' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Trash2 className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableHeadProps {
  label: string;
  field: SortField;
  sortField: SortField;
  onSort: (field: SortField) => void;
  icon: React.ReactNode;
}

function SortableHead({ label, field, onSort, icon }: SortableHeadProps) {
  return (
    <TableHead
      className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {label}
        {icon}
      </div>
    </TableHead>
  );
}

interface AttendanceBarProps {
  current: number;
  capacity: number;
  percent: number;
}

function AttendanceBar({ current, capacity, percent }: AttendanceBarProps) {
  return (
    <div className="w-36">
      <div className="flex justify-between text-xs font-medium text-foreground mb-1">
        <span>
          {current} / {capacity || '∞'}
        </span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  activeTab: string;
  searchQuery: string;
}

function EmptyState({ activeTab, searchQuery }: EmptyStateProps) {
  const title =
    activeTab === 'trash'
      ? 'No events in trash'
      : searchQuery
        ? `No events match "${searchQuery}"`
        : activeTab !== 'all'
          ? `No ${activeTab} events found`
          : 'No events found';

  const description =
    activeTab === 'trash'
      ? 'Deleted events will appear here. You can restore or permanently delete them.'
      : searchQuery
        ? 'Try adjusting your search terms or filters.'
        : activeTab !== 'all'
          ? 'Try changing the status filter.'
          : 'Create your first event to get started.';

  return (
    <div className="flex flex-col items-center gap-2">
      {activeTab === 'trash' ? (
        <Trash2 className="h-8 w-8 text-muted-foreground/40" />
      ) : (
        <Search className="h-8 w-8 text-muted-foreground/40" />
      )}
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
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
        <span className="text-sm text-muted-foreground">
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

interface EventGridCardProps {
  event: UIEvent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: () => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onMoveToTrash: () => void;
}

function EventGridCard({
  event,
  isSelected,
  onClick,
  onView,
  onEdit,
  onDuplicate,
  onPublish,
  onRestore,
  onPermanentDelete,
  onMoveToTrash,
}: EventGridCardProps) {
  const statusConfig = getStatusBadgeConfig(event.statusDisplayName);
  const typeClass = getTypeBadgeClass(event.typeDisplayName);
  const isTrashed = event.isDeleted;
  const addedDate = event.publishedAt || event.createdAt;
  const addedLabel = event.publishedAt ? 'Published' : 'Created';
  const percent = event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-border ${
        isSelected ? 'border-primary/50 bg-primary/5' : ''
      } ${isTrashed ? 'opacity-60 bg-amber-50/30 dark:bg-amber-950/10' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={typeClass}>
              {event.typeDisplayName}
            </Badge>
            {event.isFeatured && !isTrashed && (
              <Badge className="bg-secondary-500 text-white text-xs">
                <Star className="h-3 w-3 mr-1" /> Featured
              </Badge>
            )}
            {event.isPrivate && !isTrashed && (
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-xs">
                <Lock className="h-3 w-3 mr-1" /> Private
              </Badge>
            )}
          </div>
          {isTrashed ? (
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40">
              <Trash2 className="h-3 w-3 mr-1" /> Trashed
            </Badge>
          ) : (
            <Badge variant="outline" className={`${statusConfig.color} border`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
              {event.statusDisplayName}
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-foreground line-clamp-2">{event.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="text-primary font-medium">{event.priceDisplay}</span>
            <span className="text-border">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">{event.cpdHours} CPD Hrs</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{event.time}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-muted-foreground">Added:</span>
          <span>{formatDateShort(addedDate)}</span>
          <span className="text-muted-foreground">({addedLabel})</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {event.registered} / {event.capacity || '∞'} registered
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span>{event.platform}</span>
          </div>
          <EventActionsMenu
            event={event}
            isTrashed={isTrashed}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onPublish={onPublish}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            onMoveToTrash={onMoveToTrash}
            small
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface EventActionsMenuProps {
  event: UIEvent;
  isTrashed: boolean;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onMoveToTrash: () => void;
  small?: boolean;
}

function EventActionsMenu({
  isTrashed,
  onView,
  onEdit,
  onDuplicate,
  onPublish,
  onRestore,
  onPermanentDelete,
  onMoveToTrash,
  small,
}: EventActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={small ? 'h-7 w-7 p-0 cursor-pointer' : 'h-8 w-8 cursor-pointer'}
        >
          <MoreVertical className={small ? 'h-4 w-4 text-muted-foreground' : 'h-4 w-4'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isTrashed ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer text-tertiary-600 dark:text-tertiary-400"
              onClick={(e) => {
                e.stopPropagation();
                onRestore();
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Restore
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onPermanentDelete();
              }}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete Permanently
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-tertiary-600 dark:text-tertiary-400"
              onClick={(e) => {
                e.stopPropagation();
                onPublish();
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Publish
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" /> View Public Page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-amber-600 dark:text-amber-400 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToTrash();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface BulkActionsBarProps {
  selectedIds: string[];
  uiEvents: UIEvent[];
  activeTab: string;
  publishingEventId: string | null;
  onClear: () => void;
  onView: () => void;
  onEdit: (id: string) => void;
  onPublish: (event: UIEvent) => void;
  onBulkAction: (action: string) => void;
  onDeleteEvent: (event: UIEvent) => void;
}

function BulkActionsBar({
  selectedIds,
  uiEvents,
  activeTab,
  publishingEventId,
  onClear,
  onView,
  onEdit,
  onPublish,
  onBulkAction,
  onDeleteEvent,
}: BulkActionsBarProps) {
  const count = selectedIds.length;

  const allDraft = selectedIds.every((id) => {
    const e = uiEvents.find((x) => x.id === id);
    return e?.status === 'Draft' && !e?.isDeleted;
  });

  return (
    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {count} event{count > 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {count === 1 && (
          <>
            <Button size="sm" variant="outline" className="cursor-pointer" onClick={onView}>
              <Eye className="h-4 w-4 mr-2" /> View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onEdit(selectedIds[0])}
            >
              <Edit3 className="h-4 w-4 mr-2" /> Edit
            </Button>
          </>
        )}

        {allDraft && count > 0 && (
          <Button
            size="sm"
            className="cursor-pointer bg-tertiary-600 hover:bg-tertiary-700 text-white"
            onClick={() => {
              if (count === 1) {
                const event = uiEvents.find((e) => e.id === selectedIds[0]);
                if (event) onPublish(event);
              } else {
                onBulkAction('publish');
              }
            }}
            disabled={publishingEventId !== null}
          >
            {publishingEventId && count === 1 ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Publish {count > 1 ? `(${count})` : ''}
          </Button>
        )}

        {count > 1 && (
          <>
            {activeTab === 'trash' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-tertiary-600 dark:text-tertiary-400 border-tertiary-200 dark:border-tertiary-900/50 hover:bg-tertiary-50 dark:hover:bg-tertiary-950/30"
                  onClick={() => onBulkAction('restore')}
                >
                  <RotateCcw className="h-4 w-4 mr-2" /> Restore
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onBulkAction('permanentDelete')}
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete Permanently
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onBulkAction('duplicate')}
                >
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => onBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
                </Button>
              </>
            )}
          </>
        )}

        {count === 1 && (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            onClick={() => {
              const event = uiEvents.find((e) => e.id === selectedIds[0]);
              if (event) onDeleteEvent(event);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
          </Button>
        )}

        <Button size="sm" variant="ghost" className="cursor-pointer" onClick={onClear}>
          <XCircle className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// ERROR HELPERS
// ============================================================

function extractErrorDetails(
  err: unknown,
  fallback: string,
): { message: string; details: string[] } {
  let message = fallback;
  let details: string[] = [];

  const data = (err as { data?: unknown })?.data;
  if (data) {
    if (typeof data === 'string') {
      message = data;
    } else if (typeof data === 'object' && data !== null) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string') message = msg;

      const errs = (data as { errors?: unknown }).errors;
      if (typeof errs === 'string') {
        details = [errs];
      } else if (Array.isArray(errs)) {
        details = errs.map(String);
      } else if (errs && typeof errs === 'object') {
        details = Object.values(errs).map(String);
      }
    }
  }

  if (details.length === 0) {
    details = [message];
  }

  return { message, details };
}
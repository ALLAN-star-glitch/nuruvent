/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  Calendar,
  LogIn,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { useAppSelector } from '@/lib/store/hooks';
import type { Event } from '@/lib/types/events';



import type {
  SortField,
  SortDirection,
  ViewMode,
  UIEvent,
} from './_components/types';
import { useUIEvents } from './_components/useUIEvents';
import { EventsGrid } from './_components/EventsGrid';
import { EventsTable } from './_components/EventsTable';
import { EventsFilterBar } from './_components/EventsFilterBar';
import { EventsBulkActionsBar } from './_components/EventsBulkActionsBar';
import { EventsListSkeleton } from './_components/EventsListSkeleton';
import {
  MoveToTrashDialog,
  PermanentDeleteDialog,
  RestoreEventDialog,
  PublishErrorDialog,
  BulkActionDialog,
} from './_components/EventsDialogs';
import { EmptyState } from '@/components/registrations/empty_state';
import { MobileFilterStrip } from '@/components/registrations/mobile-filter-strip';
import { StatsCards } from '@/components/registrations/stat_cards';

// ============================================================
// PAGE
// ============================================================

export default function EventsDashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] =
    useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [publishError, setPublishError] = useState<{
    message: string;
    details: string[];
  } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] =
    useState(false);
  const [publishingEventId, setPublishingEventId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('eventDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isMobile, setIsMobile] = useState(false);

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
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
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
    { q: debouncedSearchQuery, page: currentPage, page_size: pageSize },
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

  const filteredEvents = useUIEvents({
    rawEvents,
    activeTab,
    sortField,
    sortDirection,
  });

  const [deleteEvent] = useDeleteEventMutation();
  const [permanentlyDeleteEvent] = usePermanentlyDeleteEventMutation();
  const [restoreEvent] = useRestoreEventMutation();
  const [publishEvent] = usePublishEventMutation();
  const [bulkDeleteEvents] = useBulkDeleteEventsMutation();
  const [bulkPermanentlyDeleteEvents] = useBulkPermanentlyDeleteEventsMutation();
  const [bulkRestoreEvents] = useBulkRestoreEventsMutation();
  const [bulkPublishEvents] = useBulkPublishEventsMutation();

  const activeEvents = filteredEvents.filter((e) => !e.isDeleted);
  const totalRegistered = activeEvents.reduce((s, e) => s + e.registered, 0);
  const liveEvents = activeEvents.filter((e) => e.status === 'Published').length;
  const cpdEvents = activeEvents.filter((e) => e.cpdHours > 0).length;

  // ---- Handlers ----
  const handleRowClick = (id: string) =>
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleCardClick = (event: UIEvent) =>
    router.push(`/dashboard/events/${event.id}`);

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
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete event';
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
      toast.success('Event restored');
    } catch {
      toast.error('Failed to restore event');
    }
  };

  const handlePublishEvent = async (event: UIEvent) => {
    setPublishingEventId(event.id);
    setPublishError(null);
    const loadingToast = toast.loading(`Publishing "${event.title}"…`);

    try {
      await publishEvent(event.id).unwrap();
      toast.dismiss(loadingToast);
      toast.success(`"${event.title}" published`, { duration: 4000 });
      await refetch();
    } catch (err) {
      toast.dismiss(loadingToast);
      const { message, details } = extractErrorDetails(
        err,
        'Failed to publish event',
      );
      setPublishError({ message, details });
      setIsPublishErrorDialogOpen(true);
    } finally {
      setPublishingEventId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedEvents([]);
    else setSelectedEvents(filteredEvents.map((e) => e.id));
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
    setIsBulkDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    const count = selectedEvents.length;
    try {
      await bulkDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success(`${count} events moved to trash`);
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete events';
      toast.error(msg);
    }
  };

  const handleBulkPermanentDelete = async () => {
    try {
      await bulkPermanentlyDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkDialogOpen(false);
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
      setIsBulkDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await Promise.all([refetch(), refetchTrashCount()]);
      toast.success('Events restored');
    } catch {
      toast.error('Failed to restore events');
    }
  };

  const handleBulkPublish = async () => {
    const count = selectedEvents.length;
    const loadingToast = toast.loading(`Publishing ${count} events…`);
    try {
      await bulkPublishEvents({ ids: selectedEvents }).unwrap();
      toast.dismiss(loadingToast);
      toast.success(`${count} events published`, { duration: 4000 });
      setIsBulkDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await refetch();
    } catch (err) {
      toast.dismiss(loadingToast);
      const { message, details } = extractErrorDetails(
        err,
        'Failed to publish events',
      );
      setPublishError({ message, details });
      setIsPublishErrorDialogOpen(true);
      setIsBulkDialogOpen(false);
    }
  };

  const handleBulkDuplicate = () => {
    const ids = selectedEvents.join(',');
    setIsBulkDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
    router.push(`/dashboard/events/new?duplicate=${ids}`);
  };

  const handleBulkConfirm = () => {
    if (bulkAction === 'publish') {
      setIsBulkDialogOpen(false);
      handleBulkPublish();
    } else if (bulkAction === 'duplicate') handleBulkDuplicate();
    else if (bulkAction === 'delete') handleBulkDelete();
    else if (bulkAction === 'permanentDelete') handleBulkPermanentDelete();
    else if (bulkAction === 'restore') handleBulkRestore();
  };

  const handleRefresh = async () => {
    toast.promise(
      (async () => {
        await Promise.all([refetch(), refetchTrashCount()]);
      })(),
      {
        loading: 'Refreshing events…',
        success: 'Refreshed',
        error: 'Failed to refresh events',
      },
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveTab('all');
    setSortField('eventDate');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const activeFilterCount = () => {
    let n = 0;
    if (searchQuery) n++;
    if (activeTab !== 'all' && activeTab !== 'trash') n++;
    return n;
  };

  const sortLabel = () => {
    const labels: Record<SortField, string> = {
      name: 'Title',
      eventDate: 'Event Date',
      addedDate: 'Added',
      current_attendees: 'Registrations',
      price: 'Price',
      status: 'Status',
    };
    return labels[sortField];
  };

  // ---- Auth gate ----
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardContent className="pb-6 pt-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-amber-50 p-4 dark:bg-amber-950/40">
                <LogIn className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Authentication required
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Please log in to view and manage your events.
            </p>
            <Button
              className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push('/signin')}
            >
              <LogIn className="mr-2 h-4 w-4" /> Go to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Error gate ----
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md border-destructive/30 shadow-sm">
          <CardContent className="pb-6 pt-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Failed to load events
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Something went wrong while fetching your events.
            </p>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, monitor, and manage your training sessions, workshops, and
            webinars.
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
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Link href="/dashboard/events/new" className="cursor-pointer">
            <Button className="flex cursor-pointer items-center gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create event
            </Button>
          </Link>
        </div>
      </div>

      {/* Skeleton — full page chrome while initial load */}
      {isLoading && !activeData ? (
        <EventsListSkeleton view={isMobile ? 'grid' : viewMode} rows={5} />
      ) : (
        <>
          {/* Stats */}

          <div className="w-full max-w-5xl"></div>
          <StatsCards
            desktopColumns={5}
            stats={[
              {
                label: 'Total Events',
                value: totalItems,
                sub: `${
                  activeEvents.filter((e) => e.status === 'Published').length
                } published`,
                tone: 'primary',
                icon: <Calendar className="h-4 w-4" />,
              },
              {
                label: 'Registrations',
                value: totalRegistered,
                sub: `${
                  activeEvents.filter((e) => e.registered > 0).length
                } events`,
                tone: 'emerald',
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: 'Live Sessions',
                value: liveEvents,
                sub: `${
                  activeEvents.filter((e) => e.status === 'Draft').length
                } drafts`,
                tone: 'sky',
                icon: <Video className="h-4 w-4" />,
              },
              {
                label: 'CPD Accredited',
                value: cpdEvents,
                sub: `${activeEvents.reduce(
                  (s, e) => s + e.cpdHours,
                  0,
                )} total hours`,
                tone: 'amber',
                icon: <Award className="h-4 w-4" />,
              },
              {
                label: 'Trash',
                value: trashedEvents,
                sub: trashedEvents > 0 ? 'Click to view' : 'Empty',
                tone: 'amber',
                icon: <Trash2 className="h-4 w-4" />,
                href: '/dashboard/trash',
              },
            ]}
          />
          

          {/* Desktop filter bar */}
          {!isMobile && (
            <EventsFilterBar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => {
                setSearchQuery('');
                setDebouncedSearchQuery('');
              }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortField={sortField}
              onSortFieldChange={(field) => {
                setSortField(field);
                setSortDirection('asc');
              }}
              sortDirection={sortDirection}
              onToggleSortDirection={() =>
                setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
              }
              count={filteredEvents.length}
              isFetching={isFetching}
              onReset={resetFilters}
              bulkActions={
                selectedEvents.length > 0 ? (
                  <EventsBulkActionsBar
                    selectedIds={selectedEvents}
                    uiEvents={filteredEvents}
                    activeTab={activeTab}
                    publishingEventId={publishingEventId}
                    onClear={() => {
                      setSelectedEvents([]);
                      setSelectAll(false);
                    }}
                    onView={handleViewSelected}
                    onEdit={(id) => router.push(`/dashboard/events/${id}/edit`)}
                    onPublish={handlePublishEvent}
                    onBulkAction={handleBulkAction}
                    onDeleteEvent={handleDeleteEvent}
                  />
                ) : null
              }
            />
          )}

          {/* Table / Grid / Mobile list */}
          {isMobile ? (
            <EventsGrid
              events={filteredEvents}
              selectedIds={selectedEvents}
              onSelectOne={handleSelectEvent}
              onRowClick={handleCardClick}
              onView={(e) => router.push(`/dashboard/events/${e.id}`)}
              onEdit={(e) => router.push(`/dashboard/events/${e.id}/edit`)}
              onDuplicate={(e) =>
                router.push(`/dashboard/events/new?duplicate=${e.id}`)
              }
              onPublish={handlePublishEvent}
              onRestore={handleRestoreEvent}
              onPermanentDelete={handlePermanentDelete}
              onMoveToTrash={handleDeleteEvent}
              emptyState={
                <EmptyState
                  variant="compact"
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  title={
                    activeTab === 'trash'
                      ? 'No events in trash'
                      : searchQuery
                        ? 'No matches'
                        : 'No events yet'
                  }
                  sub={
                    activeTab === 'trash'
                      ? 'Deleted events appear here.'
                      : searchQuery
                        ? 'Try a different search term.'
                        : 'Create your first event to get started.'
                  }
                />
              }
            />
          ) : viewMode === 'table' ? (
            <EventsTable
              events={filteredEvents}
              selectedIds={selectedEvents}
              selectAll={selectAll}
              sortField={sortField}
              sortDirection={sortDirection}
              onToggleSort={(field) => {
                if (sortField === field) {
                  setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortField(field);
                  setSortDirection('asc');
                }
              }}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectEvent}
              onRowClick={handleRowClick}
              onView={(e) => router.push(`/dashboard/events/${e.id}`)}
              onEdit={(e) => router.push(`/dashboard/events/${e.id}/edit`)}
              onDuplicate={(e) =>
                router.push(`/dashboard/events/new?duplicate=${e.id}`)
              }
              onPublish={handlePublishEvent}
              onRestore={handleRestoreEvent}
              onPermanentDelete={handlePermanentDelete}
              onMoveToTrash={handleDeleteEvent}
              emptyState={
                <EmptyState
                  variant="compact"
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  title={
                    activeTab === 'trash'
                      ? 'No events in trash'
                      : searchQuery
                        ? 'No matches'
                        : 'No events yet'
                  }
                  sub={
                    activeTab === 'trash'
                      ? 'Deleted events appear here.'
                      : searchQuery
                        ? 'Try a different search term.'
                        : 'Create your first event to get started.'
                  }
                />
              }
            />
          ) : (
            <EventsGrid
              events={filteredEvents}
              selectedIds={selectedEvents}
              onSelectOne={handleSelectEvent}
              onRowClick={handleCardClick}
              onView={(e) => router.push(`/dashboard/events/${e.id}`)}
              onEdit={(e) => router.push(`/dashboard/events/${e.id}/edit`)}
              onDuplicate={(e) =>
                router.push(`/dashboard/events/new?duplicate=${e.id}`)
              }
              onPublish={handlePublishEvent}
              onRestore={handleRestoreEvent}
              onPermanentDelete={handlePermanentDelete}
              onMoveToTrash={handleDeleteEvent}
              emptyState={
                <EmptyState
                  variant="compact"
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  title={
                    activeTab === 'trash'
                      ? 'No events in trash'
                      : searchQuery
                        ? 'No matches'
                        : 'No events yet'
                  }
                  sub={
                    activeTab === 'trash'
                      ? 'Deleted events appear here.'
                      : searchQuery
                        ? 'Try a different search term.'
                        : 'Create your first event to get started.'
                  }
                />
              }
            />
          )}

          {/* Mobile filter strip */}
          {isMobile && (
            <MobileFilterStrip
              searchValue={searchQuery}
              onSearchClick={() => setIsFilterSheetOpen(true)}
              filterCount={activeFilterCount()}
              onFilterClick={() => setIsFilterSheetOpen(true)}
              sortLabel={sortLabel()}
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
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <SheetDescription className="text-sm text-muted-foreground">
                Refine your event list
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex-1 overflow-y-auto pb-6">
              <div className="mb-5 space-y-1.5">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-4">
                <div className="min-w-0 space-y-1.5">
                  <Label className="truncate text-sm font-medium">Status</Label>
                  <Select
                    value={activeTab}
                    onValueChange={(v) => {
                      setActiveTab(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full cursor-pointer rounded-xl">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">
                        All
                      </SelectItem>
                      <SelectItem value="live" className="cursor-pointer">
                        Live
                      </SelectItem>
                      <SelectItem value="upcoming" className="cursor-pointer">
                        Upcoming
                      </SelectItem>
                      <SelectItem value="draft" className="cursor-pointer">
                        Draft
                      </SelectItem>
                      <SelectItem value="ended" className="cursor-pointer">
                        Ended
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="truncate text-sm font-medium">Sort by</Label>
                  <Select
                    value={sortField}
                    onValueChange={(v: SortField) => setSortField(v)}
                  >
                    <SelectTrigger className="h-11 w-full cursor-pointer rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name" className="cursor-pointer">
                        Title
                      </SelectItem>
                      <SelectItem value="eventDate" className="cursor-pointer">
                        Event date
                      </SelectItem>
                      <SelectItem value="addedDate" className="cursor-pointer">
                        Added date
                      </SelectItem>
                      <SelectItem
                        value="current_attendees"
                        className="cursor-pointer"
                      >
                        Registrations
                      </SelectItem>
                      <SelectItem value="price" className="cursor-pointer">
                        Price
                      </SelectItem>
                      <SelectItem value="status" className="cursor-pointer">
                        Status
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Sort direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className="h-11 cursor-pointer rounded-xl"
                    onClick={() => setSortDirection('asc')}
                  >
                    Ascending
                  </Button>
                  <Button
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className="h-11 cursor-pointer rounded-xl"
                    onClick={() => setSortDirection('desc')}
                  >
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
                Reset
              </Button>
              <Button
                className="h-11 flex-1 cursor-pointer rounded-xl"
                onClick={() => setIsFilterSheetOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <MoveToTrashDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        event={selectedEvent}
        onConfirm={handleConfirmDelete}
      />
      <PermanentDeleteDialog
        open={isPermanentDeleteDialogOpen}
        onOpenChange={setIsPermanentDeleteDialogOpen}
        event={selectedEvent}
        onConfirm={handleConfirmPermanentDelete}
      />
      <RestoreEventDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
        event={selectedEvent}
        onConfirm={handleConfirmRestore}
      />
      <PublishErrorDialog
        open={isPublishErrorDialogOpen}
        onOpenChange={setIsPublishErrorDialogOpen}
        error={publishError}
        onEdit={() =>
          router.push(
            `/dashboard/events/${publishingEventId || selectedEvent?.id}/edit`,
          )
        }
      />
      <BulkActionDialog
        open={isBulkDialogOpen}
        onOpenChange={setIsBulkDialogOpen}
        action={bulkAction}
        selectedIds={selectedEvents}
        uiEvents={filteredEvents}
        onConfirm={handleBulkConfirm}
      />
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
      if (typeof errs === 'string') details = [errs];
      else if (Array.isArray(errs)) details = errs.map(String);
      else if (errs && typeof errs === 'object')
        details = Object.values(errs).map(String);
    }
  }

  if (details.length === 0) details = [message];
  return { message, details };
}
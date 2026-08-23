// app/dashboard/trash/page.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
  LogIn,
  RotateCcw,
  Trash,
  Star,
  Lock,
  Search,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Users,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import {
  useGetTrashedEventsQuery,
  useRestoreEventMutation,
  usePermanentlyDeleteEventMutation,
  useBulkRestoreEventsMutation,
  useBulkPermanentlyDeleteEventsMutation,
  useGetEventStatusesQuery,
  useGetEventTypesQuery,
} from '@/lib/store/api/eventsApi';
import {
  setCurrentPage,
  setPageSize,
  setTotalEvents,
} from '@/lib/store/slices/eventsSlice';
import { toast } from 'sonner';

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

const formatTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const getStatusConfig = (statusId: string, statusesMap: Record<string, string>) => {
  const displayName = statusesMap[statusId] || statusId || 'Draft';
  
  const statusMap: Record<string, { color: string; dot: string }> = {
    'Draft': { color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
    'Published': { color: 'text-green-600 bg-green-50 border-green-200', dot: 'bg-green-500' },
    'Cancelled': { color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
    'Completed': { color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  };
  
  const config = statusMap[displayName] || statusMap['Draft'];
  return { ...config, displayName };
};

const getTypeConfig = (typeId: string, typesMap: Record<string, string>) => {
  const displayName = typesMap[typeId] || typeId || 'Event';
  
  const classNameMap: Record<string, string> = {
    'Workshop': 'bg-purple-100 text-purple-700 border-purple-200',
    'Webinar': 'bg-blue-100 text-blue-700 border-blue-200',
    'Meetup': 'bg-amber-100 text-amber-700 border-amber-200',
    'Bootcamp': 'bg-red-100 text-red-700 border-red-200',
    'Uncategorized': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  
  return {
    displayName: displayName,
    className: classNameMap[displayName] || 'bg-gray-100 text-gray-700 border-gray-200'
  };
};

const formatPrice = (price: number): string => {
  if (price === 0) return 'Free';
  return `KES ${price.toLocaleString()}`;
};

type SortField = 'name' | 'deletedDate' | 'status' | 'type';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

const convertApiEventToUI = (event: any, typesMap: Record<string, string>, statusesMap: Record<string, string>) => ({
  id: event.id || event.ID,
  title: event.display_name || event.DisplayName || event.name || event.Name || 'Untitled Event',
  eventTypeId: event.event_type_id || event.EventTypeID,
  eventStatusId: event.event_status_id || event.EventStatusID,
  type: typesMap[event.event_type_id || event.EventTypeID] || event.event_type_id || event.EventTypeID,
  status: statusesMap[event.event_status_id || event.EventStatusID] || event.event_status_id || event.EventStatusID,
  date: event.date || event.Date ? new Date(event.date || event.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
  time: event.time || event.Time || 'TBD',
  registered: event.current_attendees || event.CurrentAttendees || 0,
  capacity: event.max_attendees || event.MaxAttendees || 0,
  price: formatPrice(event.price || event.Price || 0),
  platform: event.is_virtual || event.IsVirtual ? (event.zoom_link || event.ZoomLink ? 'Zoom' : event.meet_link || event.MeetLink ? 'Google Meet' : 'Virtual') : 'In-Person',
  cpdHours: Math.round((event.duration || event.Duration || 0) / 60) || 0,
  description: event.description || event.Description,
  location: event.location || event.Location || 'Virtual',
  slug: event.slug || event.Slug,
  isFeatured: event.is_featured || event.IsFeatured || false,
  isPrivate: event.is_private || event.IsPrivate || false,
  deletedAt: event.deleted_at || event.DeletedAt,
  deletedBy: event.deleted_by || event.DeletedBy,
  createdAt: event.created_at || event.CreatedAt || event.date || event.Date,
  accountId: event.account_id || event.AccountID,
});

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TrashPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { account, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const accountId = account?.id || user?.id || '';
  const { currentPage, pageSize } = useAppSelector((state) => state.events);

  // Local state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('deletedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [debouncedSearchQuery, dispatch]);

  // ============================================================
  // API HOOKS
  // ============================================================

  const { data: statusesData } = useGetEventStatusesQuery(undefined, { skip: !accountId || !isAuthenticated });
  const { data: typesData } = useGetEventTypesQuery(undefined, { skip: !accountId || !isAuthenticated });

  const {
    data: trashData,
    isLoading,
    isFetching,
    refetch,
  } = useGetTrashedEventsQuery({
    account_id: accountId || '',
    page: currentPage,
    page_size: pageSize,
  }, {
    skip: !accountId || !isAuthenticated,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
  });

  const [restoreEvent] = useRestoreEventMutation();
  const [permanentlyDeleteEvent] = usePermanentlyDeleteEventMutation();
  const [bulkRestoreEvents] = useBulkRestoreEventsMutation();
  const [bulkPermanentlyDeleteEvents] = useBulkPermanentlyDeleteEventsMutation();

  // ============================================================
  // MEMOIZED VALUES
  // ============================================================

  const statusesMap = useMemo(() => {
    if (!statusesData) return {};
    const array = Array.isArray(statusesData) ? statusesData : (statusesData as any)?.data || [];
    return array.reduce((acc: any, s: any) => ({ 
      ...acc, 
      [s.id || s.ID]: s.display_name || s.name || s.Name 
    }), {});
  }, [statusesData]);

  const typesMap = useMemo(() => {
    if (!typesData) return {};
    const array = Array.isArray(typesData) ? typesData : (typesData as any)?.data || [];
    return array.reduce((acc: any, t: any) => ({ 
      ...acc, 
      [t.id || t.ID]: t.display_name || t.name || t.Name 
    }), {});
  }, [typesData]);

  const uiEvents = useMemo(() => {
    if (!trashData?.data) return [];
    return trashData.data.map((event) => convertApiEventToUI(event, typesMap, statusesMap));
  }, [trashData, typesMap, statusesMap]);

  const filteredEvents = useMemo(() => {
    let filtered = [...uiEvents];

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query) ||
        e.status.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'deletedDate':
          comparison = new Date(a.deletedAt).getTime() - new Date(b.deletedAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [uiEvents, debouncedSearchQuery, sortField, sortDirection]);

  useEffect(() => {
    if (trashData) {
      dispatch(setTotalEvents(trashData.total || 0));
    }
  }, [trashData, dispatch]);

  const totalItems = trashData?.total || filteredEvents.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const draftCount = uiEvents.filter(e => e.status === 'Draft').length;
  const publishedCount = uiEvents.filter(e => e.status === 'Published').length;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleRestoreEvent = (event: any) => {
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
    } catch (err: any) {
      console.error('Failed to restore event:', err);
      toast.error(err?.data?.message || 'Failed to restore event');
    }
  };

  const handlePermanentDelete = (event: any) => {
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
    } catch (err: any) {
      console.error('Failed to permanently delete event:', err);
      toast.error(err?.data?.message || 'Failed to permanently delete event');
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleRestoreSelected = () => {
    if (selectedEvents.length === 0) return;

    if (selectedEvents.length === 1) {
      const event = uiEvents.find(e => e.id === selectedEvents[0]);
      if (event) {
        handleRestoreEvent(event);
      }
    } else {
      handleBulkAction('restore');
    }
  };

  const handlePermanentDeleteSelected = () => {
    if (selectedEvents.length === 0) return;

    if (selectedEvents.length === 1) {
      const event = uiEvents.find(e => e.id === selectedEvents[0]);
      if (event) {
        handlePermanentDelete(event);
      }
    } else {
      handleBulkAction('permanentDelete');
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      const count = selectedEvents.length;
      setSelectedEvents([]);
      setSelectAll(false);
      toast.success(`${count} events restored successfully`);
      await refetch();
    } catch (err: any) {
      console.error('Failed to restore events:', err);
      toast.error(err?.data?.message || 'Failed to restore events');
    }
  };

  const handleBulkPermanentDelete = async () => {
    try {
      await bulkPermanentlyDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      const count = selectedEvents.length;
      setSelectedEvents([]);
      setSelectAll(false);
      toast.success(`${count} events permanently deleted`);
      await refetch();
    } catch (err: any) {
      console.error('Failed to permanently delete events:', err);
      toast.error(err?.data?.message || 'Failed to permanently delete events');
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEvents(prev => {
      if (prev.includes(id)) {
        return prev.filter(e => e !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setPageSize(size));
    dispatch(setCurrentPage(1));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    dispatch(setCurrentPage(1));
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Trash refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh trash');
    }
  };

  const getSelectedCount = () => selectedEvents.length;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />;
  };

  const getSortLabel = () => {
    const labels = { name: 'Title', deletedDate: 'Deleted Date', status: 'Status', type: 'Type' };
    return labels[sortField];
  };

  const handleMobileReset = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSortField('deletedDate');
    setSortDirection('desc');
    dispatch(setCurrentPage(1));
    setIsFilterSheetOpen(false);
  };

  const handleMobileApply = () => {
    setIsFilterSheetOpen(false);
  };

  // ============================================================
  // AUTHENTICATION CHECKS
  // ============================================================

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md w-full border-neutral-light shadow-sm">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-50 rounded-full">
                <LogIn className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-sm text-gray-500 mb-6">Please log in to view your trash.</p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer"
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

  if (!accountId) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md w-full border-neutral-light shadow-sm">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Not Found</h2>
            <p className="text-sm text-gray-500 mb-6">We couldn&apos;t find your account information.</p>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !trashData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading trash...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-amber-500" />
              Trash
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your soft-deleted events.
            </p>
          </div>
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
        </div>
      </div>

      {/* ✅ Stats Cards - Fully Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total in Trash</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{trashData?.total || 0}</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg flex-shrink-0 ml-2">
                <Trash2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Drafts</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{draftCount}</p>
              </div>
              <div className="p-2.5 bg-gray-50 text-gray-600 rounded-lg flex-shrink-0 ml-2">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{publishedCount}</p>
              </div>
              <div className="p-2.5 bg-green-50 text-green-600 rounded-lg flex-shrink-0 ml-2">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Filters */}
      {!isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* View Options and Sort */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'table'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                      title="Table View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'grid'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="text-xs text-gray-400 hidden sm:inline">|</span>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 hidden sm:inline">Sort by:</span>
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
                        <SelectItem value="deletedDate" className="cursor-pointer text-sm">Deleted Date</SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">Status</SelectItem>
                        <SelectItem value="type" className="cursor-pointer text-sm">Type</SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortDirection === 'asc'
                        ? <ArrowUp className="h-4 w-4 text-primary" />
                        : <ArrowDown className="h-4 w-4 text-primary" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs text-gray-400">
                    {isFetching && <Loader2 className="h-3.5 w-3.5 inline animate-spin mr-1" />}
                    {filteredEvents.length} item{filteredEvents.length !== 1 ? 's' : ''} in trash
                    {debouncedSearchQuery && (
                      <span className="text-gray-400 ml-1">
                        (searching &quot;{debouncedSearchQuery}&quot;)
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                      setSortField('deletedDate');
                      setSortDirection('desc');
                      dispatch(setCurrentPage(1));
                    }}
                  >
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {getSelectedCount() > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {getSelectedCount()} item{getSelectedCount() > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-green-600 border-green-200 hover:bg-green-50"
                    onClick={handleRestoreSelected}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {getSelectedCount() === 1 ? 'Restore' : 'Restore All'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handlePermanentDeleteSelected}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    {getSelectedCount() === 1 ? 'Delete Permanently' : 'Delete All Permanently'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedEvents([]);
                      setSelectAll(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================
          DESKTOP TABLE VIEW
          ============================================================ */}
      {!isMobile && viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="py-3 px-4 w-10">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        className="cursor-pointer"
                        disabled={filteredEvents.length === 0}
                      />
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('name')}>
                      <div className="flex items-center">
                        Event Title {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('type')}>
                      <div className="flex items-center">
                        Type {getSortIcon('type')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center">
                        Status {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('deletedDate')}>
                      <div className="flex items-center">
                        Deleted At {getSortIcon('deletedDate')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const isSelected = selectedEvents.includes(event.id);
                      const statusConfig = getStatusConfig(event.eventStatusId, statusesMap);
                      const typeInfo = getTypeConfig(event.eventTypeId, typesMap);

                      return (
                        <TableRow
                          key={event.id}
                          className={`hover:bg-gray-50/60 transition-colors group ${isSelected ? 'bg-primary/5' : ''}`}
                        >
                          <TableCell className="py-4 px-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectEvent(event.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {event.title}
                              {event.isFeatured && (
                                <Badge variant="default" className="ml-2 bg-secondary-500 text-white text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {event.isPrivate && (
                                <Badge variant="outline" className="ml-2 text-amber-600 border-amber-200 bg-amber-50 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                              <span className="text-gray-400">{event.platform}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-primary font-medium">{event.price}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-amber-600 font-medium">{event.cpdHours} CPD Hrs</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={typeInfo.className}>
                              {typeInfo.displayName}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${statusConfig.color} border`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                              {statusConfig.displayName}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-gray-600">
                            <div className="flex flex-col">
                              <span className="text-sm">{formatDate(event.deletedAt)}</span>
                              <span className="text-xs text-gray-400">{formatTime(event.deletedAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-green-600"
                                  onClick={() => handleRestoreEvent(event)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600"
                                  onClick={() => handlePermanentDelete(event)}
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
                      <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Trash2 className="h-8 w-8 text-gray-300" />
                          <p className="font-medium">
                            {searchQuery
                              ? `No trashed events match "${searchQuery}"`
                              : 'No events in trash'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {searchQuery
                              ? 'Try adjusting your search terms.'
                              : 'Deleted events will appear here. You can restore or permanently delete them.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
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
                  <span className="text-sm text-gray-500">
                    {totalItems > 0
                      ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`
                      : '0 of 0'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================================
          DESKTOP GRID VIEW
          ============================================================ */}
      {!isMobile && viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const statusConfig = getStatusConfig(event.eventStatusId, statusesMap);
                const typeInfo = getTypeConfig(event.eventTypeId, typesMap);
                const isSelected = selectedEvents.includes(event.id);

                return (
                  <Card
                    key={event.id}
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200/80 ${isSelected ? 'border-primary/50 bg-primary/5' : ''}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={typeInfo.className}>
                            {typeInfo.displayName}
                          </Badge>
                          {event.isFeatured && (
                            <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {event.isPrivate && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={`${statusConfig.color} border`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                          {statusConfig.displayName}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="text-primary font-medium">{event.price}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-amber-600 font-medium">{event.cpdHours} CPD Hrs</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{event.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-gray-400">Deleted:</span>
                        <span>{formatDate(event.deletedAt)}</span>
                        <span className="text-gray-400">({formatTime(event.deletedAt)})</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{event.registered} / {event.capacity} registered</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{event.platform}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 p-0 cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600"
                              onClick={() => handleRestoreEvent(event)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600"
                              onClick={() => handlePermanentDelete(event)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Trash2 className="h-8 w-8 text-gray-300" />
                  <p className="font-medium">
                    {searchQuery
                      ? `No trashed events match "${searchQuery}"`
                      : 'No events in trash'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search terms.'
                      : 'Deleted events will appear here. You can restore or permanently delete them.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination for Grid View */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
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
                <span className="text-sm text-gray-500">
                  {totalItems > 0
                    ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`
                    : '0 of 0'}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          MOBILE CARD VIEW
          ============================================================ */}
      {isMobile && (
        <div className="space-y-4 pb-24">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const statusConfig = getStatusConfig(event.eventStatusId, statusesMap);
              const typeInfo = getTypeConfig(event.eventTypeId, typesMap);
              const isSelected = selectedEvents.includes(event.id);

              return (
                <Card 
                  key={event.id} 
                  className={`border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${isSelected ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={typeInfo.className}>
                          {typeInfo.displayName}
                        </Badge>
                        {event.isFeatured && (
                          <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {event.isPrivate && (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={`${statusConfig.color} border`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                        {statusConfig.displayName}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="text-primary font-medium">{event.price}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-amber-600 font-medium">{event.cpdHours} CPD Hrs</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{event.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-gray-400">Deleted:</span>
                      <span>{formatDate(event.deletedAt)}</span>
                      <span className="text-gray-400">({formatTime(event.deletedAt)})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.registered} / {event.capacity} registered</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Globe className="h-3.5 w-3.5" />
                        <span>{event.platform}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectEvent(event.id)}
                          className="cursor-pointer"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 p-0 cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600"
                              onClick={() => handleRestoreEvent(event)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600"
                              onClick={() => handlePermanentDelete(event)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <Trash2 className="h-8 w-8 text-gray-300" />
                <p className="font-medium">
                  {searchQuery
                    ? `No trashed events match "${searchQuery}"`
                    : 'No events in trash'}
                </p>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? 'Try adjusting your search terms.'
                    : 'Deleted events will appear here.'}
                </p>
              </div>
            </div>
          )}

          {/* Mobile Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="cursor-pointer">5</SelectItem>
                    <SelectItem value="10" className="cursor-pointer">10</SelectItem>
                    <SelectItem value="20" className="cursor-pointer">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {totalItems > 0 
                    ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`
                    : '0 of 0'
                  }
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Floating Filter Strip */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md bg-white rounded-full shadow-lg border border-gray-200/80 backdrop-blur-sm bg-white/95">
            <div className="flex items-center justify-between px-4 py-2.5 gap-2">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors"
              >
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  {searchQuery || 'Search trash'}
                </span>
              </button>
              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors relative"
              >
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Filters</span>
                {(searchQuery || sortField !== 'deletedDate') && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    1
                  </span>
                )}
              </button>
              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors"
              >
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate max-w-[60px]">
                  {getSortLabel()}
                </span>
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-3 w-3 text-gray-400" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0 pb-0" showCloseButton={false}>
          <div className="px-6 pt-6 pb-8 h-full flex flex-col">
            <SheetHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-semibold">Filter & Sort</SheetTitle>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="cursor-pointer h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <SheetDescription className="text-sm text-gray-500">
                Refine your trash list
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search trashed events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-11 cursor-text border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5 min-w-0 overflow-hidden">
                  <Label className="text-sm font-medium text-gray-700 truncate">Sort By</Label>
                  <Select
                    value={sortField}
                    onValueChange={(value: SortField) => {
                      setSortField(value);
                    }}
                  >
                    <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                      <div className="truncate w-full text-left">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name" className="cursor-pointer">Title</SelectItem>
                      <SelectItem value="deletedDate" className="cursor-pointer">Deleted Date</SelectItem>
                      <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
                      <SelectItem value="type" className="cursor-pointer">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 min-w-0 overflow-hidden">
                  <Label className="text-sm font-medium text-gray-700 truncate">View</Label>
                  <Select
                    value={viewMode}
                    onValueChange={(value: ViewMode) => setViewMode(value)}
                  >
                    <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                      <div className="truncate w-full text-left">
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table" className="cursor-pointer">Table</SelectItem>
                      <SelectItem value="grid" className="cursor-pointer">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className={`h-11 rounded-xl cursor-pointer transition-all ${sortDirection === 'asc'
                        ? 'bg-primary-300 text-white hover:bg-primary-400 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    onClick={() => setSortDirection('asc')}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Ascending
                  </Button>
                  <Button
                    variant={sortDirection === 'desc' ? 'default' : 'outline'}
                    className={`h-11 rounded-xl cursor-pointer transition-all ${sortDirection === 'desc'
                        ? 'bg-primary-300 text-white hover:bg-primary-400 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    onClick={() => setSortDirection('desc')}
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Descending
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 bg-white pb-2">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl cursor-pointer border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={handleMobileReset}
              >
                Reset All
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl cursor-pointer bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
                onClick={handleMobileApply}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Restore Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this event from trash?
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="p-2 bg-green-100 rounded-full">
                  <RotateCcw className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedEvent.title}</p>
                  <p className="text-sm text-gray-500">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="default" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirmRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Permanently Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedEvent.title}</p>
                  <p className="text-sm text-gray-500">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPermanentDeleteDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" className="cursor-pointer" onClick={handleConfirmPermanentDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'restore' && 'Restore Events'}
              {bulkAction === 'permanentDelete' && 'Permanently Delete Events'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'restore' && (
                <>You are about to restore <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''} from trash.</>
              )}
              {bulkAction === 'permanentDelete' && (
                <>You are about to permanently delete <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedEvents.map(id => {
                const event = uiEvents.find(e => e.id === id);
                return event ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{event.title}</span>
                    <span className="text-gray-400">—</span>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                ) : null;
              })}
            </ScrollArea>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={`cursor-pointer ${bulkAction === 'permanentDelete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
              onClick={() => {
                if (bulkAction === 'restore') {
                  handleBulkRestore();
                } else if (bulkAction === 'permanentDelete') {
                  handleBulkPermanentDelete();
                }
              }}
            >
              {bulkAction === 'restore' && <RotateCcw className="h-4 w-4 mr-2" />}
              {bulkAction === 'permanentDelete' && <Trash className="h-4 w-4 mr-2" />}
              {bulkAction === 'restore' && 'Restore All'}
              {bulkAction === 'permanentDelete' && 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Video,
  Filter,
  Check,
  Eye,
  MapPin,
  Award,
  Globe,
  XCircle,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
  LogIn,
  AlertCircle,
  Star,
  Lock,
  Trash,
  RotateCcw,
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
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import {
  useGetEventsByAccountQuery,
  useSearchEventsQuery,
  useDeleteEventMutation,
  usePermanentlyDeleteEventMutation,
  useRestoreEventMutation,
  usePublishEventMutation,
  useGetEventStatusesQuery,
  useGetEventTypesQuery,
  EventResponse,
  useBulkDeleteEventsMutation,
  useBulkPermanentlyDeleteEventsMutation,
  useBulkRestoreEventsMutation,
  useBulkPublishEventsMutation,
  useGetTrashedEventsCountQuery,
} from '@/lib/store/api/eventsApi';
import {
  setCurrentPage,
  setPageSize,
  setTotalEvents,
} from '@/lib/store/slices/eventsSlice';
import { toast } from 'sonner';

// Helper to format price
const formatPrice = (price: number): string => {
  if (price === 0) return 'Free';
  return `KES ${price.toLocaleString()}`;
};

// Helper to format date for display
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

// Helper to get status color config based on status name
const getStatusConfig = (statusName: string) => {
  const statusMap: Record<string, { color: string; dot: string }> = {
    'Draft': { color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
    'Published': { color: 'text-green-600 bg-green-50 border-green-200', dot: 'bg-green-500' },
    'Cancelled': { color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
    'Completed': { color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  };
  return statusMap[statusName] || statusMap.Draft;
};


// Helper to get type color config based on type name
const getTypeConfig = (typeName: string) => {
  const typeMap: Record<string, string> = {
    'Workshop': 'bg-purple-100 text-purple-700',
    'Webinar': 'bg-blue-100 text-blue-700',
    'Meetup': 'bg-amber-100 text-amber-700',
    'Bootcamp': 'bg-red-100 text-red-700',
  };
  return typeMap[typeName] || 'bg-gray-100 text-gray-700';
};

type SortField = 'name' | 'eventDate' | 'addedDate' | 'current_attendees' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

// Convert API event to UI event with mapping data - SUPPORTS BOTH CASES
const convertApiEventToUI = (
  event: EventResponse,
  typesMap: Record<string, string>,
  statusesMap: Record<string, string>
): any => {
  // Helper to get value from either camelCase or snake_case
  const getVal = (camel: string, snake: string) => {
    return (event as any)[camel] ?? (event as any)[snake];
  };

  const id = getVal('id', 'ID');
  const displayName = getVal('display_name', 'DisplayName') || getVal('name', 'Name'); 
  const eventTypeId = getVal('event_type_id', 'EventTypeID');
  const eventStatusId = getVal('event_status_id', 'EventStatusID');
  const date = getVal('date', 'Date');
  const time = getVal('time', 'Time');
  const currentAttendees = getVal('current_attendees', 'CurrentAttendees') || 0;
  const maxAttendees = getVal('max_attendees', 'MaxAttendees') || 0;
  const price = getVal('price', 'Price') || 0;
  const isVirtual = getVal('is_virtual', 'IsVirtual') || false;
  const zoomLink = getVal('zoom_link', 'ZoomLink');
  const meetLink = getVal('meet_link', 'MeetLink');
  const duration = getVal('duration', 'Duration') || 0;
  const description = getVal('description', 'Description');
  const location = getVal('location', 'Location') || 'Virtual';
  const imageUrl = getVal('image_url', 'ImageURL');
  const slug = getVal('slug', 'Slug');
  const accountId = getVal('account_id', 'AccountID');
  const isActive = getVal('is_active', 'IsActive');
  const deletedAt = getVal('deleted_at', 'DeletedAt');
  const deletedBy = getVal('deleted_by', 'DeletedBy');
  const restoredAt = getVal('restored_at', 'RestoredAt');
  const restoredBy = getVal('restored_by', 'RestoredBy');
  const createdAt = getVal('created_at', 'CreatedAt') || date;
  const updatedAt = getVal('updated_at', 'UpdatedAt') || date;
  const isFeatured = getVal('is_featured', 'IsFeatured') || false;
  const isPrivate = getVal('is_private', 'IsPrivate') || false;
  const certificatePrice = getVal('certificate_price', 'CertificatePrice') || 0;

  return {
    id,
    title: displayName,
    type: typesMap[eventTypeId] || eventTypeId,
    status: statusesMap[eventStatusId] || eventStatusId,
    date: date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    time: time || 'TBD',
    registered: currentAttendees,
    capacity: maxAttendees,
    price: formatPrice(price),
    platform: isVirtual ? (zoomLink ? 'Zoom' : meetLink ? 'Google Meet' : 'Virtual') : 'In-Person',
    cpdHours: Math.round(duration / 60) || 0,
    description,
    host: accountId,
    location: location,
    image: imageUrl,
    slug,
    eventTypeId,
    eventStatusId,
    rawDate: date,
    rawTime: time,
    duration,
    certificatePrice,
    isVirtual,
    isFeatured,
    isPrivate,
    zoomLink,
    meetLink,
    currentAttendees,
    maxAttendees,
    accountId,
    isActive,
    deletedAt,
    deletedBy,
    restoredAt,
    restoredBy,
    createdAt,
    updatedAt,
    isDeleted: !!deletedAt,
  };
};

export default function EventsDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get auth state
  const { account, user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Use account.id for the accountId, fallback to user.id
  const accountId = account?.id || user?.id || '';

  // Get events state from Redux
  const { currentPage, pageSize } = useAppSelector((state) => state.events);
  
  // Local state
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  const [publishError, setPublishError] = useState<{ message: string; details: string[] } | null>(null);
  const [isPublishErrorDialogOpen, setIsPublishErrorDialogOpen] = useState(false);
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  

  // Sort and view state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('eventDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [debouncedSearchQuery, dispatch]);

  // ============================================================
  // STEP 1: Fetch Statuses and Types (mapping data)
  // ============================================================
  const { 
    data: statusesData, 
    isLoading: isStatusesLoading,
    error: statusesError,
  } = useGetEventStatusesQuery(undefined, {
    skip: !accountId || !isAuthenticated,
  });
  
  const { 
    data: typesData, 
    isLoading: isTypesLoading,
    error: typesError,
  } = useGetEventTypesQuery(undefined, {
    skip: !accountId || !isAuthenticated,
  });

  // Create maps for quick lookups: ID → Name (supports both cases)
  const statusesMap = useMemo(() => {
    if (!statusesData) return {};
    
    const statusesArray = Array.isArray(statusesData) 
      ? statusesData 
      : (statusesData as any)?.data || [];
    
    return statusesArray.reduce((acc: any, status: any) => ({
      ...acc,
      [status.id || status.ID]: status.name || status.Name
    }), {});
  }, [statusesData]);

  const typesMap = useMemo(() => {
    if (!typesData) return {};
    
    const typesArray = Array.isArray(typesData) 
      ? typesData 
      : (typesData as any)?.data || [];
    
    return typesArray.reduce((acc: any, type: any) => ({
      ...acc,
      [type.id || type.ID]: type.name || type.Name
    }), {});
  }, [typesData]);

  // Determine if we should search
  const shouldSearch = debouncedSearchQuery.trim().length > 0;

  // ============================================================
  // STEP 2: Fetch Events with cache invalidation for fresh data
  // ============================================================
  const {
  data: browseData,
  isLoading: isBrowseLoading,
  isFetching: isBrowseFetching,
  error: browseError,
  refetch: refetchBrowse,
} = useGetEventsByAccountQuery({
  accountId: accountId || '',
  page: currentPage,
  page_size: pageSize,
 
}, {
  skip: shouldSearch || !accountId || !isAuthenticated,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  refetchOnFocus: true,
});

  const {
  data: searchData,
  isLoading: isSearchLoading,
  isFetching: isSearchFetching,
  error: searchError,
  refetch: refetchSearch,
} = useSearchEventsQuery({
  q: debouncedSearchQuery,
  account_id: accountId || '',
  page: currentPage,
  page_size: pageSize,
}, {
  skip: !shouldSearch || !accountId || !isAuthenticated,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  refetchOnFocus: true,
});

  // Mutations
  const [deleteEvent] = useDeleteEventMutation();
  const [permanentlyDeleteEvent] = usePermanentlyDeleteEventMutation();
  const [restoreEvent] = useRestoreEventMutation();
  const [publishEvent] = usePublishEventMutation();
  const [bulkDeleteEvents] = useBulkDeleteEventsMutation();
  const [bulkPermanentlyDeleteEvents] = useBulkPermanentlyDeleteEventsMutation();
  const [bulkRestoreEvents] = useBulkRestoreEventsMutation();
  const [bulkPublishEvents] = useBulkPublishEventsMutation();


  const { data: trashCountData } = useGetTrashedEventsCountQuery({
  account_id: accountId || '',
  }, {
    skip: !accountId || !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Use this for the trash count
  const trashedEvents = trashCountData?.count || 0;

  // Use the appropriate data
  const activeData = shouldSearch ? searchData : browseData;
  const isLoading = isStatusesLoading || isTypesLoading || (shouldSearch ? isSearchLoading : isBrowseLoading);
  const isFetching = shouldSearch ? isSearchFetching : isBrowseFetching;
  const error = shouldSearch ? searchError : browseError;
  const refetch = shouldSearch ? refetchSearch : refetchBrowse;

  // Update Redux state when data changes
  useEffect(() => {
    if (activeData) {
      dispatch(setTotalEvents(activeData.total || 0));
    }
  }, [activeData, dispatch]);

  // ============================================================
  // STEP 3: Convert API events to UI format with mapping
  // ============================================================
  const uiEvents = useMemo(() => {
    if (!activeData?.data) return [];
    return activeData.data.map((event) => 
      convertApiEventToUI(event, typesMap, statusesMap)
    );
  }, [activeData, typesMap, statusesMap]);

  // Filter events based on active tab (including trash)
  const filteredEvents = useMemo(() => {
    let filtered = [...uiEvents];

    // Filter by tab (status or trash)
    if (activeTab === 'trash') {
      filtered = filtered.filter((event) => event.isDeleted);
    } else if (activeTab !== 'all') {
      const statusNameMap: Record<string, string> = {
        'live': 'Published',
        'upcoming': 'Published',
        'draft': 'Draft',
        'ended': 'Completed',
      };
      const targetStatusName = statusNameMap[activeTab];
      
      if (targetStatusName) {
        filtered = filtered.filter((event) => 
          !event.isDeleted && event.status === targetStatusName
        );
      }
    } else {
      // 'all' - show only non-deleted events
      filtered = filtered.filter((event) => !event.isDeleted);
    }

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'eventDate':
          comparison = new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
          break;
        case 'addedDate': {
          const dateA = a.publishedAt || a.createdAt;
          const dateB = b.publishedAt || b.createdAt;
          comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
          break;
        }
        case 'current_attendees':
          comparison = a.registered - b.registered;
          break;
        case 'price':
          comparison = parseFloat(a.price.replace(/[^0-9.-]+/g, '')) - 
                       parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [uiEvents, activeTab, sortField, sortDirection]);

  // Get total from API or filtered length
  const totalItems = activeData?.total || filteredEvents.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Stats (excluding deleted events)
  const activeEvents = uiEvents.filter(e => !e.isDeleted);
  const totalEvents = activeEvents.length;
  const totalRegistered = activeEvents.reduce((acc, e) => acc + (e.registered || 0), 0);
  const liveEvents = activeEvents.filter(e => e.status === 'Published').length;
  const cpdEvents = activeEvents.filter(e => e.cpdHours > 0).length;


  // Handler functions
  const handleRowClick = (eventId: string) => {
    if (!isMobile) {
      handleSelectEvent(eventId);
    }
  };

  const handleCardClick = (event: any) => {
    if (isMobile) {
      handleViewEvent(event);
    } else {
      handleSelectEvent(event.id);
    }
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleDeleteEvent = async (event: any) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

 const handleConfirmDelete = async () => {
  if (!selectedEvent) return;
  try {
    // ✅ This is the SINGLE delete API - uses DELETE /api/v1/events/{id}
    await deleteEvent(selectedEvent.id).unwrap();
    setIsDeleteDialogOpen(false);
    setSelectedEvent(null);
    await refetch();
    toast.success('Event moved to trash');
  } catch (err: any) {
    console.error('Failed to delete event:', err);
    const errorMsg = err?.data?.message || err?.message || 'Failed to delete event';
    toast.error(errorMsg);
  }
};

  // Permanent Delete
  const handlePermanentDelete = async (event: any) => {
    setSelectedEvent(event);
    setIsPermanentDeleteDialogOpen(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!selectedEvent) return;
    try {
      await permanentlyDeleteEvent(selectedEvent.id).unwrap();
      setIsPermanentDeleteDialogOpen(false);
      setSelectedEvent(null);
      await refetch();
      toast.success('Event permanently deleted');
    } catch (err) {
      console.error('Failed to permanently delete event:', err);
      toast.error('Failed to permanently delete event');
    }
  };

  // Restore Event
  const handleRestoreEvent = async (event: any) => {
    setSelectedEvent(event);
    setIsRestoreDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedEvent) return;
    try {
      await restoreEvent(selectedEvent.id).unwrap();
      setIsRestoreDialogOpen(false);
      setSelectedEvent(null);
      await refetch();
      toast.success('Event restored successfully');
    } catch (err) {
      console.error('Failed to restore event:', err);
      toast.error('Failed to restore event');
    }
  };

  const handlePublishEvent = async (event: any) => {
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
    } catch (err: any) {
      console.error('Failed to publish event:', err);
      
      toast.dismiss(loadingToast);
      
      const errorData = err?.data;
      let errorMessage = 'Failed to publish event';
      let errorDetails: string[] = [];
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.errors) {
          if (typeof errorData.errors === 'string') {
            errorDetails = [errorData.errors];
          } else if (Array.isArray(errorData.errors)) {
            errorDetails = errorData.errors;
          } else if (typeof errorData.errors === 'object') {
            errorDetails = Object.values(errorData.errors).map(v => String(v));
          }
        }
        
        if (errorDetails.length === 0 && errorData.message) {
          errorDetails = [errorData.message];
        }
      }
      
      if (errorDetails.length === 0) {
        errorDetails = [err?.message || 'Failed to publish event'];
      }
      
      setPublishError({
        message: errorMessage,
        details: errorDetails
      });
      setIsPublishErrorDialogOpen(true);
    } finally {
      setPublishingEventId(null);
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

  const handleViewSelected = () => {
    if (selectedEvents.length === 1) {
      const event = uiEvents.find(e => e.id === selectedEvents[0]);
      if (event) {
        handleViewEvent(event);
      }
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

 const handleBulkDelete = async () => {
  if (selectedEvents.length === 0) {
    toast.error('No events selected');
    return;
  }
  
  try {
    // ✅ This is the BULK delete API - uses DELETE /api/v1/events/bulk
    // Make sure we're passing the correct payload structure
    await bulkDeleteEvents({ ids: selectedEvents }).unwrap();
    setIsBulkActionDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
    await refetch();
    toast.success(`${selectedEvents.length} events moved to trash`);
  } catch (err: any) {
    console.error('Failed to delete events:', err);
    const errorMsg = err?.data?.message || err?.message || 'Failed to delete events';
    toast.error(errorMsg);
  }
};

  const handleBulkPermanentDelete = async () => {
    try {
      await bulkPermanentlyDeleteEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await refetch();
      toast.success('Events permanently deleted');
    } catch (err) {
      console.error('Failed to permanently delete events:', err);
      toast.error('Failed to permanently delete events');
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestoreEvents({ ids: selectedEvents }).unwrap();
      setIsBulkActionDialogOpen(false);
      setSelectedEvents([]);
      setSelectAll(false);
      await refetch();
      toast.success('Events restored successfully');
    } catch (err) {
      console.error('Failed to restore events:', err);
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
    } catch (err: any) {
      console.error('Failed to publish events:', err);
      toast.dismiss(loadingToast);
      
      const errorData = err?.data;
      let errorMessage = 'Failed to publish events';
      let errorDetails: string[] = [];
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.errors) {
          if (typeof errorData.errors === 'string') {
            errorDetails = [errorData.errors];
          } else if (Array.isArray(errorData.errors)) {
            errorDetails = errorData.errors;
          } else if (typeof errorData.errors === 'object') {
            errorDetails = Object.values(errorData.errors).map(v => String(v));
          }
        }
        
        if (errorDetails.length === 0 && errorData.message) {
          errorDetails = [errorData.message];
        }
      }
      
      if (errorDetails.length === 0) {
        errorDetails = [err?.message || 'Failed to publish events'];
      }
      
      setPublishError({
        message: errorMessage,
        details: errorDetails
      });
      setIsPublishErrorDialogOpen(true);
      setIsBulkActionDialogOpen(false);
    }
  };

  const handleBulkDuplicate = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
    // Navigate to create page with selected events as template
    if (selectedEvents.length === 1) {
      router.push(`/dashboard/events/new?duplicate=${selectedEvents[0]}`);
    } else {
      router.push(`/dashboard/events/new?duplicate=${selectedEvents.join(',')}`);
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

  const handleModalEdit = () => {
    if (selectedEvent) {
      setIsViewDialogOpen(false);
      router.push(`/dashboard/events/${selectedEvent.id}/edit`);
    }
  };

  const handleModalDuplicate = () => {
    if (selectedEvent) {
      setIsViewDialogOpen(false);
      router.push(`/dashboard/events/new?duplicate=${selectedEvent.id}`);
    }
  };

  const handleModalPublicPage = () => {
    if (selectedEvent) {
      setIsViewDialogOpen(false);
      window.open(`/events/${selectedEvent.slug || selectedEvent.id}`, '_blank');
    }
  };

  const handleModalManageAttendees = () => {
    if (selectedEvent) {
      setIsViewDialogOpen(false);
      router.push(`/dashboard/attendees?eventId=${selectedEvent.id}`);
    }
  };

  const handleModalDelete = () => {
    setIsViewDialogOpen(false);
    if (selectedEvent) {
      handleDeleteEvent(selectedEvent);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (activeTab !== 'all' && activeTab !== 'trash') count++;
    return count;
  };

  const getSortLabel = () => {
    const labels = {
      name: 'Title',
      eventDate: 'Event Date',
      addedDate: 'Added Date',
      current_attendees: 'Registrations',
      price: 'Price',
      status: 'Status'
    };
    return labels[sortField];
  };

  const handleMobileReset = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setActiveTab('all');
    setSortField('eventDate');
    setSortDirection('desc');
    dispatch(setCurrentPage(1));
    setIsFilterSheetOpen(false);
  };

  const handleMobileApply = () => {
    setIsFilterSheetOpen(false);
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
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const result = await refetch();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: 'Refreshing events...',
        success: 'Events refreshed successfully!',
        error: 'Failed to refresh events',
      }
    );
  };

  // ============================================================
  // AUTHENTICATION CHECK
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
            <p className="text-sm text-gray-500 mb-6">
              Please log in to view and manage your events.
            </p>
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
            <p className="text-sm text-gray-500 mb-6">
              We couldn&apos;t find your account information. Please contact support.
            </p>
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

  // Loading state
  if (isLoading && !activeData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">
            {shouldSearch ? 'Searching events...' : 'Loading events...'}
          </p>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <p className="text-sm text-gray-500 mt-1">
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
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm transition-all cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

    {/* // Stats Cards - Improved version with more accurate data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Events */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalEvents}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {uiEvents.filter(e => e.status === 'Published' && !e.isDeleted).length} published
                </p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalRegistered}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Across {activeEvents.filter(e => e.registered > 0).length} events
                </p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Sessions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{liveEvents}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {uiEvents.filter(e => e.status === 'Draft' && !e.isDeleted).length} drafts
                </p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <Video className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CPD Accredited */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CPD Accredited</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{cpdEvents}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {uiEvents.reduce((acc, e) => acc + (e.cpdHours || 0), 0)} total CPD hours
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trash Card - Clickable */}
        <Card 
          className={`${trashedEvents > 0 ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50/70 cursor-pointer' : 'cursor-pointer'} transition-colors`}
          onClick={() => router.push('/dashboard/trash')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trash</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{trashedEvents}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {trashedEvents > 0 ? (
                    <span className="text-amber-600">Click to restore</span>
                  ) : (
                    'Empty'
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${trashedEvents > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                <Trash2 className="h-5 w-5" />
              </div>
            </div>
            {trashedEvents > 0 && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                Click to view <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop Filters */}
      {!isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Row 1: Tabs and Search */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {['all', 'live', 'upcoming', 'draft', 'ended'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        dispatch(setCurrentPage(1));
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                        activeTab === tab
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  
                  {/* ✅ Trash Tab */}
                  <button
                    onClick={() => {
                      setActiveTab('trash');
                      dispatch(setCurrentPage(1));
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'trash'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Trash
                    {trashedEvents > 0 && (
                      <span className={`ml-1 text-xs ${activeTab === 'trash' ? 'text-white' : 'text-gray-400'}`}>
                        ({trashedEvents})
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: View Options and Sort */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'table' 
                          ? 'bg-white text-primary shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Table View"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'grid' 
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
                        <SelectItem value="eventDate" className="cursor-pointer text-sm">Event Date</SelectItem>
                        <SelectItem value="addedDate" className="cursor-pointer text-sm">Added Date</SelectItem>
                        <SelectItem value="current_attendees" className="cursor-pointer text-sm">Registrations</SelectItem>
                        <SelectItem value="price" className="cursor-pointer text-sm">Price</SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">Status</SelectItem>
                      </SelectContent>
                    </Select>

                    <button
                      onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortDirection === 'asc' 
                        ? <ArrowUp className="h-4 w-4 text-primary" />
                        : <ArrowDown className="h-4 w-4 text-primary" />
                      }
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs text-gray-400">
                    {isFetching && (
                      <Loader2 className="h-3.5 w-3.5 inline animate-spin mr-1" />
                    )}
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                    {shouldSearch && searchQuery && (
                      <span className="text-gray-400 ml-1">
                        (searching &quot;{searchQuery}&quot;)
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
                      setActiveTab('all');
                      setSortField('eventDate');
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

           {/* Bulk Actions Bar - UPDATED */}
            {getSelectedCount() > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {getSelectedCount()} event{getSelectedCount() > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* View button - always show for single selection */}
                  {getSelectedCount() === 1 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={handleViewSelected}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  
                  {/* Edit button - always show for single selection */}
                  {getSelectedCount() === 1 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={() => {
                        const eventId = selectedEvents[0];
                        router.push(`/dashboard/events/${eventId}/edit`);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  
                  {/* ✅ Publish - Show for 1 or more events if all selected are drafts */}
                  {selectedEvents.every(id => {
                    const event = uiEvents.find(e => e.id === id);
                    return event?.status === 'Draft' && !event?.isDeleted;
                  }) && selectedEvents.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        if (selectedEvents.length === 1) {
                          // Single publish
                          const event = uiEvents.find(e => e.id === selectedEvents[0]);
                          if (event) handlePublishEvent(event);
                        } else {
                          // Bulk publish
                          handleBulkAction('publish');
                        }
                      }}
                      disabled={publishingEventId !== null}
                    >
                      {publishingEventId && selectedEvents.length === 1 ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Publish {selectedEvents.length > 1 ? `(${selectedEvents.length})` : ''}
                    </Button>
                  )}
                  
                  {/* Bulk actions - only show when 2+ events selected */}
                  {getSelectedCount() > 1 && (
                    <>
                      {/* Trash tab actions */}
                      {activeTab === 'trash' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="cursor-pointer text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleBulkAction('restore')}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleBulkAction('permanentDelete')}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Permanently
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* ✅ Publish is now handled above for both single and bulk */}
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="cursor-pointer"
                            onClick={() => handleBulkAction('duplicate')}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </Button>
                          
                          {/* Bulk Delete - only for 2+ events */}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleBulkAction('delete')}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Move to Trash
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* ✅ Single Delete - for exactly 1 event (uses single delete API) */}
                  {getSelectedCount() === 1 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => {
                        const event = uiEvents.find(e => e.id === selectedEvents[0]);
                        if (event) {
                          handleDeleteEvent(event);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Move to Trash
                    </Button>
                  )}
                  
                  {/* Clear button - always show */}
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

      {/* Events Table View */}
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
                        Event Title
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">Type</TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('eventDate')}>
                      <div className="flex items-center">
                        Event Date
                        {getSortIcon('eventDate')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('addedDate')}>
                      <div className="flex items-center">
                        Added
                        {getSortIcon('addedDate')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('current_attendees')}>
                      <div className="flex items-center">
                        Registrations
                        {getSortIcon('current_attendees')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const percentage = event.capacity > 0 
                        ? Math.round((event.registered / event.capacity) * 100) 
                        : 0;
                      const statusConfig = getStatusConfig(event.status);
                      const typeClassName = getTypeConfig(event.type);
                      const isSelected = selectedEvents.includes(event.id);
                      const isTrashed = event.isDeleted;
                      
                      const addedDate = event.createdAt;
                      const addedLabel = event.status === 'Published' ? 'Published' : 'Created';
                      const addedDateFormatted = formatDate(addedDate);

                      return (
                        <TableRow 
                          key={event.id} 
                          onClick={() => handleRowClick(event.id)}
                          className={`hover:bg-gray-50/60 transition-colors group cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          } ${isTrashed ? 'opacity-60 bg-amber-50/30' : ''}`}
                        >
                          <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectEvent(event.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {event.title}
                              {isTrashed && (
                                <Badge variant="outline" className="ml-2 text-amber-600 border-amber-200 bg-amber-50 text-xs">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Trashed
                                </Badge>
                              )}
                              {/* ✅ Featured Badge */}
                              {event.isFeatured && !isTrashed && (
                                <Badge variant="default" className="ml-2 bg-secondary-500 text-white text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {/* ✅ Private Badge */}
                              {event.isPrivate && !isTrashed && (
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
                            <Badge variant="outline" className={typeClassName}>
                              {event.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm">{event.date}</span>
                              <span className="text-xs text-gray-400">{event.time}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm">{addedDateFormatted}</span>
                              <span className="text-xs text-gray-400">{addedLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="w-36">
                              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                                <span>{event.registered} / {event.capacity}</span>
                                <span className="text-gray-500">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            {isTrashed ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Trashed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`${statusConfig.color} border`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                                {event.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {isTrashed ? (
                                  // ✅ Trash Actions
                                  <>
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-green-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRestoreEvent(event);
                                      }}
                                    >
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Restore
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePermanentDelete(event);
                                      }}
                                    >
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete Permanently
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  // ✅ Normal Actions
                                  <>
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewEvent(event);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/events/${event.id}/edit`);
                                      }}
                                    >
                                      <Edit3 className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/events/new?duplicate=${event.id}`);
                                      }}
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    {event.status === 'Draft' && (
                                      <DropdownMenuItem 
                                        className="cursor-pointer text-green-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePublishEvent(event);
                                        }}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Publish
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/events/${event.slug || event.id}`, '_blank');
                                      }}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Public Page
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/attendees?eventId=${event.id}`);
                                      }}
                                    >
                                      <Users className="h-4 w-4 mr-2" />
                                      Manage Attendees
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-amber-600 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEvent(event);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Move to Trash
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          {activeTab === 'trash' ? (
                            <Trash2 className="h-8 w-8 text-gray-300" />
                          ) : (
                            <Search className="h-8 w-8 text-gray-300" />
                          )}
                          <p className="font-medium">
                            {activeTab === 'trash' 
                              ? 'No events in trash'
                              : shouldSearch && searchQuery 
                              ? `No events match "${searchQuery}"`
                              : activeTab !== 'all'
                              ? `No ${activeTab} events found`
                              : 'No events found'
                            }
                          </p>
                          <p className="text-sm text-gray-400">
                            {activeTab === 'trash' 
                              ? 'Deleted events will appear here. You can restore or permanently delete them.'
                              : shouldSearch && searchQuery 
                              ? 'Try adjusting your search terms or filters.'
                              : activeTab !== 'all'
                              ? 'Try changing the status filter.'
                              : 'Create your first event to get started.'
                            }
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
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {!isMobile && viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const statusConfig = getStatusConfig(event.status);
                const typeClassName = getTypeConfig(event.type);
                const isSelected = selectedEvents.includes(event.id);
                const isTrashed = event.isDeleted;
                const addedDate = event.publishedAt || event.createdAt;
                const addedLabel = event.publishedAt ? 'Published' : 'Created';
                const addedDateFormatted = formatDate(addedDate);

                return (
                  <Card 
                    key={event.id} 
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200/80 ${
                      isSelected ? 'border-primary/50 bg-primary/5' : ''
                    } ${isTrashed ? 'opacity-60 bg-amber-50/30' : ''}`}
                    onClick={() => handleCardClick(event)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={typeClassName}>
                            {event.type}
                          </Badge>
                          {/* ✅ Featured Badge in Grid */}
                          {event.isFeatured && !isTrashed && (
                            <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {/* ✅ Private Badge in Grid */}
                          {event.isPrivate && !isTrashed && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        {isTrashed ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Trashed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={`${statusConfig.color} border`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                            {event.status}
                          </Badge>
                        )}
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
                        <span className="text-gray-400">Added:</span>
                        <span>{addedDateFormatted}</span>
                        <span className="text-gray-400">({addedLabel})</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{event.registered} / {event.capacity} registered</span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{event.platform}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 p-0 cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {isTrashed ? (
                              // ✅ Trash Actions in Grid
                              <>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-green-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreEvent(event);
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePermanentDelete(event);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </>
                            ) : (
                              // ✅ Normal Actions in Grid
                              <>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewEvent(event);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/events/${event.id}/edit`);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/events/new?duplicate=${event.id}`);
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                {event.status === 'Draft' && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-green-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePublishEvent(event);
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-amber-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              </>
                            )}
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
                  {activeTab === 'trash' ? (
                    <Trash2 className="h-8 w-8 text-gray-300" />
                  ) : (
                    <Search className="h-8 w-8 text-gray-300" />
                  )}
                  <p className="font-medium">
                    {activeTab === 'trash' 
                      ? 'No events in trash'
                      : shouldSearch && searchQuery 
                      ? `No events match "${searchQuery}"`
                      : activeTab !== 'all'
                      ? `No ${activeTab} events found`
                      : 'No events found'
                    }
                  </p>
                  <p className="text-sm text-gray-400">
                    {activeTab === 'trash' 
                      ? 'Deleted events will appear here. You can restore or permanently delete them.'
                      : shouldSearch && searchQuery 
                      ? 'Try adjusting your search terms or filters.'
                      : activeTab !== 'all'
                      ? 'Try changing the status filter.'
                      : 'Create your first event to get started.'
                    }
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
        </>
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
                  {searchQuery || 'Search'}
                </span>
              </button>

              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors relative"
              >
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {getActiveFilterCount()}
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

            {/* Mobile Events List - Card View */}
      {isMobile && (
        <div className="space-y-4 pb-24">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const statusConfig = getStatusConfig(event.status);
              const typeClassName = getTypeConfig(event.type);
              const isTrashed = event.isDeleted;
              const addedDate = event.publishedAt || event.createdAt;
              const addedLabel = event.publishedAt ? 'Published' : 'Created';
              const addedDateFormatted = formatDate(addedDate);
              const percentage = event.capacity > 0 
                ? Math.round((event.registered / event.capacity) * 100) 
                : 0;

              return (
                <Card 
                  key={event.id} 
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200/80 ${
                    isTrashed ? 'opacity-60 bg-amber-50/30' : ''
                  }`}
                  onClick={() => handleCardClick(event)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={typeClassName}>
                          {event.type}
                        </Badge>
                        {event.isFeatured && !isTrashed && (
                          <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {event.isPrivate && !isTrashed && (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      {isTrashed ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Trashed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className={`${statusConfig.color} border`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1`} />
                          {event.status}
                        </Badge>
                      )}
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
                      <span className="text-gray-400">Added:</span>
                      <span>{addedDateFormatted}</span>
                      <span className="text-gray-400">({addedLabel})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.registered} / {event.capacity} registered</span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Globe className="h-3.5 w-3.5" />
                        <span>{event.platform}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 cursor-pointer">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {isTrashed ? (
                            <>
                              <DropdownMenuItem 
                                className="cursor-pointer text-green-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreEvent(event);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePermanentDelete(event);
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewEvent(event);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/events/${event.id}/edit`);
                                }}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/events/new?duplicate=${event.id}`);
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              {event.status === 'Draft' && (
                                <DropdownMenuItem 
                                  className="cursor-pointer text-green-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishEvent(event);
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-amber-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Move to Trash
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                {activeTab === 'trash' ? (
                  <Trash2 className="h-8 w-8 text-gray-300" />
                ) : (
                  <Search className="h-8 w-8 text-gray-300" />
                )}
                <p className="font-medium">
                  {activeTab === 'trash' 
                    ? 'No events in trash'
                    : shouldSearch && searchQuery 
                    ? `No events match "${searchQuery}"`
                    : activeTab !== 'all'
                    ? `No ${activeTab} events found`
                    : 'No events found'
                  }
                </p>
                <p className="text-sm text-gray-400">
                  {activeTab === 'trash' 
                    ? 'Deleted events will appear here.'
                    : 'Create your first event to get started.'
                  }
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

      {/* Mobile Filter Bottom Sheet */}
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
                Refine your event list
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
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
                  <Label className="text-sm font-medium text-gray-700 truncate">Status</Label>
                  <Select value={activeTab} onValueChange={(value) => {
                    setActiveTab(value);
                    dispatch(setCurrentPage(1));
                  }}>
                    <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                      <div className="truncate w-full text-left">
                        <SelectValue placeholder="All" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">All</SelectItem>
                      <SelectItem value="live" className="cursor-pointer">Live</SelectItem>
                      <SelectItem value="upcoming" className="cursor-pointer">Upcoming</SelectItem>
                      <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                      <SelectItem value="ended" className="cursor-pointer">Ended</SelectItem>
                      <SelectItem value="trash" className="cursor-pointer text-amber-600">Trash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                <Label className="text-sm font-medium text-gray-700">Sort Direction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={sortDirection === 'asc' ? 'default' : 'outline'}
                    className={`h-11 rounded-xl cursor-pointer transition-all ${
                      sortDirection === 'asc' 
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
                    className={`h-11 rounded-xl cursor-pointer transition-all ${
                      sortDirection === 'desc' 
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

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View and manage event information.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedEvent.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className={`${getTypeConfig(selectedEvent.type)} shrink-0`}>
                      {selectedEvent.type}
                    </Badge>
                    {selectedEvent.isDeleted ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Trashed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={`${getStatusConfig(selectedEvent.status).color} shrink-0`}>
                        {selectedEvent.status}
                      </Badge>
                    )}
                    {/* ✅ Featured Badge in View Dialog */}
                    {selectedEvent.isFeatured && !selectedEvent.isDeleted && (
                      <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {/* ✅ Private Badge in View Dialog */}
                    {selectedEvent.isPrivate && !selectedEvent.isDeleted && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{selectedEvent.price}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Ticket Price</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Event Date</Label>
                  <p className="text-sm sm:text-base font-medium">{selectedEvent.date}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Time</Label>
                  <p className="text-sm sm:text-base font-medium">{selectedEvent.time || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Added</Label>
                  <p className="text-sm sm:text-base font-medium">
                    {selectedEvent.publishedAt ? 'Published: ' : 'Created: '}
                    {formatDate(selectedEvent.publishedAt || selectedEvent.createdAt)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Platform</Label>
                  <p className="text-sm sm:text-base font-medium flex items-center gap-1">
                    <Video className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedEvent.platform}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Location</Label>
                  <p className="text-sm sm:text-base font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedEvent.location || 'Virtual'}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">CPD Hours</Label>
                  <p className="text-sm sm:text-base font-medium flex items-center gap-1">
                    <Award className="h-4 w-4 text-amber-500 shrink-0" />
                    {selectedEvent.cpdHours} hours
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Registrations</Label>
                <div className="mt-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    <span>{selectedEvent.registered} / {selectedEvent.capacity}</span>
                    <span>{selectedEvent.capacity > 0 ? Math.round((selectedEvent.registered / selectedEvent.capacity) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedEvent.capacity > 0 ? Math.min((selectedEvent.registered / selectedEvent.capacity) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs text-gray-500 font-medium">Actions</Label>
                
                {selectedEvent.isDeleted ? (
                  // ✅ Trash actions in View Dialog
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full cursor-pointer justify-center text-sm text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleRestoreEvent(selectedEvent);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2 shrink-0" />
                      Restore Event
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full cursor-pointer justify-center text-sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handlePermanentDelete(selectedEvent);
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2 shrink-0" />
                      Delete Permanently
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer justify-center text-sm hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                        onClick={handleModalEdit}
                      >
                        <Edit3 className="h-4 w-4 mr-2 shrink-0" />
                        Edit Event
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer justify-center text-sm hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                        onClick={handleModalDuplicate}
                      >
                        <Copy className="h-4 w-4 mr-2 shrink-0" />
                        Duplicate
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer justify-center text-sm hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                        onClick={handleModalPublicPage}
                      >
                        <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">View Public</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer justify-center text-sm hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                        onClick={handleModalManageAttendees}
                      >
                        <Users className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">Attendees</span>
                      </Button>
                      
                      {selectedEvent.status === 'Draft' && (
                        <Button 
                          variant="default"
                          className="w-full cursor-pointer justify-center text-sm bg-green-600 hover:bg-green-700 text-white transition-colors col-span-2 sm:col-span-1"
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            handlePublishEvent(selectedEvent);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
                          Publish
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        className="w-full cursor-pointer justify-center text-sm text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={handleModalDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2 shrink-0" />
                        Move to Trash
                      </Button>
                    </div>
                  </>
                )}

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
            </div>
          )}
        </DialogContent>
      </Dialog>

    {/* Bulk Action Confirmation Dialog - FIXED */}
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
            {bulkAction === 'publish' && (
              <>You are about to publish <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}.</>
            )}
            {bulkAction === 'duplicate' && (
              <>You are about to duplicate <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}.</>
            )}
            {bulkAction === 'delete' && (
              <>You are about to move <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''} to trash.</>
            )}
            {bulkAction === 'permanentDelete' && (
              <>You are about to permanently delete <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
            )}
            {bulkAction === 'restore' && (
              <>You are about to restore <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''} from trash.</>
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
                    {event.isDeleted ? 'Trashed' : event.status}
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
                ? 'bg-red-600 hover:bg-red-700' 
                : bulkAction === 'restore'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-primary hover:bg-primary/90'
            }`}
            onClick={() => {
              if (bulkAction === 'publish') {
                setIsBulkActionDialogOpen(false);
                handleBulkPublish();
              } else if (bulkAction === 'duplicate') {
                handleBulkDuplicate();
              } else if (bulkAction === 'delete') {
                // ✅ This now only gets called for 2+ events
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

      {/* Delete (Move to Trash) Confirmation Dialog */}
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
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedEvent.title}</p>
                  <p className="text-sm text-gray-500">{selectedEvent.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              className="cursor-pointer text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
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
            <Button 
              variant="outline" 
              onClick={() => setIsPermanentDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="cursor-pointer"
              onClick={handleConfirmPermanentDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
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
            <Button 
              variant="outline" 
              onClick={() => setIsRestoreDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmRestore}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Error Dialog */}
      <Dialog open={isPublishErrorDialogOpen} onOpenChange={setIsPublishErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Cannot Publish Event
            </DialogTitle>
            <DialogDescription className="text-red-600">
              {publishError?.message || 'Failed to publish event'}
            </DialogDescription>
          </DialogHeader>
          
          {publishError?.details && publishError.details.length > 0 && (
            <div className="py-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Please fix the following issues:</p>
              <ul className="space-y-2">
                {publishError.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
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
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={() => {
                setIsPublishErrorDialogOpen(false);
                router.push(`/dashboard/events/${publishingEventId || selectedEvent?.id}/edit`);
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
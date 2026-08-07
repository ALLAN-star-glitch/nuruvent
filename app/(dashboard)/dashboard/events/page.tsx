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
  TrendingUp,
  Check,
  Send,
  Eye,
  MapPin,
  DollarSign,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface EventItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  time?: string;
  registered: number;
  capacity: number;
  price: string;
  platform: string;
  cpdHours: number;
  description?: string;
  host?: string;
  location?: string;
  image?: string;
}

// Mock Events Data
const mockEvents: EventItem[] = [
  {
    id: 'evt_1',
    title: 'Advanced NestJS Microservices Architecture',
    type: 'Bootcamp',
    status: 'Live',
    date: 'Aug 5, 2026',
    time: '14:00 EAT',
    registered: 142,
    capacity: 200,
    price: 'KES 2,500',
    platform: 'Zoom',
    cpdHours: 4,
    description: 'Learn advanced NestJS microservices patterns and best practices for building scalable applications.',
    host: 'TechAcademy Kenya',
    location: 'Virtual (Zoom)',
  },
  {
    id: 'evt_2',
    title: 'Mobile Test Automation with Appium & Robot Framework',
    type: 'Workshop',
    status: 'Upcoming',
    date: 'Aug 12, 2026',
    time: '10:00 EAT',
    registered: 89,
    capacity: 150,
    price: 'Free',
    platform: 'Google Meet',
    cpdHours: 3,
    description: 'Hands-on workshop on mobile test automation using Appium and Robot Framework.',
    host: 'DevSchool',
    location: 'Virtual (Google Meet)',
  },
  {
    id: 'evt_3',
    title: 'Fintech Security Compliance & M-Pesa API Integration',
    type: 'Webinar',
    status: 'Draft',
    date: 'Aug 20, 2026',
    time: '15:30 EAT',
    registered: 0,
    capacity: 300,
    price: 'KES 1,000',
    platform: 'Zoom',
    cpdHours: 2,
    description: 'Comprehensive webinar on fintech security compliance and integrating M-Pesa APIs.',
    host: 'Fintech Kenya',
    location: 'Virtual (Zoom)',
  },
  {
    id: 'evt_4',
    title: 'Full-Stack Scaling Strategies with Next.js & Go',
    type: 'Meetup',
    status: 'Ended',
    date: 'Jul 28, 2026',
    time: '18:00 EAT',
    registered: 215,
    capacity: 215,
    price: 'Free',
    platform: 'Zoom',
    cpdHours: 2,
    description: 'Learn how to build and scale full-stack applications using Next.js and Go.',
    host: 'Nairobi Devs',
    location: 'Virtual (Zoom)',
  },
];

const statusConfig = {
  Live: { color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
  Upcoming: { color: 'text-blue-600 bg-blue-50 border-blue-100', dot: 'bg-blue-500' },
  Draft: { color: 'text-amber-600 bg-amber-50 border-amber-100', dot: 'bg-amber-500' },
  Ended: { color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
};

const typeConfig = {
  Bootcamp: 'bg-purple-100 text-purple-700',
  Workshop: 'bg-blue-100 text-blue-700',
  Webinar: 'bg-green-100 text-green-700',
  Meetup: 'bg-orange-100 text-orange-700',
};

type SortField = 'title' | 'date' | 'registered' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

export default function EventsDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Sort and view state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  // Filter logic
  const filteredEvents = useMemo(() => {
    const filtered = mockEvents.filter((event: EventItem) => {
      const matchesTab =
        activeTab === 'all' || event.status.toLowerCase() === activeTab;
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'registered':
          comparison = a.registered - b.registered;
          break;
        case 'price':
          comparison = parseFloat(a.price.replace(/[^0-9.-]+/g, '')) - parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
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
  }, [activeTab, searchQuery, sortField, sortDirection]);

  // Paginate events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Stats
  const totalEvents = mockEvents.length;
  const totalRegistered = mockEvents.reduce((acc, e) => acc + e.registered, 0);
  const liveEvents = mockEvents.filter(e => e.status === 'Live').length;
  const cpdEvents = mockEvents.filter(e => e.cpdHours > 0).length;

  const handleRowClick = (eventId: string) => {
    if (!isMobile) {
      handleSelectEvent(eventId);
    }
  };

  const handleCardClick = (event: EventItem) => {
    if (isMobile) {
      handleViewEvent(event);
    } else {
      handleSelectEvent(event.id);
    }
  };

  const handleViewEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleDeleteEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(paginatedEvents.map(e => e.id));
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
      const event = mockEvents.find(e => e.id === selectedEvents[0]);
      if (event) {
        handleViewEvent(event);
      }
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
  };

  const handleBulkPublish = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
  };

  const handleBulkDuplicate = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedEvents([]);
    setSelectAll(false);
  };

  const getSelectedCount = () => selectedEvents.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  // Action handlers for modal
  const handleModalEdit = () => {
    if (selectedEvent) {
      setIsViewDialogOpen(false);
      router.push(`/dashboard/events/${selectedEvent.id}/edit`);
    }
  };

  const handleModalDuplicate = () => {
    if (selectedEvent) {
      navigator.clipboard.writeText(`${window.location.origin}/events/${selectedEvent.id}`);
      setIsViewDialogOpen(false);
    }
  };

  const handleModalPublicPage = () => {
    if (selectedEvent) {
      setIsViewDialogOpen(false);
      window.open(`/events/${selectedEvent.id}`, '_blank');
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

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (activeTab !== 'all') count++;
    return count;
  };

  // Get sort label
  const getSortLabel = () => {
    const labels = {
      title: 'Title',
      date: 'Date',
      registered: 'Registrations',
      price: 'Price',
      status: 'Status'
    };
    return labels[sortField];
  };

  // Handle reset on mobile
  const handleMobileReset = () => {
    setSearchQuery('');
    setActiveTab('all');
    setSortField('date');
    setSortDirection('desc');
    setCurrentPage(1);
    setIsFilterSheetOpen(false);
  };

  // Handle apply on mobile
  const handleMobileApply = () => {
    setIsFilterSheetOpen(false);
  };

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
        <Link href="/dashboard/events/new" className="cursor-pointer">
          <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm transition-all cursor-pointer">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalEvents}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalRegistered}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{liveEvents}</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <Video className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CPD Accredited</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{cpdEvents}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Filters - Hidden on Mobile */}
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
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                        activeTab === tab
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full cursor-text"
                  />
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
                      <SelectTrigger className="h-8 w-[110px] text-xs border-0 bg-transparent focus:ring-0 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title" className="cursor-pointer text-sm">Title</SelectItem>
                        <SelectItem value="date" className="cursor-pointer text-sm">Date</SelectItem>
                        <SelectItem value="registered" className="cursor-pointer text-sm">Registrations</SelectItem>
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
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                      setSortField('date');
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

            {/* Bulk Actions Bar - Desktop Only */}
            {getSelectedCount() > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {getSelectedCount()} event{getSelectedCount() > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => handleBulkAction('publish')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => handleBulkAction('duplicate')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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

      {/* Events Table or Grid View */}
      {!isMobile && viewMode === 'table' ? (
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
                      />
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('title')}>
                      <div className="flex items-center">
                        Event Title
                        {getSortIcon('title')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">Type</TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('date')}>
                      <div className="flex items-center">
                        Date & Time
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('registered')}>
                      <div className="flex items-center">
                        Registrations
                        {getSortIcon('registered')}
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
                  {paginatedEvents.length > 0 ? (
                    paginatedEvents.map((event: EventItem) => {
                      const percentage = Math.round((event.registered / event.capacity) * 100);
                      const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.Draft;
                      const isSelected = selectedEvents.includes(event.id);

                      return (
                        <TableRow 
                          key={event.id} 
                          onClick={() => handleRowClick(event.id)}
                          className={`hover:bg-gray-50/60 transition-colors group cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
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
                            <Badge variant="outline" className={`${typeConfig[event.type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-700'}`}>
                              {event.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 text-gray-600 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm">{event.date}</span>
                              <span className="text-xs text-gray-400">{event.time}</span>
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
                            <Badge variant="outline" className={`${status.color} border`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot} mr-1`} />
                              {event.status}
                            </Badge>
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
                                    navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/events/${event.id}`, '_blank');
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
                                  className="text-red-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEvent(event);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-gray-300" />
                          <p className="font-medium">No events found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredEvents.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
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
                    {filteredEvents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of{' '}
                    {filteredEvents.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
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
        // Grid View
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event: EventItem) => {
                const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.Draft;
                const isSelected = selectedEvents.includes(event.id);

                return (
                  <Card 
                    key={event.id} 
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200/80 ${
                      isSelected ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => handleCardClick(event)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {!isMobile && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectEvent(event.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          )}
                          <Badge variant="outline" className={`${typeConfig[event.type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-700'}`}>
                            {event.type}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={`${status.color} border`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} mr-1`} />
                          {event.status}
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
                        {isMobile ? (
                          <div 
                            className="flex items-center gap-1 text-xs text-primary font-medium cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewEvent(event);
                            }}
                          >
                            View Details
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 p-0 cursor-pointer">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
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
                                  handleModalDuplicate();
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-gray-300" />
                  <p className="font-medium">No events found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination for Grid View */}
          {filteredEvents.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
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
                  {filteredEvents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of{' '}
                  {filteredEvents.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 cursor-pointer"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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
              {/* Search */}
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded-full px-3 py-1.5 transition-colors"
              >
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">
                  {searchQuery || 'Search'}
                </span>
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

              {/* Filters */}
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

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

              {/* Sort */}
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
        {/* Search - Full width */}
        <div className="space-y-1.5 mb-5">
          <Label className="text-sm font-medium text-gray-700">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 cursor-text border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
            />
          </div>
        </div>

        {/* Grid Layout for Filters */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Status Filter */}
          <div className="space-y-1.5 min-w-0 overflow-hidden">
            <Label className="text-sm font-medium text-gray-700 truncate">Status</Label>
            <Select value={activeTab} onValueChange={setActiveTab}>
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
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
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
                <SelectItem value="title" className="cursor-pointer">Title</SelectItem>
                <SelectItem value="date" className="cursor-pointer">Date</SelectItem>
                <SelectItem value="registered" className="cursor-pointer">Registrations</SelectItem>
                <SelectItem value="price" className="cursor-pointer">Price</SelectItem>
                <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort Direction - Full width */}
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

      {/* Actions - Fixed at bottom */}
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
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedEvent.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className={`${typeConfig[selectedEvent.type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-700'} shrink-0`}>
                      {selectedEvent.type}
                    </Badge>
                    <Badge variant="outline" className={`${statusConfig[selectedEvent.status as keyof typeof statusConfig]?.color || 'bg-gray-50 text-gray-600 border-gray-200'} shrink-0`}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{selectedEvent.price}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Ticket Price</p>
                </div>
              </div>

              <Separator />

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Date</Label>
                  <p className="text-sm sm:text-base font-medium">{selectedEvent.date}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Time</Label>
                  <p className="text-sm sm:text-base font-medium">{selectedEvent.time || 'Not specified'}</p>
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
                  <Label className="text-xs text-gray-500">Host</Label>
                  <p className="text-sm sm:text-base font-medium flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedEvent.host || 'Not specified'}</span>
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

              {/* Registrations */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Registrations</Label>
                <div className="mt-2">
                  <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    <span>{selectedEvent.registered} / {selectedEvent.capacity}</span>
                    <span>{Math.round((selectedEvent.registered / selectedEvent.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((selectedEvent.registered / selectedEvent.capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 font-medium">Actions</Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalEdit}
                  >
                    <Edit3 className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Edit Event</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalDuplicate}
                  >
                    <Copy className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Duplicate</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalPublicPage}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">View Public Page</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalManageAttendees}
                  >
                    <Users className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Manage Attendees</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full cursor-pointer justify-start text-sm col-span-1 xs:col-span-2"
                    onClick={handleModalDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Delete Event</span>
                  </Button>
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

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'publish' && 'Publish Events'}
              {bulkAction === 'duplicate' && 'Duplicate Events'}
              {bulkAction === 'delete' && 'Delete Events'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'publish' && (
                <>You are about to publish <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}.</>
              )}
              {bulkAction === 'duplicate' && (
                <>You are about to duplicate <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}.</>
              )}
              {bulkAction === 'delete' && (
                <>You are about to delete <strong>{getSelectedCount()}</strong> event{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedEvents.map(id => {
                const event = mockEvents.find(e => e.id === id);
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
              className={`cursor-pointer ${
                bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={() => {
                if (bulkAction === 'publish') handleBulkPublish();
                else if (bulkAction === 'duplicate') handleBulkDuplicate();
                else if (bulkAction === 'delete') handleBulkDelete();
              }}
            >
              {bulkAction === 'publish' && <CheckCircle2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'duplicate' && <Copy className="h-4 w-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'publish' && 'Publish All'}
              {bulkAction === 'duplicate' && 'Duplicate All'}
              {bulkAction === 'delete' && 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
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
              variant="destructive" 
              className="cursor-pointer"
              onClick={() => {
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
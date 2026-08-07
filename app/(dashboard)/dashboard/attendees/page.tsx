'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  Download,
  UserPlus,
  FileText,
  Award,
  Check,
  Send,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  ArrowRight,
} from 'lucide-react';

// Shadcn components
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
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// Types
interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'registered' | 'checked-in' | 'attended' | 'no-show' | 'cancelled';
  eventId: string;
  eventTitle: string;
  eventDate: string;
  registrationDate: string;
  ticketType: string;
  price: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  cpdHours?: number;
  certificateIssued: boolean;
  checkedInAt?: string;
}

// Mock Data
const mockAttendees: Attendee[] = [
  {
    id: 'att_1',
    name: 'Alice Mwangi',
    email: 'alice@example.com',
    phone: '+254 712 345 678',
    status: 'checked-in',
    eventId: 'evt_1',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026 • 14:00 EAT',
    registrationDate: 'Aug 1, 2026',
    ticketType: 'Standard',
    price: 'KES 2,500',
    paymentStatus: 'paid',
    cpdHours: 4,
    certificateIssued: true,
    checkedInAt: 'Aug 5, 2026 • 13:45 EAT',
  },
  {
    id: 'att_2',
    name: 'Brian Ochieng',
    email: 'brian@example.com',
    phone: '+254 723 456 789',
    status: 'attended',
    eventId: 'evt_1',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026 • 14:00 EAT',
    registrationDate: 'Jul 30, 2026',
    ticketType: 'VIP',
    price: 'KES 5,000',
    paymentStatus: 'paid',
    cpdHours: 4,
    certificateIssued: true,
  },
  {
    id: 'att_3',
    name: 'Catherine Njeri',
    email: 'catherine@example.com',
    phone: '+254 734 567 890',
    status: 'registered',
    eventId: 'evt_2',
    eventTitle: 'Mobile Test Automation with Appium & Robot Framework',
    eventDate: 'Aug 12, 2026 • 10:00 EAT',
    registrationDate: 'Aug 10, 2026',
    ticketType: 'Standard',
    price: 'Free',
    paymentStatus: 'paid',
    cpdHours: 3,
    certificateIssued: false,
  },
  {
    id: 'att_4',
    name: 'David Kiprop',
    email: 'david@example.com',
    phone: '+254 745 678 901',
    status: 'no-show',
    eventId: 'evt_1',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026 • 14:00 EAT',
    registrationDate: 'Aug 2, 2026',
    ticketType: 'Standard',
    price: 'KES 2,500',
    paymentStatus: 'pending',
    cpdHours: 0,
    certificateIssued: false,
  },
  {
    id: 'att_5',
    name: 'Eunice Wanjiru',
    email: 'eunice@example.com',
    phone: '+254 756 789 012',
    status: 'cancelled',
    eventId: 'evt_3',
    eventTitle: 'Fintech Security Compliance & M-Pesa API Integration',
    eventDate: 'Aug 20, 2026 • 15:30 EAT',
    registrationDate: 'Aug 15, 2026',
    ticketType: 'Standard',
    price: 'KES 1,000',
    paymentStatus: 'failed',
    cpdHours: 0,
    certificateIssued: false,
  },
  {
    id: 'att_6',
    name: 'Faith Akinyi',
    email: 'faith@example.com',
    phone: '+254 767 890 123',
    status: 'attended',
    eventId: 'evt_4',
    eventTitle: 'Full-Stack Scaling Strategies with Next.js & Go',
    eventDate: 'Jul 28, 2026 • 18:00 EAT',
    registrationDate: 'Jul 25, 2026',
    ticketType: 'Standard',
    price: 'Free',
    paymentStatus: 'paid',
    cpdHours: 2,
    certificateIssued: true,
  },
  {
    id: 'att_7',
    name: 'George Otieno',
    email: 'george@example.com',
    phone: '+254 778 901 234',
    status: 'registered',
    eventId: 'evt_5',
    eventTitle: 'Cloud Security Best Practices Workshop',
    eventDate: 'Aug 25, 2026 • 09:00 EAT',
    registrationDate: 'Aug 20, 2026',
    ticketType: 'Standard',
    price: 'KES 3,000',
    paymentStatus: 'paid',
    cpdHours: 5,
    certificateIssued: false,
  },
  {
    id: 'att_8',
    name: 'Hellen Wambui',
    email: 'hellen@example.com',
    phone: '+254 789 012 345',
    status: 'checked-in',
    eventId: 'evt_5',
    eventTitle: 'Cloud Security Best Practices Workshop',
    eventDate: 'Aug 25, 2026 • 09:00 EAT',
    registrationDate: 'Aug 18, 2026',
    ticketType: 'VIP',
    price: 'KES 5,500',
    paymentStatus: 'paid',
    cpdHours: 5,
    certificateIssued: true,
    checkedInAt: 'Aug 25, 2026 • 08:50 EAT',
  },
  {
    id: 'att_9',
    name: 'Ian Kariuki',
    email: 'ian@example.com',
    phone: '+254 790 123 456',
    status: 'no-show',
    eventId: 'evt_2',
    eventTitle: 'Mobile Test Automation with Appium & Robot Framework',
    eventDate: 'Aug 12, 2026 • 10:00 EAT',
    registrationDate: 'Aug 8, 2026',
    ticketType: 'Standard',
    price: 'Free',
    paymentStatus: 'pending',
    cpdHours: 0,
    certificateIssued: false,
  },
];

const statusConfig = {
  registered: { 
    label: 'Registered', 
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: ClockIcon,
  },
  'checked-in': { 
    label: 'Checked In', 
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle2,
  },
  attended: { 
    label: 'Attended', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    icon: CheckCircle2,
  },
  'no-show': { 
    label: 'No Show', 
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: XCircle,
  },
};

const paymentStatusConfig = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

type SortField = 'name' | 'eventTitle' | 'status' | 'registrationDate' | 'price';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

export default function AttendeesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Sort and view state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

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

  // Get unique events for filter
  const events = useMemo(() => {
    const uniqueEvents = new Set(mockAttendees.map(a => a.eventTitle));
    return Array.from(uniqueEvents);
  }, []);

  // Filter and sort attendees
  const filteredAttendees = useMemo(() => {
    const filtered = mockAttendees.filter((attendee) => {
      const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.phone.includes(searchQuery);
      const matchesEvent = selectedEvent === 'all' || attendee.eventTitle === selectedEvent;
      const matchesStatus = selectedStatus === 'all' || attendee.status === selectedStatus;
      return matchesSearch && matchesEvent && matchesStatus;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'eventTitle':
          comparison = a.eventTitle.localeCompare(b.eventTitle);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'registrationDate':
          comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
          break;
        case 'price':
          const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
          comparison = priceA - priceB;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, selectedEvent, selectedStatus, sortField, sortDirection]);

  // Paginate attendees
  const paginatedAttendees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAttendees.slice(startIndex, endIndex);
  }, [filteredAttendees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);

  // Stats
  const stats = useMemo(() => {
    const total = mockAttendees.length;
    const checkedIn = mockAttendees.filter(a => a.status === 'checked-in' || a.status === 'attended').length;
    const registered = mockAttendees.filter(a => a.status === 'registered').length;
    const noShow = mockAttendees.filter(a => a.status === 'no-show').length;
    return { total, checkedIn, registered, noShow };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewAttendee = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsViewDialogOpen(true);
  };

  const handleDeleteAttendee = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(paginatedAttendees.map(a => a.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectAttendee = (id: string) => {
    setSelectedAttendees(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleRowClick = (id: string) => {
    if (!isMobile) {
      handleSelectAttendee(id);
    }
  };

  const handleCardClick = (attendee: Attendee) => {
    if (isMobile) {
      handleViewAttendee(attendee);
    } else {
      handleSelectAttendee(attendee.id);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkSend = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedAttendees([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedAttendees([]);
    setSelectAll(false);
  };

  const handleBulkExport = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedAttendees([]);
    setSelectAll(false);
  };

  const handleViewSelected = () => {
    if (selectedAttendees.length === 1) {
      const attendee = mockAttendees.find(a => a.id === selectedAttendees[0]);
      if (attendee) {
        handleViewAttendee(attendee);
      }
    }
  };

  const getSelectedCount = () => selectedAttendees.length;

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
    if (selectedAttendee) {
      setIsViewDialogOpen(false);
      router.push(`/dashboard/attendees/${selectedAttendee.id}/edit`);
    }
  };

  const handleModalViewCertificate = () => {
    if (selectedAttendee && selectedAttendee.certificateIssued) {
      setIsViewDialogOpen(false);
      router.push(`/certificates/${selectedAttendee.id}`);
    }
  };

  const handleModalDelete = () => {
    setIsViewDialogOpen(false);
    if (selectedAttendee) {
      handleDeleteAttendee(selectedAttendee);
    }
  };

  const handleModalSendReminder = () => {
    if (selectedAttendee) {
      setIsViewDialogOpen(false);
      console.log('Send reminder to:', selectedAttendee.email);
    }
  };

  const handleModalExport = () => {
    if (selectedAttendee) {
      setIsViewDialogOpen(false);
      console.log('Export attendee:', selectedAttendee.name);
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedEvent !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  };

  // Get sort label
  const getSortLabel = () => {
    const labels = {
      name: 'Name',
      eventTitle: 'Event',
      status: 'Status',
      registrationDate: 'Registered',
      price: 'Price'
    };
    return labels[sortField];
  };

  // Handle reset on mobile
  const handleMobileReset = () => {
    setSearchQuery('');
    setSelectedEvent('all');
    setSelectedStatus('all');
    setSortField('name');
    setSortDirection('asc');
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
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all attendees across your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Attendee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Checked In</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.checkedIn}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.registered}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <ClockIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">No Show</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.noShow}</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <XCircle className="h-5 w-5" />
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
              {/* Row 1: Filters */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Search attendees by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full cursor-text"
                  />
                </div>

                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event} value={event} className="cursor-pointer">
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                    <SelectItem value="registered" className="cursor-pointer">Registered</SelectItem>
                    <SelectItem value="checked-in" className="cursor-pointer">Checked In</SelectItem>
                    <SelectItem value="attended" className="cursor-pointer">Attended</SelectItem>
                    <SelectItem value="no-show" className="cursor-pointer">No Show</SelectItem>
                    <SelectItem value="cancelled" className="cursor-pointer">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
                        <SelectItem value="name" className="cursor-pointer text-sm">Name</SelectItem>
                        <SelectItem value="eventTitle" className="cursor-pointer text-sm">Event</SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">Status</SelectItem>
                        <SelectItem value="registrationDate" className="cursor-pointer text-sm">Registered</SelectItem>
                        <SelectItem value="price" className="cursor-pointer text-sm">Price</SelectItem>
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
                    {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? 's' : ''}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedEvent('all');
                      setSelectedStatus('all');
                      setSortField('name');
                      setSortDirection('asc');
                      setCurrentPage(1);
                    }}
                  >
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
                    {getSelectedCount()} attendee{getSelectedCount() > 1 ? 's' : ''} selected
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
                    onClick={() => handleBulkAction('send')}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => handleBulkAction('export')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
                      setSelectedAttendees([]);
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

      {/* Attendees Table or Grid View */}
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
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('name')}>
                      <div className="flex items-center">
                        Attendee
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('eventTitle')}>
                      <div className="flex items-center">
                        Event
                        {getSortIcon('eventTitle')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('price')}>
                      <div className="flex items-center">
                        Payment
                        {getSortIcon('price')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">CPD Hours</TableHead>
                    <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAttendees.length > 0 ? (
                    paginatedAttendees.map((attendee) => {
                      const status = statusConfig[attendee.status];
                      const payment = paymentStatusConfig[attendee.paymentStatus];
                      const StatusIcon = status.icon;
                      const isSelected = selectedAttendees.includes(attendee.id);

                      return (
                        <TableRow 
                          key={attendee.id}
                          className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleRowClick(attendee.id)}
                        >
                          <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectAttendee(attendee.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={attendee.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(attendee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {attendee.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  <span>{attendee.email}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attendee.eventTitle}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{attendee.eventDate}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${status.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${payment.color} border`}>
                              {payment.label}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{attendee.price}</p>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            {attendee.cpdHours && attendee.cpdHours > 0 ? (
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">{attendee.cpdHours} hrs</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
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
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAttendee(attendee);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/attendees/${attendee.id}/edit`);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModalSendReminder();
                                  }}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModalExport();
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                {attendee.certificateIssued && (
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/certificates/${attendee.id}`);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Certificate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAttendee(attendee);
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
                          <p className="font-medium">No attendees found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredAttendees.length > 0 && (
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
                    {filteredAttendees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAttendees.length)} of{' '}
                    {filteredAttendees.length}
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
            {paginatedAttendees.length > 0 ? (
              paginatedAttendees.map((attendee) => {
                const status = statusConfig[attendee.status];
                const payment = paymentStatusConfig[attendee.paymentStatus];
                const StatusIcon = status.icon;
                const isSelected = selectedAttendees.includes(attendee.id);

                return (
                  <Card 
                    key={attendee.id} 
                    className={`hover:shadow-lg transition-all duration-200 border-gray-200/80 cursor-pointer ${
                      isSelected ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => handleCardClick(attendee)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {!isMobile && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectAttendee(attendee.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          )}
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={attendee.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(attendee.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <Badge variant="outline" className={`${status.color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {attendee.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{attendee.email}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{attendee.phone}</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-medium text-gray-700 truncate">{attendee.eventTitle}</p>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">{attendee.eventDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${payment.color} border text-xs`}>
                            {payment.label}
                          </Badge>
                          <span className="text-xs text-gray-500">{attendee.price}</span>
                        </div>
                        {attendee.cpdHours && attendee.cpdHours > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Award className="h-3.5 w-3.5" />
                            <span>{attendee.cpdHours}h</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {attendee.certificateIssued ? (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Certificate Issued</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>No Certificate</span>
                          </div>
                        )}
                        {isMobile ? (
                          <div 
                            className="flex items-center gap-1 text-xs text-primary font-medium cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAttendee(attendee);
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
                                  handleViewAttendee(attendee);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/attendees/${attendee.id}/edit`);
                                }}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModalSendReminder();
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModalExport();
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAttendee(attendee);
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
                  <p className="font-medium">No attendees found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination for Grid View */}
          {filteredAttendees.length > 0 && (
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
                  {filteredAttendees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredAttendees.length)} of{' '}
                  {filteredAttendees.length}
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
              Refine your attendee list
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto mt-6 pb-6">
            {/* Search - Full width */}
            <div className="space-y-1.5 mb-5">
              <Label className="text-sm font-medium text-gray-700">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 cursor-text border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                />
              </div>
            </div>

            {/* Grid Layout for Filters */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Event Filter */}
              <div className="space-y-1.5 min-w-0 overflow-hidden">
                <Label className="text-sm font-medium text-gray-700">Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                    <div className="truncate w-full text-left">
                      <SelectValue placeholder="All Events" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-w-[90vw]">
                    <SelectItem value="all" className="cursor-pointer">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event} value={event} className="cursor-pointer whitespace-normal break-words">
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5 min-w-0 overflow-hidden">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                    <SelectItem value="registered" className="cursor-pointer">Registered</SelectItem>
                    <SelectItem value="checked-in" className="cursor-pointer">Checked In</SelectItem>
                    <SelectItem value="attended" className="cursor-pointer">Attended</SelectItem>
                    <SelectItem value="no-show" className="cursor-pointer">No Show</SelectItem>
                    <SelectItem value="cancelled" className="cursor-pointer">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort By - Full width */}
            <div className="space-y-1.5 mb-5">
              <Label className="text-sm font-medium text-gray-700">Sort By</Label>
              <Select
                value={sortField}
                onValueChange={(value: SortField) => {
                  setSortField(value);
                }}
              >
                <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name" className="cursor-pointer">Name</SelectItem>
                  <SelectItem value="eventTitle" className="cursor-pointer">Event</SelectItem>
                  <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
                  <SelectItem value="registrationDate" className="cursor-pointer">Registered</SelectItem>
                  <SelectItem value="price" className="cursor-pointer">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Direction */}
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

    {/* View Attendee Dialog */}
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendee Details</DialogTitle>
          <DialogDescription>
            View and manage attendee information.
          </DialogDescription>
        </DialogHeader>
        {selectedAttendee && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                <AvatarImage src={selectedAttendee.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg">
                  {getInitials(selectedAttendee.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold truncate">{selectedAttendee.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedAttendee.email}</p>
                <p className="text-xs sm:text-sm text-gray-500">{selectedAttendee.phone}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Event</Label>
                <p className="text-sm sm:text-base font-medium truncate">{selectedAttendee.eventTitle}</p>
                <p className="text-xs text-gray-500">{selectedAttendee.eventDate}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Status</Label>
                <Badge variant="outline" className={`${statusConfig[selectedAttendee.status].color} border mt-1`}>
                  {statusConfig[selectedAttendee.status].label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Ticket Type</Label>
                <p className="text-sm sm:text-base font-medium">{selectedAttendee.ticketType}</p>
                <p className="text-xs text-gray-500">{selectedAttendee.price}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Payment</Label>
                <Badge variant="outline" className={`${paymentStatusConfig[selectedAttendee.paymentStatus].color} border mt-1`}>
                  {paymentStatusConfig[selectedAttendee.paymentStatus].label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">CPD Hours</Label>
                <p className="text-sm sm:text-base font-medium">{selectedAttendee.cpdHours || 0} hours</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Certificate</Label>
                <div className="flex items-center gap-2 mt-1">
                  {selectedAttendee.certificateIssued ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm font-medium text-green-600">Issued</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-500">Not issued</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedAttendee.checkedInAt && (
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Checked In At</Label>
                <p className="text-sm">{selectedAttendee.checkedInAt}</p>
              </div>
            )}

            <Separator />

            {/* Actions - Removed View Details */}
            <div className="space-y-3">
              <Label className="text-xs text-gray-500 font-medium">Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full cursor-pointer justify-start text-sm"
                  onClick={handleModalEdit}
                >
                  <Edit3 className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">Edit Attendee</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full cursor-pointer justify-start text-sm"
                  onClick={handleModalSendReminder}
                >
                  <Send className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">Send Reminder</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full cursor-pointer justify-start text-sm"
                  onClick={handleModalExport}
                >
                  <Download className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">Export</span>
                </Button>
                {selectedAttendee.certificateIssued && (
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalViewCertificate}
                  >
                    <FileText className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">View Certificate</span>
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  className="w-full cursor-pointer justify-start text-sm col-span-2"
                  onClick={handleModalDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">Delete Attendee</span>
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
              {bulkAction === 'send' && 'Send Reminders'}
              {bulkAction === 'export' && 'Export Attendees'}
              {bulkAction === 'delete' && 'Delete Attendees'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'send' && (
                <>You are about to send reminders to <strong>{getSelectedCount()}</strong> attendee{getSelectedCount() > 1 ? 's' : ''}.</>
              )}
              {bulkAction === 'export' && (
                <>You are about to export <strong>{getSelectedCount()}</strong> attendee{getSelectedCount() > 1 ? 's' : ''} to a CSV file.</>
              )}
              {bulkAction === 'delete' && (
                <>You are about to delete <strong>{getSelectedCount()}</strong> attendee{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedAttendees.map(id => {
                const attendee = mockAttendees.find(a => a.id === id);
                return attendee ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(attendee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{attendee.name}</span>
                    <span className="text-gray-400">—</span>
                    <span className="text-gray-500 text-xs">{attendee.email}</span>
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
                if (bulkAction === 'send') handleBulkSend();
                else if (bulkAction === 'export') handleBulkExport();
                else if (bulkAction === 'delete') handleBulkDelete();
              }}
            >
              {bulkAction === 'send' && <Send className="h-4 w-4 mr-2" />}
              {bulkAction === 'export' && <Download className="h-4 w-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'send' && 'Send All'}
              {bulkAction === 'export' && 'Export All'}
              {bulkAction === 'delete' && 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Attendee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attendee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAttendee && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedAttendee.name}</p>
                  <p className="text-sm text-gray-500">{selectedAttendee.email}</p>
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
              Delete Attendee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
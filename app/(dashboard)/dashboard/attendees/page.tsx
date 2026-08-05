'use client';

import { useState, useMemo } from 'react';
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

  // Get unique events for filter
  const events = useMemo(() => {
    const uniqueEvents = new Set(mockAttendees.map(a => a.eventTitle));
    return Array.from(uniqueEvents);
  }, []);

  // Filter attendees
  const filteredAttendees = useMemo(() => {
    return mockAttendees.filter((attendee) => {
      const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.phone.includes(searchQuery);
      const matchesEvent = selectedEvent === 'all' || attendee.eventTitle === selectedEvent;
      const matchesStatus = selectedStatus === 'all' || attendee.status === selectedStatus;
      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [searchQuery, selectedEvent, selectedStatus]);

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
      setSelectedAttendees(filteredAttendees.map(a => a.id));
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

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkSend = () => {
    // Handle bulk send (e.g., send certificates, reminders, etc.)
    setIsBulkActionDialogOpen(false);
    setSelectedAttendees([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    // Handle bulk delete
    setIsBulkActionDialogOpen(false);
    setSelectedAttendees([]);
    setSelectAll(false);
  };

  const handleBulkExport = () => {
    // Handle bulk export
    setIsBulkActionDialogOpen(false);
    setSelectedAttendees([]);
    setSelectAll(false);
  };

  const getSelectedCount = () => selectedAttendees.length;

  return (
    <div className="space-y-6">
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

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search attendees by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full cursor-text"
              />
            </div>

            {/* Event Filter */}
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

            {/* Status Filter */}
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

          {/* Bulk Actions Bar */}
          {getSelectedCount() > 0 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {getSelectedCount()} attendee{getSelectedCount() > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

      {/* Attendees Table */}
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
                  <TableHead className="py-3 px-4">Attendee</TableHead>
                  <TableHead className="py-3 px-4">Event</TableHead>
                  <TableHead className="py-3 px-4">Status</TableHead>
                  <TableHead className="py-3 px-4">Payment</TableHead>
                  <TableHead className="py-3 px-4">CPD Hours</TableHead>
                  <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.length > 0 ? (
                  filteredAttendees.map((attendee) => {
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
                        onClick={() => handleViewAttendee(attendee)}
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
                              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
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
        </CardContent>
      </Card>

      {/* View Attendee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
            <DialogDescription>
              View and manage attendee information.
            </DialogDescription>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAttendee.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(selectedAttendee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedAttendee.name}</h3>
                  <p className="text-sm text-gray-500">{selectedAttendee.email}</p>
                  <p className="text-sm text-gray-500">{selectedAttendee.phone}</p>
                </div>
              </div>

              <Separator />

              {/* Event Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Event</Label>
                  <p className="font-medium">{selectedAttendee.eventTitle}</p>
                  <p className="text-sm text-gray-500">{selectedAttendee.eventDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge variant="outline" className={`${statusConfig[selectedAttendee.status].color} border mt-1`}>
                    {statusConfig[selectedAttendee.status].label}
                  </Badge>
                </div>
              </div>

              {/* Ticket & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Ticket Type</Label>
                  <p className="font-medium">{selectedAttendee.ticketType}</p>
                  <p className="text-sm text-gray-500">{selectedAttendee.price}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payment</Label>
                  <Badge variant="outline" className={`${paymentStatusConfig[selectedAttendee.paymentStatus].color} border mt-1`}>
                    {paymentStatusConfig[selectedAttendee.paymentStatus].label}
                  </Badge>
                </div>
              </div>

              {/* CPD & Certificate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">CPD Hours</Label>
                  <p className="font-medium">{selectedAttendee.cpdHours || 0} hours</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Certificate</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedAttendee.certificateIssued ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Issued</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Not issued</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedAttendee.checkedInAt && (
                <div>
                  <Label className="text-xs text-gray-500">Checked In At</Label>
                  <p className="text-sm">{selectedAttendee.checkedInAt}</p>
                </div>
              )}

              <Separator />

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    router.push(`/dashboard/attendees/${selectedAttendee.id}/edit`);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Attendee
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
                // Handle delete
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
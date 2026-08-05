'use client';

import { useState, useMemo } from 'react';
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

  // Filter logic
  const filteredEvents = mockEvents.filter((event: EventItem) => {
    const matchesTab =
      activeTab === 'all' || event.status.toLowerCase() === activeTab;
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Stats
  const totalEvents = mockEvents.length;
  const totalRegistered = mockEvents.reduce((acc, e) => acc + e.registered, 0);
  const liveEvents = mockEvents.filter(e => e.status === 'Live').length;
  const cpdEvents = mockEvents.filter(e => e.cpdHours > 0).length;

  const handleRowClick = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsViewDialogOpen(true);
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

  return (
    <div className="space-y-6">
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

      {/* Filter Bar and Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Tabs */}
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

            {/* Search */}
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

          {/* Bulk Actions Bar */}
          {getSelectedCount() > 0 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {getSelectedCount()} event{getSelectedCount() > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

      {/* Events Table */}
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
                  <TableHead className="py-3 px-4">Event Title</TableHead>
                  <TableHead className="py-3 px-4">Type</TableHead>
                  <TableHead className="py-3 px-4">Date & Time</TableHead>
                  <TableHead className="py-3 px-4">Registrations</TableHead>
                  <TableHead className="py-3 px-4">Status</TableHead>
                  <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event: EventItem) => {
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
        </CardContent>
      </Card>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View and manage event information.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`${typeConfig[selectedEvent.type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-700'}`}>
                      {selectedEvent.type}
                    </Badge>
                    <Badge variant="outline" className={`${statusConfig[selectedEvent.status as keyof typeof statusConfig]?.color || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{selectedEvent.price}</p>
                  <p className="text-xs text-gray-500">Ticket Price</p>
                </div>
              </div>

              <Separator />

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
                  <p className="font-medium">{selectedEvent.date}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Time</Label>
                  <p className="font-medium">{selectedEvent.time || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Platform</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Video className="h-4 w-4 text-gray-400" />
                    {selectedEvent.platform}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Location</Label>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedEvent.location || 'Virtual'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Host</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    {selectedEvent.host || 'Not specified'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">CPD Hours</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Award className="h-4 w-4 text-amber-500" />
                    {selectedEvent.cpdHours} hours
                  </p>
                </div>
              </div>

              {/* Registrations */}
              <div>
                <Label className="text-xs text-gray-500">Registrations</Label>
                <div className="mt-2">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
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
                <div>
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
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
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    window.open(`/events/${selectedEvent.id}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    router.push(`/dashboard/events/${selectedEvent.id}/edit`);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                // Handle delete
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete Event
            </Button>
          </DialogFooter>
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
    </div>
  );
}
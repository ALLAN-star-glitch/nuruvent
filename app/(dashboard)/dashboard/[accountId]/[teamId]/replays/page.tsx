'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  Play,
  Download,
  Trash2,
  MoreVertical,
  Search,
  Calendar,
  Clock,
  Users,
  Eye,
  Share2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  FileVideo,
  RefreshCw,
  Filter,
  ExternalLink,
  Edit3,
  Lock,
  Unlock,
  Link as LinkIcon,
  Plus,
  ChevronDown,
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

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// Types
interface Replay {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventId: string;
  videoUrl: string;
  thumbnail?: string;
  duration: string;
  fileSize: string;
  uploadDate: string;
  views: number;
  downloads: number;
  status: 'processed' | 'processing' | 'failed' | 'uploaded';
  visibility: 'public' | 'private' | 'unlisted';
  accessLevel: 'all' | 'attendees' | 'paid' | 'hosts';
  cpdHours: number;
  certificateIssued: boolean;
  hostName: string;
  hostEmail: string;
  attendeesCount: number;
  tags: string[];
  description: string;
}

// Mock Data
const mockReplays: Replay[] = [
  {
    id: 'rep_1',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    eventId: 'evt_1',
    videoUrl: 'https://nuruvent.com/replays/nestjs-advanced',
    thumbnail: '/api/placeholder/320/180',
    duration: '02:15:30',
    fileSize: '1.2 GB',
    uploadDate: 'Aug 6, 2026',
    views: 142,
    downloads: 87,
    status: 'processed',
    visibility: 'public',
    accessLevel: 'all',
    cpdHours: 4,
    certificateIssued: true,
    hostName: 'John Doe',
    hostEmail: 'john@example.com',
    attendeesCount: 142,
    tags: ['Backend', 'Node.js', 'Microservices'],
    description: 'Full recording of the Advanced NestJS Microservices Architecture workshop.',
  },
  {
    id: 'rep_2',
    eventTitle: 'Mobile Test Automation with Appium & Robot Framework',
    eventDate: 'Aug 12, 2026',
    eventId: 'evt_2',
    videoUrl: 'https://nuruvent.com/replays/mobile-test-automation',
    thumbnail: '/api/placeholder/320/180',
    duration: '01:45:20',
    fileSize: '980 MB',
    uploadDate: 'Aug 13, 2026',
    views: 89,
    downloads: 54,
    status: 'processing',
    visibility: 'private',
    accessLevel: 'attendees',
    cpdHours: 3,
    certificateIssued: false,
    hostName: 'Jane Smith',
    hostEmail: 'jane@example.com',
    attendeesCount: 89,
    tags: ['Mobile', 'Testing', 'Appium'],
    description: 'Recording of the mobile test automation workshop.',
  },
  {
    id: 'rep_3',
    eventTitle: 'Fintech Security Compliance & M-Pesa API Integration',
    eventDate: 'Aug 20, 2026',
    eventId: 'evt_3',
    videoUrl: 'https://nuruvent.com/replays/fintech-security',
    thumbnail: '/api/placeholder/320/180',
    duration: '01:30:00',
    fileSize: '750 MB',
    uploadDate: 'Aug 21, 2026',
    views: 0,
    downloads: 0,
    status: 'uploaded',
    visibility: 'unlisted',
    accessLevel: 'paid',
    cpdHours: 2,
    certificateIssued: false,
    hostName: 'Michael Kiprop',
    hostEmail: 'michael@example.com',
    attendeesCount: 0,
    tags: ['Fintech', 'Security', 'M-Pesa'],
    description: 'Recording of the fintech security compliance webinar.',
  },
  {
    id: 'rep_4',
    eventTitle: 'Full-Stack Scaling Strategies with Next.js & Go',
    eventDate: 'Jul 28, 2026',
    eventId: 'evt_4',
    videoUrl: 'https://nuruvent.com/replays/fullstack-scaling',
    thumbnail: '/api/placeholder/320/180',
    duration: '02:00:00',
    fileSize: '1.5 GB',
    uploadDate: 'Jul 29, 2026',
    views: 215,
    downloads: 143,
    status: 'processed',
    visibility: 'public',
    accessLevel: 'all',
    cpdHours: 2,
    certificateIssued: true,
    hostName: 'Sarah Wanjiru',
    hostEmail: 'sarah@example.com',
    attendeesCount: 215,
    tags: ['Next.js', 'Go', 'Scaling'],
    description: 'Recording of the full-stack scaling strategies meetup.',
  },
  {
    id: 'rep_5',
    eventTitle: 'Data Science with Python Workshop',
    eventDate: 'Aug 25, 2026',
    eventId: 'evt_5',
    videoUrl: 'https://nuruvent.com/replays/data-science-python',
    thumbnail: '/api/placeholder/320/180',
    duration: '03:00:00',
    fileSize: '2.1 GB',
    uploadDate: 'Aug 26, 2026',
    views: 0,
    downloads: 0,
    status: 'failed',
    visibility: 'private',
    accessLevel: 'attendees',
    cpdHours: 0,
    certificateIssued: false,
    hostName: 'David Ochieng',
    hostEmail: 'david@example.com',
    attendeesCount: 0,
    tags: ['Data Science', 'Python'],
    description: 'Recording upload failed. Please retry.',
  },
];

const statusConfig = {
  processed: { 
    label: 'Processed', 
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle2,
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: RefreshCw,
  },
  uploaded: { 
    label: 'Uploaded', 
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: Upload,
  },
  failed: { 
    label: 'Failed', 
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: AlertCircle,
  },
};

const visibilityConfig = {
  public: { label: 'Public', color: 'bg-green-100 text-green-700' },
  private: { label: 'Private', color: 'bg-red-100 text-red-700' },
  unlisted: { label: 'Unlisted', color: 'bg-amber-100 text-amber-700' },
};

const accessConfig = {
  all: { label: 'Everyone', color: 'bg-blue-100 text-blue-700' },
  attendees: { label: 'Attendees Only', color: 'bg-green-100 text-green-700' },
  paid: { label: 'Paid Only', color: 'bg-purple-100 text-purple-700' },
  hosts: { label: 'Hosts Only', color: 'bg-amber-100 text-amber-700' },
};

type SortField = 'eventTitle' | 'eventDate' | 'views' | 'status' | 'uploadDate';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

export default function ReplaysPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);
  const [selectedReplays, setSelectedReplays] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Sort and view state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('uploadDate');
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

  // Filter replays
  const filteredReplays = useMemo(() => {
    const filtered = mockReplays.filter((replay) => {
      const matchesSearch = 
        replay.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        replay.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        replay.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatus === 'all' || replay.status === selectedStatus;
      const matchesVisibility = selectedVisibility === 'all' || replay.visibility === selectedVisibility;
      return matchesSearch && matchesStatus && matchesVisibility;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'eventTitle':
          comparison = a.eventTitle.localeCompare(b.eventTitle);
          break;
        case 'eventDate':
          comparison = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'uploadDate':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, selectedStatus, selectedVisibility, sortField, sortDirection]);

  // Paginate replays
  const paginatedReplays = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReplays.slice(startIndex, endIndex);
  }, [filteredReplays, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredReplays.length / itemsPerPage);

  // Stats
  const stats = useMemo(() => {
    const total = mockReplays.length;
    const processed = mockReplays.filter(r => r.status === 'processed').length;
    const processing = mockReplays.filter(r => r.status === 'processing').length;
    const failed = mockReplays.filter(r => r.status === 'failed').length;
    const totalViews = mockReplays.reduce((acc, r) => acc + r.views, 0);
    const totalDownloads = mockReplays.reduce((acc, r) => acc + r.downloads, 0);
    return { total, processed, processing, failed, totalViews, totalDownloads };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewReplay = (replay: Replay) => {
    setSelectedReplay(replay);
    setIsViewDialogOpen(true);
  };

  const handleDeleteReplay = (replay: Replay) => {
    setSelectedReplay(replay);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReplays([]);
    } else {
      setSelectedReplays(paginatedReplays.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectReplay = (id: string) => {
    setSelectedReplays(prev => {
      if (prev.includes(id)) {
        return prev.filter(r => r !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleRowClick = (id: string) => {
    if (!isMobile) {
      handleSelectReplay(id);
    }
  };

  const handleCardClick = (replay: Replay) => {
    if (isMobile) {
      handleViewReplay(replay);
    } else {
      handleSelectReplay(replay.id);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedReplays([]);
    setSelectAll(false);
  };

  const handleBulkVisibility = (visibility: 'public' | 'private' | 'unlisted') => {
    setIsBulkActionDialogOpen(false);
    setSelectedReplays([]);
    setSelectAll(false);
  };

  const handleViewSelected = () => {
    if (selectedReplays.length === 1) {
      const replay = mockReplays.find(r => r.id === selectedReplays[0]);
      if (replay) {
        handleViewReplay(replay);
      }
    }
  };

  const getSelectedCount = () => selectedReplays.length;

  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatFileSize = (size: string) => {
    return size;
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
  const handleModalPlay = () => {
    if (selectedReplay) {
      setIsViewDialogOpen(false);
      window.open(selectedReplay.videoUrl, '_blank');
    }
  };

  const handleModalCopyLink = () => {
    if (selectedReplay) {
      setIsViewDialogOpen(false);
      navigator.clipboard.writeText(selectedReplay.videoUrl);
    }
  };

  const handleModalShare = () => {
    if (selectedReplay) {
      setIsViewDialogOpen(false);
      console.log('Share replay:', selectedReplay.eventTitle);
    }
  };

  const handleModalDelete = () => {
    setIsViewDialogOpen(false);
    if (selectedReplay) {
      handleDeleteReplay(selectedReplay);
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStatus !== 'all') count++;
    if (selectedVisibility !== 'all') count++;
    return count;
  };

  // Get sort label
  const getSortLabel = () => {
    const labels = {
      eventTitle: 'Title',
      eventDate: 'Date',
      views: 'Views',
      status: 'Status',
      uploadDate: 'Uploaded'
    };
    return labels[sortField];
  };

  // Handle reset on mobile
  const handleMobileReset = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedVisibility('all');
    setSortField('uploadDate');
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
          <h1 className="text-2xl font-bold text-gray-900">Event Replays</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and share recorded sessions from your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Replay
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Link Replay
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Processed</p>
            <p className="text-xl font-bold text-green-600">{stats.processed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Processing</p>
            <p className="text-xl font-bold text-amber-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Total Views</p>
            <p className="text-xl font-bold text-blue-600">{stats.totalViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-gray-500">Downloads</p>
            <p className="text-xl font-bold text-purple-600">{stats.totalDownloads}</p>
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
                    placeholder="Search replays by event, host, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full cursor-text"
                  />
                </div>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                    <SelectItem value="processed" className="cursor-pointer">Processed</SelectItem>
                    <SelectItem value="processing" className="cursor-pointer">Processing</SelectItem>
                    <SelectItem value="uploaded" className="cursor-pointer">Uploaded</SelectItem>
                    <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                  <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                    <SelectValue placeholder="All Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Visibility</SelectItem>
                    <SelectItem value="public" className="cursor-pointer">Public</SelectItem>
                    <SelectItem value="private" className="cursor-pointer">Private</SelectItem>
                    <SelectItem value="unlisted" className="cursor-pointer">Unlisted</SelectItem>
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
                        <SelectItem value="eventTitle" className="cursor-pointer text-sm">Title</SelectItem>
                        <SelectItem value="eventDate" className="cursor-pointer text-sm">Date</SelectItem>
                        <SelectItem value="views" className="cursor-pointer text-sm">Views</SelectItem>
                        <SelectItem value="status" className="cursor-pointer text-sm">Status</SelectItem>
                        <SelectItem value="uploadDate" className="cursor-pointer text-sm">Uploaded</SelectItem>
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
                    {filteredReplays.length} replay{filteredReplays.length !== 1 ? 's' : ''}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatus('all');
                      setSelectedVisibility('all');
                      setSortField('uploadDate');
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
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {getSelectedCount()} replay{getSelectedCount() > 1 ? 's' : ''} selected
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
                    onClick={() => handleBulkAction('public')}
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Make Public
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => handleBulkAction('private')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Make Private
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
                      setSelectedReplays([]);
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

      {/* Replays Table or Grid View */}
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
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('eventTitle')}>
                      <div className="flex items-center">
                        Event / Replay
                        {getSortIcon('eventTitle')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('status')}>
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4">Visibility</TableHead>
                    <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('views')}>
                      <div className="flex items-center">
                        Stats
                        {getSortIcon('views')}
                      </div>
                    </TableHead>
                    <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReplays.length > 0 ? (
                    paginatedReplays.map((replay) => {
                      const status = statusConfig[replay.status];
                      const visibility = visibilityConfig[replay.visibility];
                      const StatusIcon = status.icon;
                      const isSelected = selectedReplays.includes(replay.id);

                      return (
                        <TableRow 
                          key={replay.id}
                          className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleRowClick(replay.id)}
                        >
                          <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectReplay(replay.id)}
                              className="cursor-pointer"
                            />
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Video className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {replay.eventTitle}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>{replay.eventDate}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{formatDuration(replay.duration)}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{replay.hostName}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {replay.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {replay.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{replay.tags.length - 2}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${status.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                            {replay.status === 'processing' && (
                              <Progress value={65} className="w-20 h-1 mt-1" />
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <Badge variant="outline" className={`${visibility.color} border`}>
                              {visibility.label}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{accessConfig[replay.accessLevel].label}</p>
                          </TableCell>
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-gray-400" />
                                <span>{replay.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3 text-gray-400" />
                                <span>{replay.downloads}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span>{replay.attendeesCount}</span>
                              </div>
                            </div>
                            {replay.cpdHours > 0 && (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs mt-1">
                                {replay.cpdHours} CPD hrs
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
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewReplay(replay);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(replay.videoUrl, '_blank');
                                  }}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Play Replay
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(replay.videoUrl);
                                  }}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteReplay(replay);
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
                      <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Video className="h-8 w-8 text-gray-300" />
                          <p className="font-medium">No replays found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredReplays.length > 0 && (
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
                    {filteredReplays.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredReplays.length)} of{' '}
                    {filteredReplays.length}
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
            {paginatedReplays.length > 0 ? (
              paginatedReplays.map((replay) => {
                const status = statusConfig[replay.status];
                const visibility = visibilityConfig[replay.visibility];
                const StatusIcon = status.icon;
                const isSelected = selectedReplays.includes(replay.id);

                return (
                  <Card 
                    key={replay.id} 
                    className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200/80 ${
                      isSelected ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => handleCardClick(replay)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {!isMobile && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectReplay(replay.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer"
                            />
                          )}
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Video className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <Badge variant="outline" className={`${status.color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {replay.eventTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{replay.eventDate}</span>
                          <span>•</span>
                          <span>{formatDuration(replay.duration)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{replay.hostName}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {replay.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {replay.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{replay.tags.length - 3}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <Badge variant="outline" className={`${visibility.color} border text-xs`}>
                          {visibility.label}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{replay.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{replay.downloads}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {replay.cpdHours > 0 && (
                          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                            {replay.cpdHours} CPD hrs
                          </Badge>
                        )}
                        {isMobile ? (
                          <div 
                            className="flex items-center gap-1 text-xs text-primary font-medium cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReplay(replay);
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
                                  handleViewReplay(replay);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(replay.videoUrl, '_blank');
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Play Replay
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(replay.videoUrl);
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReplay(replay);
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
                  <Video className="h-8 w-8 text-gray-300" />
                  <p className="font-medium">No replays found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination for Grid View */}
          {filteredReplays.length > 0 && (
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
                  {filteredReplays.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredReplays.length)} of{' '}
                  {filteredReplays.length}
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
                Refine your replay list
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto mt-6 pb-6">
              {/* Search - Full width */}
              <div className="space-y-1.5 mb-5">
                <Label className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search replays..."
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
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                      <div className="truncate w-full text-left">
                        <SelectValue placeholder="All Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                      <SelectItem value="processed" className="cursor-pointer">Processed</SelectItem>
                      <SelectItem value="processing" className="cursor-pointer">Processing</SelectItem>
                      <SelectItem value="uploaded" className="cursor-pointer">Uploaded</SelectItem>
                      <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility Filter */}
                <div className="space-y-1.5 min-w-0 overflow-hidden">
                  <Label className="text-sm font-medium text-gray-700 truncate">Visibility</Label>
                  <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                    <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                      <div className="truncate w-full text-left">
                        <SelectValue placeholder="All Visibility" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="cursor-pointer">All Visibility</SelectItem>
                      <SelectItem value="public" className="cursor-pointer">Public</SelectItem>
                      <SelectItem value="private" className="cursor-pointer">Private</SelectItem>
                      <SelectItem value="unlisted" className="cursor-pointer">Unlisted</SelectItem>
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
                    <SelectItem value="eventTitle" className="cursor-pointer">Title</SelectItem>
                    <SelectItem value="eventDate" className="cursor-pointer">Date</SelectItem>
                    <SelectItem value="views" className="cursor-pointer">Views</SelectItem>
                    <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
                    <SelectItem value="uploadDate" className="cursor-pointer">Uploaded</SelectItem>
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

      {/* View Replay Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Replay Details</DialogTitle>
            <DialogDescription>
              View and manage replay information.
            </DialogDescription>
          </DialogHeader>
          {selectedReplay && (
            <div className="space-y-4 sm:space-y-6">
              {/* Video Player Preview */}
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <p className="text-white text-xs sm:text-sm mt-2">{selectedReplay.eventTitle}</p>
                  <p className="text-gray-400 text-xs">{formatDuration(selectedReplay.duration)}</p>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{selectedReplay.eventTitle}</h2>
                <p className="text-xs sm:text-sm text-gray-500">{selectedReplay.description}</p>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge variant="outline" className={`${statusConfig[selectedReplay.status].color} border mt-1`}>
                    {statusConfig[selectedReplay.status].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Visibility</Label>
                  <Badge variant="outline" className={`${visibilityConfig[selectedReplay.visibility].color} border mt-1`}>
                    {visibilityConfig[selectedReplay.visibility].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Access Level</Label>
                  <Badge variant="outline" className={`${accessConfig[selectedReplay.accessLevel].color} border mt-1`}>
                    {accessConfig[selectedReplay.accessLevel].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">CPD Hours</Label>
                  <p className="text-sm sm:text-base font-medium mt-1">{selectedReplay.cpdHours} hours</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Duration</Label>
                  <p className="text-sm sm:text-base font-medium mt-1">{formatDuration(selectedReplay.duration)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">File Size</Label>
                  <p className="text-sm sm:text-base font-medium mt-1">{formatFileSize(selectedReplay.fileSize)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Uploaded</Label>
                  <p className="text-sm sm:text-base font-medium mt-1">{selectedReplay.uploadDate}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Certificate Issued</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedReplay.certificateIssued ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-sm font-medium text-green-600">Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500">No</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedReplay.views}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedReplay.downloads}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Downloads</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedReplay.attendeesCount}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Attendees</p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 font-medium">Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalPlay}
                  >
                    <Play className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Play Replay</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalCopyLink}
                  >
                    <Copy className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalShare}
                  >
                    <Share2 className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Share</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full cursor-pointer justify-start text-sm"
                    onClick={handleModalDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">Delete Replay</span>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Replay</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this replay? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedReplay && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedReplay.eventTitle}</p>
                  <p className="text-sm text-gray-500">{selectedReplay.eventDate}</p>
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
              Delete Replay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'public' && 'Make Public'}
              {bulkAction === 'private' && 'Make Private'}
              {bulkAction === 'delete' && 'Delete Replays'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'public' && (
                <>You are about to make <strong>{getSelectedCount()}</strong> replay{getSelectedCount() > 1 ? 's' : ''} public.</>
              )}
              {bulkAction === 'private' && (
                <>You are about to make <strong>{getSelectedCount()}</strong> replay{getSelectedCount() > 1 ? 's' : ''} private.</>
              )}
              {bulkAction === 'delete' && (
                <>You are about to delete <strong>{getSelectedCount()}</strong> replay{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedReplays.map(id => {
                const replay = mockReplays.find(r => r.id === id);
                return replay ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Video className="h-4 w-4 text-gray-400" />
                    <span>{replay.eventTitle}</span>
                    <span className="text-gray-400">—</span>
                    <span className="text-gray-500 text-xs">{replay.eventDate}</span>
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
                if (bulkAction === 'public') handleBulkVisibility('public');
                else if (bulkAction === 'private') handleBulkVisibility('private');
                else if (bulkAction === 'delete') handleBulkDelete();
              }}
            >
              {bulkAction === 'public' && <Unlock className="h-4 w-4 mr-2" />}
              {bulkAction === 'private' && <Lock className="h-4 w-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'public' && 'Make Public'}
              {bulkAction === 'private' && 'Make Private'}
              {bulkAction === 'delete' && 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
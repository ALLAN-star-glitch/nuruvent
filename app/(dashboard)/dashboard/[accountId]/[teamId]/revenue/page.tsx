'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Users,
  Award,
  Clock,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  LineChart,
  Wallet,
  Coins,
  Landmark,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Trash2,
  Ban,
  Send,
  XCircle as XCircleIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';

// Types
interface RevenueTransaction {
  id: string;
  date: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  amount: number;
  currency: string;
  type: 'ticket' | 'certificate' | 'commission' | 'payout';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'mpesa' | 'card' | 'bank';
  transactionId: string;
  description: string;
}

interface RevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  netRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  refundedPayments: number;
  averageTicketPrice: number;
  totalAttendees: number;
  totalEvents: number;
  growthPercentage: number;
  monthlyRevenue: { month: string; amount: number }[];
  revenueByType: { type: string; amount: number; percentage: number }[];
}

// Mock Data
const mockTransactions: RevenueTransaction[] = [
  {
    id: 'rev_1',
    date: '2026-08-05',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    attendeeName: 'Alice Mwangi',
    attendeeEmail: 'alice@example.com',
    amount: 2500,
    currency: 'KES',
    type: 'ticket',
    status: 'completed',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-001',
    description: 'Ticket purchase for Advanced NestJS Workshop',
  },
  {
    id: 'rev_2',
    date: '2026-08-05',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    attendeeName: 'Brian Ochieng',
    attendeeEmail: 'brian@example.com',
    amount: 5000,
    currency: 'KES',
    type: 'ticket',
    status: 'completed',
    paymentMethod: 'card',
    transactionId: 'CARD-2026-002',
    description: 'VIP ticket purchase',
  },
  {
    id: 'rev_3',
    date: '2026-08-04',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    attendeeName: 'System',
    attendeeEmail: 'system@nuruvent.com',
    amount: 750,
    currency: 'KES',
    type: 'commission',
    status: 'completed',
    paymentMethod: 'bank',
    transactionId: 'COM-2026-001',
    description: '10% commission on ticket sales (KES 7,500)',
  },
  {
    id: 'rev_4',
    date: '2026-08-12',
    eventTitle: 'Mobile Test Automation with Appium & Robot Framework',
    attendeeName: 'Catherine Njeri',
    attendeeEmail: 'catherine@example.com',
    amount: 0,
    currency: 'KES',
    type: 'ticket',
    status: 'completed',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-003',
    description: 'Free ticket purchase',
  },
  {
    id: 'rev_5',
    date: '2026-08-10',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    attendeeName: 'System',
    attendeeEmail: 'system@nuruvent.com',
    amount: 4500,
    currency: 'KES',
    type: 'payout',
    status: 'completed',
    paymentMethod: 'bank',
    transactionId: 'PAY-2026-001',
    description: 'Payout to host (after 10% commission)',
  },
  {
    id: 'rev_6',
    date: '2026-08-15',
    eventTitle: 'Fintech Security Compliance & M-Pesa API Integration',
    attendeeName: 'Eunice Wanjiru',
    attendeeEmail: 'eunice@example.com',
    amount: 1000,
    currency: 'KES',
    type: 'ticket',
    status: 'failed',
    paymentMethod: 'card',
    transactionId: 'CARD-2026-005',
    description: 'Payment failed - insufficient funds',
  },
  {
    id: 'rev_7',
    date: '2026-07-28',
    eventTitle: 'Full-Stack Scaling Strategies with Next.js & Go',
    attendeeName: 'Faith Akinyi',
    attendeeEmail: 'faith@example.com',
    amount: 0,
    currency: 'KES',
    type: 'ticket',
    status: 'refunded',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-006',
    description: 'Refunded - attendee cancelled',
  },
  {
    id: 'rev_8',
    date: '2026-08-06',
    eventTitle: 'Data Science with Python Workshop',
    attendeeName: 'Grace Muthoni',
    attendeeEmail: 'grace@example.com',
    amount: 500,
    currency: 'KES',
    type: 'certificate',
    status: 'completed',
    paymentMethod: 'mpesa',
    transactionId: 'CERT-2026-001',
    description: 'CPD Certificate issuance fee',
  },
  {
    id: 'rev_9',
    date: '2026-08-06',
    eventTitle: 'Data Science with Python Workshop',
    attendeeName: 'System',
    attendeeEmail: 'system@nuruvent.com',
    amount: 50,
    currency: 'KES',
    type: 'commission',
    status: 'completed',
    paymentMethod: 'bank',
    transactionId: 'COM-2026-002',
    description: '10% commission on certificate (KES 500)',
  },
];

const mockSummary: RevenueSummary = {
  totalRevenue: 9050,
  totalCommission: 800,
  totalPayouts: 4500,
  netRevenue: 3750,
  completedPayments: 6,
  pendingPayments: 0,
  refundedPayments: 1,
  averageTicketPrice: 1416.67,
  totalAttendees: 8,
  totalEvents: 4,
  growthPercentage: 23.5,
  monthlyRevenue: [
    { month: 'Jul 2026', amount: 8500 },
    { month: 'Aug 2026', amount: 10500 },
  ],
  revenueByType: [
    { type: 'Tickets', amount: 8500, percentage: 85 },
    { type: 'Certificates', amount: 500, percentage: 5 },
    { type: 'Commission', amount: 800, percentage: 8 },
    { type: 'Payouts', amount: 4500, percentage: 45 },
  ],
};

const statusConfig = {
  completed: { 
    label: 'Completed', 
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle2,
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: Clock,
  },
  failed: { 
    label: 'Failed', 
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
  refunded: { 
    label: 'Refunded', 
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: AlertCircle,
  },
};

const typeConfig = {
  ticket: { label: 'Ticket', color: 'bg-blue-100 text-blue-700' },
  certificate: { label: 'Certificate', color: 'bg-purple-100 text-purple-700' },
  commission: { label: 'Commission', color: 'bg-amber-100 text-amber-700' },
  payout: { label: 'Payout', color: 'bg-green-100 text-green-700' },
};

const paymentMethodConfig = {
  mpesa: { label: 'M-Pesa', color: 'bg-green-100 text-green-700' },
  card: { label: 'Card', color: 'bg-blue-100 text-blue-700' },
  bank: { label: 'Bank', color: 'bg-purple-100 text-purple-700' },
};

type SortField = 'date' | 'attendeeName' | 'eventTitle' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

export default function RevenuePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<RevenueTransaction | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Sort and view state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Check if mobile (using window width)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const filtered = mockTransactions.filter((transaction) => {
      const matchesSearch = 
        transaction.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort logic
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'attendeeName':
          comparison = a.attendeeName.localeCompare(b.attendeeName);
          break;
        case 'eventTitle':
          comparison = a.eventTitle.localeCompare(b.eventTitle);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
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
  }, [searchQuery, selectedType, selectedStatus, sortField, sortDirection]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleViewTransaction = (transaction: RevenueTransaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: RevenueTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => {
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleRowClick = (id: string) => {
    if (!isMobile) {
      handleSelectTransaction(id);
    }
  };

  const handleCardClick = (transaction: RevenueTransaction) => {
    if (isMobile) {
      // Mobile: open modal
      handleViewTransaction(transaction);
    } else {
      // Desktop: toggle selection
      handleSelectTransaction(transaction.id);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkExport = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedTransactions([]);
    setSelectAll(false);
  };

  const handleBulkRefund = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedTransactions([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedTransactions([]);
    setSelectAll(false);
  };

  const handleViewSelected = () => {
    if (selectedTransactions.length === 1) {
      const transaction = mockTransactions.find(t => t.id === selectedTransactions[0]);
      if (transaction) {
        handleViewTransaction(transaction);
      }
    }
  };

  const getSelectedCount = () => selectedTransactions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
  const handleModalDownloadReceipt = () => {
    if (selectedTransaction) {
      setIsViewDialogOpen(false);
      console.log('Download receipt for:', selectedTransaction.transactionId);
    }
  };

  const handleModalDelete = () => {
    setIsViewDialogOpen(false);
    if (selectedTransaction) {
      handleDeleteTransaction(selectedTransaction);
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedType !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  };

  // Get sort label
  const getSortLabel = () => {
    const labels = {
      date: 'Date',
      attendeeName: 'Attendee',
      eventTitle: 'Event',
      amount: 'Amount',
      status: 'Status'
    };
    return labels[sortField];
  };

  // Handle reset on mobile
  const handleMobileReset = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
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
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your earnings, commissions, and financial performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(mockSummary.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">{mockSummary.growthPercentage}% growth</span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(mockSummary.totalCommission)}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">10% of ticket sales</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(mockSummary.netRevenue)}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">After commission and payouts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payouts</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(mockSummary.totalPayouts)}</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Paid to hosts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-3 rounded-lg border border-gray-200/80">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-lg font-bold text-green-600">{mockSummary.completedPayments}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-bold text-amber-600">{mockSummary.pendingPayments}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80">
          <p className="text-xs text-gray-500">Refunded</p>
          <p className="text-lg font-bold text-gray-600">{mockSummary.refundedPayments}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80">
          <p className="text-xs text-gray-500">Avg Ticket</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(mockSummary.averageTicketPrice)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80">
          <p className="text-xs text-gray-500">Attendees</p>
          <p className="text-lg font-bold text-blue-600">{mockSummary.totalAttendees}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200/80">
          <p className="text-xs text-gray-500">Events</p>
          <p className="text-lg font-bold text-purple-600">{mockSummary.totalEvents}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg max-w-md">
          <TabsTrigger value="overview" className="cursor-pointer flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="cursor-pointer flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts" className="cursor-pointer flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Payouts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trend over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-2">
                  {mockSummary.monthlyRevenue.map((item, index) => {
                    const max = Math.max(...mockSummary.monthlyRevenue.map(m => m.amount));
                    const height = (item.amount / max) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-primary/10 rounded-t-lg" style={{ height: `${height}%` }}>
                          <div 
                            className="w-full bg-primary rounded-t-lg transition-all duration-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{item.month}</span>
                        <span className="text-xs font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>By transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSummary.revenueByType.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.type}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            item.type === 'Tickets' ? 'bg-blue-500' :
                            item.type === 'Certificates' ? 'bg-purple-500' :
                            item.type === 'Commission' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
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
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full cursor-text"
                      />
                    </div>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
                        <SelectItem value="ticket" className="cursor-pointer">Tickets</SelectItem>
                        <SelectItem value="certificate" className="cursor-pointer">Certificates</SelectItem>
                        <SelectItem value="commission" className="cursor-pointer">Commission</SelectItem>
                        <SelectItem value="payout" className="cursor-pointer">Payouts</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                        <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                        <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                        <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
                        <SelectItem value="refunded" className="cursor-pointer">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 2: View Options and Sort */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* View Toggle */}
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

                      {/* Sort Options */}
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
                            <SelectItem value="date" className="cursor-pointer text-sm">Date</SelectItem>
                            <SelectItem value="attendeeName" className="cursor-pointer text-sm">Attendee</SelectItem>
                            <SelectItem value="eventTitle" className="cursor-pointer text-sm">Event</SelectItem>
                            <SelectItem value="amount" className="cursor-pointer text-sm">Amount</SelectItem>
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
                        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs cursor-pointer"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedType('all');
                          setSelectedStatus('all');
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
                        {getSelectedCount()} transaction{getSelectedCount() > 1 ? 's' : ''} selected
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
                        onClick={() => handleBulkAction('export')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => handleBulkAction('refund')}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Refund
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
                          setSelectedTransactions([]);
                          setSelectAll(false);
                        }}
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transactions Table or Grid View */}
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
                        <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('date')}>
                          <div className="flex items-center">
                            Date
                            {getSortIcon('date')}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('eventTitle')}>
                          <div className="flex items-center">
                            Event / Attendee
                            {getSortIcon('eventTitle')}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 px-4">Type</TableHead>
                        <TableHead className="py-3 px-4 cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort('amount')}>
                          <div className="flex items-center">
                            Amount
                            {getSortIcon('amount')}
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
                      {paginatedTransactions.length > 0 ? (
                        paginatedTransactions.map((transaction) => {
                          const status = statusConfig[transaction.status];
                          const type = typeConfig[transaction.type];
                          const StatusIcon = status.icon;
                          const isSelected = selectedTransactions.includes(transaction.id);

                          return (
                            <TableRow 
                              key={transaction.id}
                              className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                                isSelected ? 'bg-primary/5' : ''
                              }`}
                              onClick={() => handleRowClick(transaction.id)}
                            >
                              <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleSelectTransaction(transaction.id)}
                                  className="cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="py-4 px-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm">{formatDate(transaction.date)}</p>
                                  <p className="text-xs text-gray-500">{transaction.transactionId}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{transaction.eventTitle}</p>
                                  <p className="text-xs text-gray-500">{transaction.attendeeName}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <Badge variant="outline" className={`${type.color} border`}>
                                  {type.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <div>
                                  <p className={`font-semibold ${
                                    transaction.amount > 0 ? 'text-green-600' : 'text-gray-500'
                                  }`}>
                                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                  </p>
                                  <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4">
                                <Badge variant="outline" className={`${status.color} border`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
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
                                        handleViewTransaction(transaction);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleModalDownloadReceipt();
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Receipt
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleModalDelete();
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
                              <Receipt className="h-8 w-8 text-gray-300" />
                              <p className="font-medium">No transactions found</p>
                              <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
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
                        {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                        {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                        {filteredTransactions.length}
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
            // Grid View - Always shown on mobile, also available on desktop
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => {
                    const status = statusConfig[transaction.status];
                    const type = typeConfig[transaction.type];
                    const StatusIcon = status.icon;
                    const isSelected = selectedTransactions.includes(transaction.id);

                    return (
                      <Card 
                        key={transaction.id}
                        className={`hover:shadow-lg transition-all duration-200 border-gray-200/80 cursor-pointer ${
                          isSelected ? 'border-primary/50 bg-primary/5' : ''
                        }`}
                        onClick={() => handleCardClick(transaction)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {!isMobile && (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleSelectTransaction(transaction.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer"
                                />
                              )}
                              <Badge variant="outline" className={`${type.color} border`}>
                                {type.label}
                              </Badge>
                            </div>
                            <Badge variant="outline" className={`${status.color} border`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">{transaction.eventTitle}</p>
                            <p className="text-xs text-gray-500">{transaction.attendeeName}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <p>{formatDate(transaction.date)}</p>
                              <p className="font-mono text-[10px]">{transaction.transactionId}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 truncate">{transaction.description}</p>
                            {isMobile ? (
                              <div 
                                className="flex items-center gap-1 text-xs text-primary font-medium cursor-pointer hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTransaction(transaction);
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
                                      handleViewTransaction(transaction);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleModalDownloadReceipt();
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Receipt
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleModalDelete();
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
                      <Receipt className="h-8 w-8 text-gray-300" />
                      <p className="font-medium">No transactions found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination for Grid View */}
              {filteredTransactions.length > 0 && (
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
                      {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                      {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                      {filteredTransactions.length}
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
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Summary</CardTitle>
              <CardDescription>Overview of payouts to hosts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-600 font-medium">Total Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockSummary.totalPayouts)}</p>
                  <p className="text-xs text-gray-500">Paid to hosts</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-600 font-medium">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(0)}</p>
                  <p className="text-xs text-gray-500">Awaiting processing</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium">Next Payout</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(2250)}</p>
                  <p className="text-xs text-gray-500">Scheduled for Aug 12, 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Recent payouts to hosts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Advanced NestJS Workshop</p>
                      <p className="text-xs text-gray-500">Paid on Aug 12, 2026</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(4500)}</p>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Completed
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Mobile Test Automation Workshop</p>
                      <p className="text-xs text-gray-500">Scheduled for Aug 19, 2026</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(2250)}</p>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      Processing
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mobile Floating Filter Strip - Only on Transactions Tab */}
      {isMobile && activeTab === 'transactions' && (
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
              Refine your transaction list
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto mt-6 pb-6">
            {/* Search - Full width */}
            <div className="space-y-1.5 mb-5">
              <Label className="text-sm font-medium text-gray-700">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 cursor-text border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                />
              </div>
            </div>

            {/* Grid Layout for Filters */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Type Filter */}
              <div className="space-y-1.5 min-w-0 overflow-hidden">
                <Label className="text-sm font-medium text-gray-700 truncate">Transaction Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                    <div className="truncate w-full text-left">
                      <SelectValue placeholder="All Types" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-w-[90vw]">
                    <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
                    <SelectItem value="ticket" className="cursor-pointer whitespace-normal break-words">Tickets</SelectItem>
                    <SelectItem value="certificate" className="cursor-pointer whitespace-normal break-words">Certificates</SelectItem>
                    <SelectItem value="commission" className="cursor-pointer whitespace-normal break-words">Commission</SelectItem>
                    <SelectItem value="payout" className="cursor-pointer whitespace-normal break-words">Payouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5 min-w-0 overflow-hidden">
                <Label className="text-sm font-medium text-gray-700 truncate">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-11 cursor-pointer border-gray-200 rounded-xl focus:ring-primary/20 w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                    <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                    <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                    <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
                    <SelectItem value="refunded" className="cursor-pointer">Refunded</SelectItem>
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
                  <SelectItem value="date" className="cursor-pointer">Date</SelectItem>
                  <SelectItem value="attendeeName" className="cursor-pointer">Attendee</SelectItem>
                  <SelectItem value="eventTitle" className="cursor-pointer">Event</SelectItem>
                  <SelectItem value="amount" className="cursor-pointer">Amount</SelectItem>
                  <SelectItem value="status" className="cursor-pointer">Status</SelectItem>
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

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View transaction information and status.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono font-medium">{selectedTransaction.transactionId}</p>
                </div>
                <Badge variant="outline" className={statusConfig[selectedTransaction.status].color}>
                  {statusConfig[selectedTransaction.status].label}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
                  <p className="font-medium">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Amount</Label>
                  <p className={`font-bold text-lg ${
                    selectedTransaction.amount > 0 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}{formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <Badge variant="outline" className={typeConfig[selectedTransaction.type].color}>
                    {typeConfig[selectedTransaction.type].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payment Method</Label>
                  <Badge variant="outline" className={paymentMethodConfig[selectedTransaction.paymentMethod].color}>
                    {paymentMethodConfig[selectedTransaction.paymentMethod].label}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Event</Label>
                  <p className="font-medium">{selectedTransaction.eventTitle}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Attendee</Label>
                  <p className="font-medium">{selectedTransaction.attendeeName}</p>
                  <p className="text-sm text-gray-500">{selectedTransaction.attendeeEmail}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Description</Label>
                  <p className="text-sm text-gray-600">{selectedTransaction.description}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs text-gray-500 font-medium">Actions</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 min-w-[100px] cursor-pointer justify-center text-sm"
                    onClick={handleModalDownloadReceipt}
                  >
                    <Download className="h-4 w-4 mr-2 shrink-0" />
                    Receipt
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 min-w-[100px] cursor-pointer justify-center text-sm"
                    onClick={handleModalDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2 shrink-0" />
                    Delete
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
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedTransaction.attendeeName}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(selectedTransaction.amount)}</p>
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
              Delete Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'export' && 'Export Transactions'}
              {bulkAction === 'refund' && 'Refund Transactions'}
              {bulkAction === 'delete' && 'Delete Transactions'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'export' && (
                <>You are about to export <strong>{getSelectedCount()}</strong> transaction{getSelectedCount() > 1 ? 's' : ''} to a CSV file.</>
              )}
              {bulkAction === 'refund' && (
                <>You are about to refund <strong>{getSelectedCount()}</strong> transaction{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
              {bulkAction === 'delete' && (
                <>You are about to delete <strong>{getSelectedCount()}</strong> transaction{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedTransactions.map(id => {
                const transaction = mockTransactions.find(t => t.id === id);
                return transaction ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Receipt className="h-4 w-4 text-gray-400" />
                    <span>{transaction.attendeeName}</span>
                    <span className="text-gray-400">—</span>
                    <span className="text-gray-500 text-xs">{formatCurrency(transaction.amount)}</span>
                  </div>
                ) : null;
              })}
            </ScrollArea>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className={`cursor-pointer ${
                bulkAction === 'refund' || bulkAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={() => {
                if (bulkAction === 'export') handleBulkExport();
                else if (bulkAction === 'refund') handleBulkRefund();
                else if (bulkAction === 'delete') handleBulkDelete();
              }}
            >
              {bulkAction === 'export' && <Download className="h-4 w-4 mr-2" />}
              {bulkAction === 'refund' && <Ban className="h-4 w-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'export' && 'Export All'}
              {bulkAction === 'refund' && 'Refund All'}
              {bulkAction === 'delete' && 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
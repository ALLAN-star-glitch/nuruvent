'use client';

import { useState, useMemo } from 'react';
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

export default function RevenuePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<RevenueTransaction | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) => {
      const matchesSearch = 
        transaction.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  const handleViewTransaction = (transaction: RevenueTransaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

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

  return (
    <div className="space-y-6">
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
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="py-3 px-4">Date</TableHead>
                      <TableHead className="py-3 px-4">Event / Attendee</TableHead>
                      <TableHead className="py-3 px-4">Type</TableHead>
                      <TableHead className="py-3 px-4">Amount</TableHead>
                      <TableHead className="py-3 px-4">Status</TableHead>
                      <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => {
                        const status = statusConfig[transaction.status];
                        const type = typeConfig[transaction.type];
                        const StatusIcon = status.icon;

                        return (
                          <TableRow 
                            key={transaction.id}
                            className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                            onClick={() => handleViewTransaction(transaction)}
                          >
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTransaction(transaction);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-gray-500">
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
            </CardContent>
          </Card>
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

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View transaction information and status.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
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

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
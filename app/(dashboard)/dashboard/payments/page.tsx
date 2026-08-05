'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CreditCard,
  Users,
  Calendar,
  Clock,
  MoreVertical,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Filter,
  TrendingUp,
  Check,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Receipt,
  FileText,
  RefreshCw,
  Ban,
  UserPlus,
  Trash2,
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';


// Types
interface Payment {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeAvatar?: string;
  eventTitle: string;
  eventDate: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'mpesa' | 'card' | 'bank';
  transactionId: string;
  paymentDate: string;
  commission: number;
  netAmount: number;
  payoutStatus: 'pending' | 'processing' | 'paid';
  payoutDate?: string;
  invoiceNumber: string;
}

// Mock Data
const mockPayments: Payment[] = [
  {
    id: 'pay_1',
    attendeeName: 'Alice Mwangi',
    attendeeEmail: 'alice@example.com',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    amount: 2500,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-001',
    paymentDate: 'Aug 4, 2026',
    commission: 250,
    netAmount: 2250,
    payoutStatus: 'paid',
    payoutDate: 'Aug 12, 2026',
    invoiceNumber: 'INV-2026-001',
  },
  {
    id: 'pay_2',
    attendeeName: 'Brian Ochieng',
    attendeeEmail: 'brian@example.com',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    amount: 5000,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'card',
    transactionId: 'CARD-2026-002',
    paymentDate: 'Aug 3, 2026',
    commission: 500,
    netAmount: 4500,
    payoutStatus: 'paid',
    payoutDate: 'Aug 12, 2026',
    invoiceNumber: 'INV-2026-002',
  },
  {
    id: 'pay_3',
    attendeeName: 'Catherine Njeri',
    attendeeEmail: 'catherine@example.com',
    eventTitle: 'Mobile Test Automation with Appium & Robot Framework',
    eventDate: 'Aug 12, 2026',
    amount: 0,
    currency: 'KES',
    status: 'completed',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-003',
    paymentDate: 'Aug 10, 2026',
    commission: 0,
    netAmount: 0,
    payoutStatus: 'pending',
    invoiceNumber: 'INV-2026-003',
  },
  {
    id: 'pay_4',
    attendeeName: 'David Kiprop',
    attendeeEmail: 'david@example.com',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    amount: 2500,
    currency: 'KES',
    status: 'pending',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-004',
    paymentDate: 'Aug 4, 2026',
    commission: 250,
    netAmount: 2250,
    payoutStatus: 'pending',
    invoiceNumber: 'INV-2026-004',
  },
  {
    id: 'pay_5',
    attendeeName: 'Eunice Wanjiru',
    attendeeEmail: 'eunice@example.com',
    eventTitle: 'Fintech Security Compliance & M-Pesa API Integration',
    eventDate: 'Aug 20, 2026',
    amount: 1000,
    currency: 'KES',
    status: 'failed',
    paymentMethod: 'card',
    transactionId: 'CARD-2026-005',
    paymentDate: 'Aug 15, 2026',
    commission: 100,
    netAmount: 900,
    payoutStatus: 'pending',
    invoiceNumber: 'INV-2026-005',
  },
  {
    id: 'pay_6',
    attendeeName: 'Faith Akinyi',
    attendeeEmail: 'faith@example.com',
    eventTitle: 'Full-Stack Scaling Strategies with Next.js & Go',
    eventDate: 'Jul 28, 2026',
    amount: 0,
    currency: 'KES',
    status: 'refunded',
    paymentMethod: 'mpesa',
    transactionId: 'MPESA-2026-006',
    paymentDate: 'Jul 27, 2026',
    commission: 0,
    netAmount: 0,
    payoutStatus: 'pending',
    invoiceNumber: 'INV-2026-006',
  },
];

const statusConfig = {
  completed: { 
    label: 'Completed', 
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle2,
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: ClockIcon,
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

const paymentMethodConfig = {
  mpesa: { label: 'M-Pesa', color: 'bg-green-100 text-green-700' },
  card: { label: 'Card', color: 'bg-blue-100 text-blue-700' },
  bank: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-700' },
};

const payoutStatusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
};

export default function PaymentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      const matchesSearch = 
        payment.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
      const matchesMethod = selectedMethod === 'all' || payment.paymentMethod === selectedMethod;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [searchQuery, selectedStatus, selectedMethod]);

  // Stats
  const stats = useMemo(() => {
    const total = mockPayments.length;
    const totalRevenue = mockPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalCommission = mockPayments.reduce((acc, p) => acc + p.commission, 0);
    const totalNet = mockPayments.reduce((acc, p) => acc + p.netAmount, 0);
    const completed = mockPayments.filter(p => p.status === 'completed').length;
    const pending = mockPayments.filter(p => p.status === 'pending').length;
    const failed = mockPayments.filter(p => p.status === 'failed').length;
    return { total, totalRevenue, totalCommission, totalNet, completed, pending, failed };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectPayment = (id: string) => {
    setSelectedPayments(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const handleBulkExport = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedPayments([]);
    setSelectAll(false);
  };

  const handleBulkRefund = () => {
    setIsBulkActionDialogOpen(false);
    setSelectedPayments([]);
    setSelectAll(false);
  };

  const getSelectedCount = () => selectedPayments.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all payment transactions across your events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Payments
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(stats.totalCommission)}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Earnings</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalNet)}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard className="h-5 w-5" />
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
                placeholder="Search payments by attendee, event, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full cursor-text"
              />
            </div>

            {/* Status Filter */}
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

            {/* Payment Method Filter */}
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Methods</SelectItem>
                <SelectItem value="mpesa" className="cursor-pointer">M-Pesa</SelectItem>
                <SelectItem value="card" className="cursor-pointer">Card</SelectItem>
                <SelectItem value="bank" className="cursor-pointer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {getSelectedCount() > 0 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {getSelectedCount()} payment{getSelectedCount() > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                  variant="ghost" 
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedPayments([]);
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

      {/* Payments Table */}
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
                  <TableHead className="py-3 px-4">Amount</TableHead>
                  <TableHead className="py-3 px-4">Status</TableHead>
                  <TableHead className="py-3 px-4">Method</TableHead>
                  <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const status = statusConfig[payment.status];
                    const method = paymentMethodConfig[payment.paymentMethod];
                    const StatusIcon = status.icon;
                    const isSelected = selectedPayments.includes(payment.id);

                    return (
                      <TableRow 
                        key={payment.id}
                        className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleViewPayment(payment)}
                      >
                        <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectPayment(payment.id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={payment.attendeeAvatar} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(payment.attendeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {payment.attendeeName}
                              </p>
                              <p className="text-xs text-gray-500">{payment.attendeeEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.eventTitle}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{payment.eventDate}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500">Net: {formatCurrency(payment.netAmount)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant="outline" className={`${status.color} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant="outline" className={`${method.color} border`}>
                            {method.label}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{payment.transactionId}</p>
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
                                  handleViewPayment(payment);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Download receipt
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Send invoice
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePayment(payment);
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
                        <CreditCard className="h-8 w-8 text-gray-300" />
                        <p className="font-medium">No payments found</p>
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

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View and manage payment information.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {formatCurrency(selectedPayment.amount)}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedPayment.invoiceNumber}</p>
                </div>
                <Badge variant="outline" className={`${statusConfig[selectedPayment.status].color} border`}>
                  {statusConfig[selectedPayment.status].label}
                </Badge>
              </div>

              <Separator />

              {/* Payment Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Attendee</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedPayment.attendeeAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(selectedPayment.attendeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPayment.attendeeName}</p>
                      <p className="text-xs text-gray-500">{selectedPayment.attendeeEmail}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Event</Label>
                  <p className="font-medium mt-1">{selectedPayment.eventTitle}</p>
                  <p className="text-xs text-gray-500">{selectedPayment.eventDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payment Method</Label>
                  <Badge variant="outline" className={`${paymentMethodConfig[selectedPayment.paymentMethod].color} border mt-1`}>
                    {paymentMethodConfig[selectedPayment.paymentMethod].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Transaction ID</Label>
                  <p className="font-mono font-medium mt-1">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payment Date</Label>
                  <p className="font-medium mt-1">{selectedPayment.paymentDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Payout Status</Label>
                  <Badge variant="outline" className={`${payoutStatusConfig[selectedPayment.payoutStatus].color} border mt-1`}>
                    {payoutStatusConfig[selectedPayment.payoutStatus].label}
                  </Badge>
                </div>
                {selectedPayment.payoutDate && (
                  <div>
                    <Label className="text-xs text-gray-500">Payout Date</Label>
                    <p className="font-medium mt-1">{selectedPayment.payoutDate}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Commission (10%)</p>
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(selectedPayment.commission)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Net Earnings</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedPayment.netAmount)}</p>
                </div>
              </div>

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
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
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
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedPayment.attendeeName}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(selectedPayment.amount)}</p>
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
              Delete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'export' && 'Export Payments'}
              {bulkAction === 'refund' && 'Refund Payments'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'export' && (
                <>You are about to export <strong>{getSelectedCount()}</strong> payment{getSelectedCount() > 1 ? 's' : ''} to a CSV file.</>
              )}
              {bulkAction === 'refund' && (
                <>You are about to refund <strong>{getSelectedCount()}</strong> payment{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedPayments.map(id => {
                const payment = mockPayments.find(p => p.id === id);
                return payment ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(payment.attendeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{payment.attendeeName}</span>
                    <span className="text-gray-400">—</span>
                    <span className="text-gray-500 text-xs">{formatCurrency(payment.amount)}</span>
                  </div>
                ) : null;
              })}
            </ScrollArea>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className={`cursor-pointer ${
                bulkAction === 'refund' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={() => {
                if (bulkAction === 'export') handleBulkExport();
                else if (bulkAction === 'refund') handleBulkRefund();
              }}
            >
              {bulkAction === 'export' && <Download className="h-4 w-4 mr-2" />}
              {bulkAction === 'refund' && <Ban className="h-4 w-4 mr-2" />}
              {bulkAction === 'export' && 'Export All'}
              {bulkAction === 'refund' && 'Refund All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
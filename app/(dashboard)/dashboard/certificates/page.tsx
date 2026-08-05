'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Award,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Calendar,
  MoreVertical,
  Send,
  Printer,
  QrCode,
  Plus,
  AlertCircle,
  Check,
  ChevronDown,
  Mail,
  Users,
  Ban,
  RefreshCw,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// Types
interface Certificate {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeAvatar?: string;
  eventTitle: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'issued' | 'pending' | 'draft' | 'expired';
  type: 'cpd' | 'completion' | 'attendance';
  cpdHours?: number;
  verificationCode: string;
  verifiedCount: number;
  downloadCount: number;
  template: string;
  expiryDate?: string;
}

// Mock Data
const mockCertificates: Certificate[] = [
  {
    id: 'cert_1',
    attendeeName: 'Alice Mwangi',
    attendeeEmail: 'alice@example.com',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    issueDate: 'Aug 5, 2026',
    certificateNumber: 'NUR-2026-0001',
    status: 'issued',
    type: 'cpd',
    cpdHours: 4,
    verificationCode: 'ABC123XYZ',
    verifiedCount: 12,
    downloadCount: 8,
    template: 'Professional Blue',
  },
  {
    id: 'cert_2',
    attendeeName: 'Brian Ochieng',
    attendeeEmail: 'brian@example.com',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    issueDate: 'Aug 5, 2026',
    certificateNumber: 'NUR-2026-0002',
    status: 'issued',
    type: 'cpd',
    cpdHours: 4,
    verificationCode: 'DEF456UVW',
    verifiedCount: 5,
    downloadCount: 3,
    template: 'Professional Blue',
  },
  {
    id: 'cert_3',
    attendeeName: 'Catherine Njeri',
    attendeeEmail: 'catherine@example.com',
    eventTitle: 'Mobile Test Automation with Appium & Robot Framework',
    eventDate: 'Aug 12, 2026',
    issueDate: 'Aug 12, 2026',
    certificateNumber: 'NUR-2026-0003',
    status: 'pending',
    type: 'completion',
    cpdHours: 3,
    verificationCode: 'GHI789JKL',
    verifiedCount: 0,
    downloadCount: 0,
    template: 'Standard',
  },
  {
    id: 'cert_4',
    attendeeName: 'Faith Akinyi',
    attendeeEmail: 'faith@example.com',
    eventTitle: 'Full-Stack Scaling Strategies with Next.js & Go',
    eventDate: 'Jul 28, 2026',
    issueDate: 'Jul 28, 2026',
    certificateNumber: 'NUR-2026-0004',
    status: 'issued',
    type: 'attendance',
    cpdHours: 2,
    verificationCode: 'MNO012PQR',
    verifiedCount: 3,
    downloadCount: 2,
    template: 'Minimal',
  },
  {
    id: 'cert_5',
    attendeeName: 'David Kiprop',
    attendeeEmail: 'david@example.com',
    eventTitle: 'Advanced NestJS Microservices Architecture',
    eventDate: 'Aug 5, 2026',
    issueDate: 'Aug 5, 2026',
    certificateNumber: 'NUR-2026-0005',
    status: 'expired',
    type: 'cpd',
    cpdHours: 4,
    verificationCode: 'STU345VWX',
    verifiedCount: 2,
    downloadCount: 1,
    template: 'Professional Blue',
    expiryDate: 'Sep 5, 2026',
  },
  {
    id: 'cert_6',
    attendeeName: 'Grace Muthoni',
    attendeeEmail: 'grace@example.com',
    eventTitle: 'Fintech Security Compliance & M-Pesa API Integration',
    eventDate: 'Aug 20, 2026',
    issueDate: 'Aug 20, 2026',
    certificateNumber: 'NUR-2026-0006',
    status: 'draft',
    type: 'completion',
    cpdHours: 2,
    verificationCode: 'YZA678BCD',
    verifiedCount: 0,
    downloadCount: 0,
    template: 'Standard',
  },
];

const statusConfig = {
  issued: { 
    label: 'Issued', 
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle2,
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: Clock,
  },
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: FileText,
  },
  expired: { 
    label: 'Expired', 
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: AlertCircle,
  },
};

const typeConfig = {
  cpd: { label: 'CPD', color: 'bg-purple-100 text-purple-700' },
  completion: { label: 'Completion', color: 'bg-blue-100 text-blue-700' },
  attendance: { label: 'Attendance', color: 'bg-green-100 text-green-700' },
};

export default function CertificatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectAll, setSelectAll] = useState(false);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return mockCertificates.filter((cert) => {
      const matchesSearch = 
        cert.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
      const matchesType = selectedType === 'all' || cert.type === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, selectedStatus, selectedType]);

  // Stats
  const stats = useMemo(() => {
    const total = mockCertificates.length;
    const issued = mockCertificates.filter(c => c.status === 'issued').length;
    const pending = mockCertificates.filter(c => c.status === 'pending').length;
    const draft = mockCertificates.filter(c => c.status === 'draft').length;
    const totalVerified = mockCertificates.reduce((acc, c) => acc + c.verifiedCount, 0);
    const totalDownloads = mockCertificates.reduce((acc, c) => acc + c.downloadCount, 0);
    return { total, issued, pending, draft, totalVerified, totalDownloads };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsViewDialogOpen(true);
  };

  const handleDeleteCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsDeleteDialogOpen(true);
  };

  const handleSendCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsSendDialogOpen(true);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCertificates([]);
    } else {
      setSelectedCertificates(filteredCertificates.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCertificate = (id: string) => {
    setSelectedCertificates(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
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
    // Handle bulk send
    setIsBulkActionDialogOpen(false);
    setSelectedCertificates([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    // Handle bulk delete
    setIsBulkActionDialogOpen(false);
    setSelectedCertificates([]);
    setSelectAll(false);
  };

  const handleBulkDownload = () => {
    // Handle bulk download as ZIP
    setIsBulkActionDialogOpen(false);
    setSelectedCertificates([]);
    setSelectAll(false);
  };

  const getSelectedCount = () => selectedCertificates.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and verify professional development certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Certificate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.issued}</p>
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verifications</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalVerified}</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <QrCode className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalDownloads}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Download className="h-5 w-5" />
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
                placeholder="Search certificates..."
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
                <SelectItem value="issued" className="cursor-pointer">Issued</SelectItem>
                <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                <SelectItem value="expired" className="cursor-pointer">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[150px] cursor-pointer">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
                <SelectItem value="cpd" className="cursor-pointer">CPD</SelectItem>
                <SelectItem value="completion" className="cursor-pointer">Completion</SelectItem>
                <SelectItem value="attendance" className="cursor-pointer">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {getSelectedCount() > 0 && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {getSelectedCount()} certificate{getSelectedCount() > 1 ? 's' : ''} selected
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
                  Send
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => handleBulkAction('download')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
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
                    setSelectedCertificates([]);
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

      {/* Certificates Table */}
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
                  <TableHead className="py-3 px-4">Certificate</TableHead>
                  <TableHead className="py-3 px-4">Status</TableHead>
                  <TableHead className="py-3 px-4">Verification</TableHead>
                  <TableHead className="py-3 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.length > 0 ? (
                  filteredCertificates.map((cert) => {
                    const status = statusConfig[cert.status];
                    const type = typeConfig[cert.type];
                    const StatusIcon = status.icon;
                    const isSelected = selectedCertificates.includes(cert.id);

                    return (
                      <TableRow 
                        key={cert.id}
                        className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleViewCertificate(cert)}
                      >
                        <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectCertificate(cert.id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={cert.attendeeAvatar} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(cert.attendeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {cert.attendeeName}
                              </p>
                              <p className="text-xs text-gray-500">{cert.attendeeEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{cert.eventTitle}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{cert.eventDate}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div>
                            <Badge variant="outline" className={`${type.color} border`}>
                              {type.label}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">#{cert.certificateNumber}</p>
                            {cert.cpdHours && (
                              <p className="text-xs text-amber-600">{cert.cpdHours} CPD hrs</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge variant="outline" className={`${status.color} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm">
                              <QrCode className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-xs">{cert.verificationCode}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{cert.verifiedCount} verified</span>
                              <span>•</span>
                              <span>{cert.downloadCount} downloads</span>
                            </div>
                          </div>
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
                                  handleViewCertificate(cert);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Download certificate
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendCertificate(cert);
                                }}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send to Attendee
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Print certificate
                                }}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCertificate(cert);
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
                        <Award className="h-8 w-8 text-gray-300" />
                        <p className="font-medium">No certificates found</p>
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

      {/* View Certificate Dialog - KEPT INTACT */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              View and manage certificate information.
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-6">
              {/* Certificate Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <div className="text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h2 className="text-xl font-bold text-gray-900">Certificate of Completion</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    This certifies that <span className="font-semibold">{selectedCertificate.attendeeName}</span> has successfully completed
                  </p>
                  <h3 className="text-lg font-semibold text-primary mt-2">{selectedCertificate.eventTitle}</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Issued on {selectedCertificate.issueDate}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
                    <span>Certificate #{selectedCertificate.certificateNumber}</span>
                    {selectedCertificate.cpdHours && (
                      <>
                        <span>•</span>
                        <span>{selectedCertificate.cpdHours} CPD Hours</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <QrCode className="h-16 w-16 text-gray-400" />
                    <div className="text-left text-xs text-gray-500">
                      <p>Verification Code:</p>
                      <p className="font-mono font-semibold">{selectedCertificate.verificationCode}</p>
                      <p className="mt-1">Scan to verify authenticity</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Attendee</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedCertificate.attendeeAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(selectedCertificate.attendeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedCertificate.attendeeName}</p>
                      <p className="text-xs text-gray-500">{selectedCertificate.attendeeEmail}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Event</Label>
                  <p className="font-medium mt-1">{selectedCertificate.eventTitle}</p>
                  <p className="text-xs text-gray-500">{selectedCertificate.eventDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <Badge variant="outline" className={`${typeConfig[selectedCertificate.type].color} border mt-1`}>
                    {typeConfig[selectedCertificate.type].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge variant="outline" className={`${statusConfig[selectedCertificate.status].color} border mt-1`}>
                    {statusConfig[selectedCertificate.status].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Template</Label>
                  <p className="font-medium mt-1">{selectedCertificate.template}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Verification Code</Label>
                  <p className="font-mono font-medium mt-1">{selectedCertificate.verificationCode}</p>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedCertificate.verifiedCount}</p>
                  <p className="text-xs text-gray-500">Verifications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedCertificate.downloadCount}</p>
                  <p className="text-xs text-gray-500">Downloads</p>
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
                  Download PDF
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Attendee
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Certificate Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Certificate</DialogTitle>
            <DialogDescription>
              Send the certificate to the attendee via email.
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedCertificate.attendeeAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedCertificate.attendeeName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{selectedCertificate.attendeeName}</p>
                  <p className="text-sm text-gray-500">{selectedCertificate.attendeeEmail}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Email Subject</Label>
                <Input 
                  defaultValue={`Your Certificate for ${selectedCertificate.eventTitle}`}
                  className="mt-1 cursor-text"
                />
              </div>

              <div>
                <Label className="text-xs text-gray-500">Message (Optional)</Label>
                <textarea 
                  className="w-full min-h-[80px] p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-text"
                  placeholder="Add a personal message..."
                />
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsSendDialogOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                  onClick={() => setIsSendDialogOpen(false)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Certificate
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
              {bulkAction === 'send' && 'Send Certificates'}
              {bulkAction === 'download' && 'Download Certificates'}
              {bulkAction === 'delete' && 'Delete Certificates'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'send' && (
                <>You are about to send <strong>{getSelectedCount()}</strong> certificate{getSelectedCount() > 1 ? 's' : ''} to the selected attendees.</>
              )}
              {bulkAction === 'download' && (
                <>You are about to download <strong>{getSelectedCount()}</strong> certificate{getSelectedCount() > 1 ? 's' : ''} as a ZIP file.</>
              )}
              {bulkAction === 'delete' && (
                <>You are about to delete <strong>{getSelectedCount()}</strong> certificate{getSelectedCount() > 1 ? 's' : ''}. This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-32 border rounded-lg p-2">
              {selectedCertificates.map(id => {
                const cert = mockCertificates.find(c => c.id === id);
                return cert ? (
                  <div key={id} className="flex items-center gap-2 py-1 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(cert.attendeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{cert.attendeeName}</span>
                    <span className="text-gray-400">—</span>
                    <span className="text-gray-500 text-xs">{cert.certificateNumber}</span>
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
                else if (bulkAction === 'download') handleBulkDownload();
                else if (bulkAction === 'delete') handleBulkDelete();
              }}
            >
              {bulkAction === 'send' && <Send className="h-4 w-4 mr-2" />}
              {bulkAction === 'download' && <Download className="h-4 w-4 mr-2" />}
              {bulkAction === 'delete' && <Trash2 className="h-4 w-4 mr-2" />}
              {bulkAction === 'send' && 'Send All'}
              {bulkAction === 'download' && 'Download All'}
              {bulkAction === 'delete' && 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCertificate.attendeeName}</p>
                  <p className="text-sm text-gray-500">{selectedCertificate.certificateNumber}</p>
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
              Delete Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Download,
  Send,
  Printer,
  QrCode,
  User,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  RefreshCw,
  Mail,
  Palette,
  Layout,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  X,
  Save,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// ============= TYPES =============
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: Attendee[];
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'registered' | 'checked-in' | 'attended';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'free';
}

interface CertificateData {
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate?: string;
  type: 'cpd' | 'completion' | 'attendance';
  cpdHours: number;
  customMessage: string;
  template: 'professional-blue' | 'professional-gold' | 'minimal' | 'modern' | 'classic';
  primaryColor: string;
  fontFamily: string;
  includeQrCode: boolean;
  includeVerificationCode: boolean;
  includeOrganizer: boolean;
  organizerName: string;
}

// ============= MOCK DATA =============
const mockEvents: Event[] = [
  {
    id: 'evt_1',
    title: 'Advanced NestJS Microservices Architecture',
    date: 'Aug 5, 2026',
    location: 'Virtual (Zoom)',
    attendees: [
      { id: 'att_1', name: 'Alice Mwangi', email: 'alice@example.com', phone: '+254 712 345 678', status: 'attended', paymentStatus: 'paid' },
      { id: 'att_2', name: 'Brian Ochieng', email: 'brian@example.com', phone: '+254 723 456 789', status: 'attended', paymentStatus: 'paid' },
      { id: 'att_3', name: 'David Kiprop', email: 'david@example.com', phone: '+254 745 678 901', status: 'registered', paymentStatus: 'pending' },
      { id: 'att_4', name: 'Sarah Wanjiru', email: 'sarah@example.com', phone: '+254 756 789 012', status: 'checked-in', paymentStatus: 'paid' },
      { id: 'att_5', name: 'Michael Ochieng', email: 'michael@example.com', phone: '+254 767 890 123', status: 'registered', paymentStatus: 'free' },
      { id: 'att_6', name: 'Grace Muthoni', email: 'grace@example.com', phone: '+254 778 901 234', status: 'attended', paymentStatus: 'paid' },
      { id: 'att_7', name: 'Peter Kariuki', email: 'peter@example.com', phone: '+254 789 012 345', status: 'checked-in', paymentStatus: 'failed' },
    ]
  },
  {
    id: 'evt_2',
    title: 'Mobile Test Automation with Appium & Robot Framework',
    date: 'Aug 12, 2026',
    location: 'Virtual (Google Meet)',
    attendees: [
      { id: 'att_8', name: 'Catherine Njeri', email: 'catherine@example.com', phone: '+254 734 567 890', status: 'checked-in', paymentStatus: 'paid' },
      { id: 'att_9', name: 'Ian Kariuki', email: 'ian@example.com', phone: '+254 790 123 456', status: 'registered', paymentStatus: 'free' },
    ]
  },
  {
    id: 'evt_3',
    title: 'Fintech Security Compliance & M-Pesa API Integration',
    date: 'Aug 20, 2026',
    location: 'Virtual (Zoom)',
    attendees: [
      { id: 'att_10', name: 'Eunice Wanjiru', email: 'eunice@example.com', phone: '+254 756 789 012', status: 'attended', paymentStatus: 'paid' },
    ]
  },
];

const templateOptions = [
  { value: 'professional-blue', label: 'Professional Blue', class: 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100' },
  { value: 'professional-gold', label: 'Professional Gold', class: 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100' },
  { value: 'minimal', label: 'Minimal', class: 'border-gray-200 bg-white' },
  { value: 'modern', label: 'Modern', class: 'border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100' },
  { value: 'classic', label: 'Classic', class: 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100' },
];

const fontOptions = ['Inter', 'Arial', 'Helvetica', 'Georgia', 'Roboto'];
const statusOptions = ['all', 'registered', 'checked-in', 'attended'];
const paymentStatusOptions = ['all', 'paid', 'pending', 'failed', 'free'];

type SortField = 'name' | 'status';

// ============= CERTIFICATE PREVIEW =============
const CertificatePreview = ({ data }: { data: CertificateData }) => {
  const templateClass = templateOptions.find(t => t.value === data.template)?.class || templateOptions[0].class;

  return (
    <div className="certificate-content">
      <div className={cn("border-4 rounded-2xl p-8 relative overflow-hidden", templateClass)}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full" />

        <div className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary">NuruVent</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Certificate of {data.type === 'cpd' ? 'CPD' : data.type === 'completion' ? 'Completion' : 'Attendance'}
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto mt-2 rounded-full" />
          </div>

          <div className="space-y-3 py-4">
            <p className="text-gray-600 text-lg">This certifies that</p>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: data.primaryColor }}>{data.attendeeName || 'John Doe'}</h2>
            <p className="text-gray-600">has successfully completed</p>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{data.eventTitle || 'Event Name'}</h3>
            <p className="text-gray-500">on <span className="font-medium">{data.eventDate || 'Event Date'}</span></p>

            {data.type === 'cpd' && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-sm px-4 py-1.5">
                {data.cpdHours} CPD Hours
              </Badge>
            )}

            {data.customMessage && (
              <p className="text-gray-500 text-sm italic max-w-md mx-auto">{data.customMessage}</p>
            )}

            {data.includeOrganizer && (
              <p className="text-sm text-gray-400">Organized by {data.organizerName}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200/50">
            <div className="text-left">
              <p className="text-xs text-gray-500">Certificate Number</p>
              <p className="text-sm font-mono font-semibold">{data.certificateNumber}</p>
            </div>

            {data.includeQrCode && (
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <QrCode className="h-8 w-8 text-gray-400" />
                </div>
                {data.includeVerificationCode && (
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Verification Code</p>
                    <p className="text-xs font-mono font-semibold">ABC123XYZ</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-right">
              <p className="text-xs text-gray-500">Issue Date</p>
              <p className="text-sm font-medium">{data.issueDate || 'Issue Date'}</p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-300 mx-auto" />
              <p className="text-xs text-gray-400 mt-1">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= STEPPER =============
const Stepper = ({ currentStep, steps }: { currentStep: number; steps: string[] }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isActive && "bg-primary text-white ring-4 ring-primary/20",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  isActive && "text-gray-900",
                  isCompleted && "text-gray-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-gray-200">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isCompleted ? "w-full bg-green-500" : "w-0 bg-primary"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============= PRINT COMPONENT =============
const PrintCertificate = ({ data }: { data: CertificateData }) => {
  return (
    <div className="print-container" style={{ padding: '40px', background: 'white' }}>
      <CertificatePreview data={data} />
    </div>
  );
};

// ============= MAIN PAGE =============
export default function CreateCertificatePage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Step state
  const STEPS = ['Event & Attendee', 'Certificate Details', 'Design'];
  const [currentStep, setCurrentStep] = useState(1);
  
  // Selection state
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>([]);
  
  // Search, filter, sort, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Dialog states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Default values
  const [defaultCertNumber, setDefaultCertNumber] = useState('');
  const [defaultIssueDate, setDefaultIssueDate] = useState('');

  useEffect(() => {
    setDefaultCertNumber(`NUR-${Date.now().toString().slice(-6)}`);
    setDefaultIssueDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Certificate data
  const [data, setData] = useState<CertificateData>({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    eventTitle: '',
    eventDate: '',
    eventLocation: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    type: 'cpd',
    cpdHours: 4,
    customMessage: '',
    template: 'professional-blue',
    primaryColor: '#1a56db',
    fontFamily: 'Inter',
    includeQrCode: true,
    includeVerificationCode: true,
    includeOrganizer: true,
    organizerName: 'NuruVent Academy',
  });

  // Update default values
  useEffect(() => {
    if (defaultCertNumber && defaultIssueDate) {
      setData(prev => ({
        ...prev,
        certificateNumber: defaultCertNumber,
        issueDate: defaultIssueDate,
      }));
    }
  }, [defaultCertNumber, defaultIssueDate]);

  // Get current event and attendees
  const selectedEvent = mockEvents.find(e => e.id === selectedEventId);
  const availableAttendees = selectedEvent?.attendees || [];

  // Filter and sort attendees
  const filteredAttendees = useMemo(() => {
    const filtered = availableAttendees.filter(attendee => {
      const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.phone.includes(searchQuery);
      const matchesStatus = selectedStatus === 'all' || attendee.status === selectedStatus;
      const matchesPayment = selectedPaymentStatus === 'all' || attendee.paymentStatus === selectedPaymentStatus;
      return matchesSearch && matchesStatus && matchesPayment;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
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
  }, [availableAttendees, searchQuery, selectedStatus, selectedPaymentStatus, sortField, sortDirection]);

  // Paginate
  const paginatedAttendees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAttendees.slice(startIndex, endIndex);
  }, [filteredAttendees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);

  const selectedAttendees = availableAttendees.filter(a => selectedAttendeeIds.includes(a.id));

  // Step validation
  const canProceedToStep2 = selectedEventId && selectedAttendeeIds.length > 0;
  const canProceedToStep3 = canProceedToStep2 && data.certificateNumber && data.issueDate;

  // Handlers
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedAttendeeIds([]);
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setCurrentPage(1);
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      setData(prev => ({
        ...prev,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
      }));
    }
  };

  const handleAttendeeSelect = (attendeeId: string) => {
    setSelectedAttendeeIds(prev => {
      const isSelected = prev.includes(attendeeId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId];

      if (newSelection.length === 1) {
        const attendee = availableAttendees.find(a => a.id === newSelection[0]);
        if (attendee) {
          setData(prevData => ({
            ...prevData,
            attendeeName: attendee.name,
            attendeeEmail: attendee.email,
            attendeePhone: attendee.phone,
          }));
        }
      } else if (newSelection.length === 0) {
        setData(prev => ({
          ...prev,
          attendeeName: '',
          attendeeEmail: '',
          attendeePhone: '',
        }));
      }

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedAttendeeIds.length === paginatedAttendees.length) {
      setSelectedAttendeeIds([]);
      setData(prev => ({
        ...prev,
        attendeeName: '',
        attendeeEmail: '',
        attendeePhone: '',
      }));
    } else {
      setSelectedAttendeeIds(paginatedAttendees.map(a => a.id));
      if (paginatedAttendees.length > 0) {
        const first = paginatedAttendees[0];
        setData(prev => ({
          ...prev,
          attendeeName: first.name,
          attendeeEmail: first.email,
          attendeePhone: first.phone,
        }));
      }
    }
  };

  const handleChange = (field: keyof CertificateData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => setIsPreviewOpen(true);
  const handleClosePreview = () => setIsPreviewOpen(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsPreviewOpen(false);
      setIsSuccessOpen(true);
    }, 1500);
  };

  // Fix: Proper print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              padding: 40px;
            }
            .certificate-wrapper {
              max-width: 900px;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="certificate-wrapper">
            ${document.querySelector('.certificate-content')?.outerHTML || ''}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          <\/script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Fix: Proper download function
  const handleDownload = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              padding: 40px;
            }
            .certificate-wrapper {
              max-width: 900px;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="certificate-wrapper">
            ${document.querySelector('.certificate-content')?.outerHTML || ''}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          <\/script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStatus !== 'all') count++;
    if (selectedPaymentStatus !== 'all') count++;
    return count;
  };

  // Get sort label
  const getSortLabel = () => {
    const labels = {
      name: 'Name',
      status: 'Status'
    };
    return labels[sortField];
  };

  // Reset filters
  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setSortField('name');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleMobileApply = () => {
    setIsFilterSheetOpen(false);
  };

  const handleMobileReset = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setSortField('name');
    setSortDirection('asc');
    setCurrentPage(1);
    setIsFilterSheetOpen(false);
  };

  // Payment status badge
  const getPaymentBadge = (status: string) => {
    const config = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
      free: { label: 'Free', className: 'bg-blue-100 text-blue-700' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Event Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Select Event</Label>
              <Select value={selectedEventId} onValueChange={handleEventSelect}>
                <SelectTrigger className="mt-1.5 cursor-pointer">
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {mockEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id} className="cursor-pointer">
                      <div>
                        <p>{event.title}</p>
                        <p className="text-xs text-gray-400">{event.date} • {event.attendees.length} attendees</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attendee Selection */}
            {selectedEventId && (
              <>
                <Separator />
                <div>
                  {/* Search, Filter, Sort - Desktop */}
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search attendees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 cursor-text"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full md:w-[130px] cursor-pointer">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                          <SelectItem value="registered" className="cursor-pointer">Registered</SelectItem>
                          <SelectItem value="checked-in" className="cursor-pointer">Checked In</SelectItem>
                          <SelectItem value="attended" className="cursor-pointer">Attended</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                        <SelectTrigger className="w-full md:w-[130px] cursor-pointer">
                          <SelectValue placeholder="All Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="cursor-pointer">All Payment</SelectItem>
                          <SelectItem value="paid" className="cursor-pointer">Paid</SelectItem>
                          <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                          <SelectItem value="failed" className="cursor-pointer">Failed</SelectItem>
                          <SelectItem value="free" className="cursor-pointer">Free</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="ghost" size="sm" className="h-9 cursor-pointer" onClick={handleReset}>
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Attendee List with Pagination */}
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">Select Attendees</Label>
                    <div className="flex items-center gap-2">
                      {paginatedAttendees.length > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs cursor-pointer" onClick={handleSelectAll}>
                          {selectedAttendeeIds.length === paginatedAttendees.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}
                      <Badge variant="secondary">{selectedAttendeeIds.length} selected</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {paginatedAttendees.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">
                        {selectedEventId ? 'No attendees found matching your criteria.' : 'Select an event to view attendees.'}
                      </p>
                    ) : (
                      paginatedAttendees.map((attendee) => {
                        const paymentBadge = getPaymentBadge(attendee.paymentStatus);
                        return (
                          <div
                            key={attendee.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                              selectedAttendeeIds.includes(attendee.id)
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:bg-gray-50"
                            )}
                            onClick={() => handleAttendeeSelect(attendee.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(attendee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{attendee.name}</p>
                                <p className="text-xs text-gray-500">{attendee.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs capitalize">{attendee.status}</Badge>
                              <Badge className={`text-xs ${paymentBadge.className}`}>
                                {paymentBadge.label}
                              </Badge>
                              {selectedAttendeeIds.includes(attendee.id) && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  {filteredAttendees.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rows per page:</span>
                        <Select
                          value={String(itemsPerPage)}
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="h-7 w-[70px] cursor-pointer">
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
                        <span className="text-xs text-gray-500">
                          {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAttendees.length)} of {filteredAttendees.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeftIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRightIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Certificate Type</Label>
              <Select value={data.type} onValueChange={(value: any) => handleChange('type', value)}>
                <SelectTrigger className="mt-1 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpd" className="cursor-pointer">CPD Certificate</SelectItem>
                  <SelectItem value="completion" className="cursor-pointer">Completion</SelectItem>
                  <SelectItem value="attendance" className="cursor-pointer">Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.type === 'cpd' && (
              <div>
                <Label className="text-xs text-gray-500">CPD Hours</Label>
                <Input
                  type="number"
                  value={data.cpdHours}
                  onChange={(e) => handleChange('cpdHours', Number(e.target.value))}
                  className="mt-1 cursor-text"
                  min="0"
                  step="0.5"
                />
              </div>
            )}

            <div>
              <Label className="text-xs text-gray-500">Certificate Number</Label>
              <Input
                value={data.certificateNumber}
                onChange={(e) => handleChange('certificateNumber', e.target.value)}
                className="mt-1 cursor-text"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Issue Date</Label>
              <Input
                type="date"
                value={data.issueDate}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                className="mt-1 cursor-text"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={data.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                className="mt-1 cursor-text"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs text-gray-500">Custom Message (Optional)</Label>
              <Textarea
                value={data.customMessage}
                onChange={(e) => handleChange('customMessage', e.target.value)}
                className="mt-1 cursor-text"
                placeholder="Add a personalized message..."
                rows={2}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Template</Label>
              <Select value={data.template} onValueChange={(value: any) => handleChange('template', value)}>
                <SelectTrigger className="mt-1 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Font</Label>
              <Select value={data.fontFamily} onValueChange={(value) => handleChange('fontFamily', value)}>
                <SelectTrigger className="mt-1 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font} className="cursor-pointer" style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <Input
                  value={data.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 cursor-text"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-gray-500">QR Code</Label>
                <p className="text-[10px] text-gray-400">Include verification QR code</p>
              </div>
              <Switch
                checked={data.includeQrCode}
                onCheckedChange={(checked) => handleChange('includeQrCode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-gray-500">Verification Code</Label>
                <p className="text-[10px] text-gray-400">Show verification code</p>
              </div>
              <Switch
                checked={data.includeVerificationCode}
                onCheckedChange={(checked) => handleChange('includeVerificationCode', checked)}
              />
            </div>

            <div className="flex items-center justify-between md:col-span-2">
              <div>
                <Label className="text-xs text-gray-500">Organizer Name</Label>
                <p className="text-[10px] text-gray-400">Display organizer on certificate</p>
              </div>
              <Switch
                checked={data.includeOrganizer}
                onCheckedChange={(checked) => handleChange('includeOrganizer', checked)}
              />
            </div>

            {data.includeOrganizer && (
              <div className="md:col-span-2">
                <Label className="text-xs text-gray-500">Organizer Name</Label>
                <Input
                  value={data.organizerName}
                  onChange={(e) => handleChange('organizerName', e.target.value)}
                  className="mt-1 cursor-text"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Certificate</h1>
            <p className="text-sm text-gray-500">Generate a professional certificate for your attendees.</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer" onClick={handleGenerate}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Stepper */}
      <div className="py-4">
        <Stepper currentStep={currentStep} steps={STEPS} />
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Select Event & Attendees'}
            {currentStep === 2 && 'Certificate Details'}
            {currentStep === 3 && 'Design Settings'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Choose an event and select attendees to receive the certificate.'}
            {currentStep === 2 && 'Enter the certificate details and customize the content.'}
            {currentStep === 3 && 'Choose a template and customize the design.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:relative md:border-t-0 md:p-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3)
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={handleGenerate}
            >
              <Save className="h-4 w-4 mr-2" />
              Generate Certificate
            </Button>
          )}
        </div>
      </div>

      {/* Preview Dialog - Responsive */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg sm:text-2xl">Certificate Preview</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Review the certificate before generating. Design changes are reflected in real-time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Certificate Preview */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-6 overflow-x-auto">
              <div className="min-w-[280px]">
                <CertificatePreview data={data} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="cursor-pointer text-xs sm:text-sm"
                onClick={handleDownload}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Download PDF
              </Button>

              <Button
                variant="outline"
                className="cursor-pointer text-xs sm:text-sm"
                onClick={handlePrint}
              >
                <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Print
              </Button>

              <Button
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer text-xs sm:text-sm"
                onClick={handleSend}
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Send to {selectedAttendees.length === 1 ? 'Attendee' : `${selectedAttendees.length} Attendees`}
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClosePreview}
              className="cursor-pointer w-full sm:w-auto text-xs sm:text-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Certificate Generated!</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">Successfully Created</p>
              <p className="text-sm text-gray-500">The certificate has been generated and saved.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                className="cursor-pointer w-full sm:w-auto"
                onClick={() => {
                  setIsSuccessOpen(false);
                  router.push('/dashboard/certificates');
                }}
              >
                View All Certificates
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer w-full sm:w-auto"
                onClick={() => {
                  setIsSuccessOpen(false);
                  setCurrentStep(1);
                  setSelectedEventId('');
                  setSelectedAttendeeIds([]);
                  setData(prev => ({
                    ...prev,
                    attendeeName: '',
                    attendeeEmail: '',
                    attendeePhone: '',
                    eventTitle: '',
                    eventDate: '',
                    eventLocation: '',
                    customMessage: '',
                  }));
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
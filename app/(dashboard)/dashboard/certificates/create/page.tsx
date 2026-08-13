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
  Sparkles,
  Type,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Maximize2,
  Minimize2,
  ChevronDown,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
  template: 'professional-blue' | 'professional-gold' | 'minimal' | 'modern' | 'classic' | 'elegant' | 'corporate';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  textAlign: 'left' | 'center' | 'right';
  includeQrCode: boolean;
  includeVerificationCode: boolean;
  includeOrganizer: boolean;
  includeLogo: boolean;
  includeBorder: boolean;
  borderStyle: 'solid' | 'double' | 'dashed' | 'none';
  borderWidth: number;
  borderRadius: number;
  organizerName: string;
  logoUrl?: string;
  signatureName?: string;
  signatureTitle?: string;
  backgroundPattern: 'none' | 'dots' | 'lines' | 'grid' | 'circles';
}

interface EmailStatus {
  attendeeId: string;
  name: string;
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
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
  { value: 'elegant', label: 'Elegant', class: 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100' },
  { value: 'corporate', label: 'Corporate', class: 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100' },
];

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Montserrat', label: 'Montserrat' },
];

const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const textAlignOptions = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Center', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight },
];

const borderStyleOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'double', label: 'Double' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'none', label: 'None' },
];

const backgroundPatternOptions = [
  { value: 'none', label: 'None' },
  { value: 'dots', label: 'Dots' },
  { value: 'lines', label: 'Lines' },
  { value: 'grid', label: 'Grid' },
  { value: 'circles', label: 'Circles' },
];

const statusOptions = ['all', 'registered', 'checked-in', 'attended'];
const paymentStatusOptions = ['all', 'paid', 'pending', 'failed', 'free'];

type SortField = 'name' | 'status';

// ============= CERTIFICATE PREVIEW =============
const CertificatePreview = ({ data }: { data: CertificateData }) => {
  const templateClass = templateOptions.find(t => t.value === data.template)?.class || templateOptions[0].class;

  const getFontSize = () => {
    switch (data.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getTextAlign = () => {
    switch (data.textAlign) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  const getBorderStyle = () => {
    switch (data.borderStyle) {
      case 'double': return 'border-4 border-double';
      case 'dashed': return 'border-2 border-dashed';
      case 'none': return 'border-0';
      default: return 'border-2';
    }
  };

  const getBackgroundPattern = () => {
    switch (data.backgroundPattern) {
      case 'dots':
        return 'bg-[radial-gradient(circle_at_center,_var(--pattern-color)_1px,_transparent_1px)] bg-[length:20px_20px]';
      case 'lines':
        return 'bg-[repeating-linear-gradient(0deg,_var(--pattern-color)_0px,_var(--pattern-color)_1px,_transparent_1px,_transparent_20px)]';
      case 'grid':
        return 'bg-[repeating-linear-gradient(0deg,_var(--pattern-color)_0px,_var(--pattern-color)_1px,_transparent_1px,_transparent_20px),repeating-linear-gradient(90deg,_var(--pattern-color)_0px,_var(--pattern-color)_1px,_transparent_1px,_transparent_20px)]';
      case 'circles':
        return 'bg-[radial-gradient(circle_at_center,_var(--pattern-color)_8px,_transparent_8px)] bg-[length:40px_40px]';
      default:
        return '';
    }
  };

  return (
    <div className="certificate-content">
      <div 
        className={cn(
          "rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all",
          templateClass,
          getBorderStyle(),
          getTextAlign(),
          data.includeBorder && `border-[${data.borderWidth}px]`,
          `rounded-[${data.borderRadius}px]`
        )}
        style={{
          backgroundColor: data.backgroundPattern !== 'none' ? 'white' : undefined,
          '--pattern-color': `${data.primaryColor}20`,
          borderColor: data.primaryColor,
        } as React.CSSProperties}
      >
        <div 
          className={cn(
            "absolute inset-0 opacity-5",
            getBackgroundPattern()
          )}
          style={{
            '--pattern-color': data.primaryColor,
          } as React.CSSProperties}
        />
        
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full" />

        <div className="relative z-10 space-y-3 sm:space-y-4" style={{ fontFamily: data.fontFamily }}>
          <div className="flex items-center justify-center gap-2">
            {data.includeLogo && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: data.primaryColor }} />
              </div>
            )}
            <span className="text-xs sm:text-sm font-semibold" style={{ color: data.primaryColor }}>NuruVent</span>
          </div>

          <div>
            <h1 className={cn("font-bold text-gray-900", getFontSize())}>
              Certificate of {data.type === 'cpd' ? 'CPD' : data.type === 'completion' ? 'Completion' : 'Attendance'}
            </h1>
            <div className="w-16 sm:w-24 h-0.5 sm:h-1 mx-auto mt-1.5 sm:mt-2 rounded-full" style={{ backgroundColor: data.primaryColor }} />
          </div>

          <div className="space-y-2 sm:space-y-3 py-2 sm:py-4">
            <p className={cn("text-gray-600", getFontSize())}>This certifies that</p>
            <h2 
              className={cn("font-bold", getFontSize())}
              style={{ color: data.primaryColor }}
            >
              {data.attendeeName || 'John Doe'}
            </h2>
            <p className={cn("text-gray-600", getFontSize())}>has successfully completed</p>
            <h3 className={cn("font-semibold text-gray-800", getFontSize())}>
              {data.eventTitle || 'Event Name'}
            </h3>
            <p className={cn("text-gray-500", getFontSize())}>
              on <span className="font-medium">{data.eventDate || 'Event Date'}</span>
            </p>

            {data.type === 'cpd' && (
              <Badge 
                className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5"
                style={{ backgroundColor: data.primaryColor + '20', color: data.primaryColor, borderColor: data.primaryColor + '40' }}
              >
                {data.cpdHours} CPD Hours
              </Badge>
            )}

            {data.customMessage && (
              <p className={cn("text-gray-500 italic max-w-md mx-auto", getFontSize())}>
                {data.customMessage}
              </p>
            )}

            {data.includeOrganizer && (
              <p className="text-xs sm:text-sm text-gray-400">Organized by {data.organizerName}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200/50">
            <div className="text-left">
              <p className="text-[10px] sm:text-xs text-gray-500">Certificate Number</p>
              <p className="text-xs sm:text-sm font-mono font-semibold">{data.certificateNumber}</p>
            </div>

            {data.includeQrCode && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                {data.includeVerificationCode && (
                  <div className="text-left">
                    <p className="text-[10px] sm:text-xs text-gray-500">Verification Code</p>
                    <p className="text-[10px] sm:text-xs font-mono font-semibold">ABC123XYZ</p>
                  </div>
                )}
              </div>
            )}

            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-gray-500">Issue Date</p>
              <p className="text-xs sm:text-sm font-medium">{data.issueDate || 'Issue Date'}</p>
            </div>
          </div>

          {data.signatureName && (
            <div className="flex justify-center pt-2 sm:pt-4">
              <div className="text-center">
                <div className="w-20 sm:w-32 h-0.5 bg-gray-300 mx-auto" />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{data.signatureName}</p>
                {data.signatureTitle && (
                  <p className="text-[10px] sm:text-xs text-gray-400">{data.signatureTitle}</p>
                )}
              </div>
            </div>
          )}
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
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                  isActive && "bg-primary text-white ring-4 ring-primary/20",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500 hover:bg-gray-300"
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
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  
  // Search, filter, sort, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Dialog states
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerationCanceled, setIsGenerationCanceled] = useState(false);
  const [showSendEmailPrompt, setShowSendEmailPrompt] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [emailSendProgress, setEmailSendProgress] = useState(0);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  // Certificate data with enhanced options
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
    secondaryColor: '#6b7280',
    fontFamily: 'Inter',
    fontSize: 'medium',
    textAlign: 'center',
    includeQrCode: true,
    includeVerificationCode: true,
    includeOrganizer: true,
    includeLogo: true,
    includeBorder: true,
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 16,
    organizerName: 'NuruVent Academy',
    logoUrl: '',
    signatureName: '',
    signatureTitle: '',
    backgroundPattern: 'none',
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
  const selectedAttendees = availableAttendees.filter(a => selectedAttendeeIds.includes(a.id));

  // Reset preview index when selection changes
  useEffect(() => {
    setCurrentPreviewIndex(0);
  }, [selectedAttendeeIds]);

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
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [availableAttendees, searchQuery, selectedStatus, selectedPaymentStatus, sortField, sortDirection]);

  // Paginate
  const paginatedAttendees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAttendees.slice(startIndex, endIndex);
  }, [filteredAttendees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);

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

      // Update data for the first selected attendee
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
  // Get IDs of attendees on the current page
  const currentPageIds = paginatedAttendees.map(a => a.id);
  
  // Check if all attendees on the current page are selected
  const allSelectedOnCurrentPage = currentPageIds.every(id => selectedAttendeeIds.includes(id));
  
  if (allSelectedOnCurrentPage) {
    // Deselect all attendees on the current page only
    setSelectedAttendeeIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    
    // If we're deselecting all, clear the preview data
    const remainingSelected = selectedAttendeeIds.filter(id => !currentPageIds.includes(id));
    if (remainingSelected.length === 0) {
      setData(prev => ({
        ...prev,
        attendeeName: '',
        attendeeEmail: '',
        attendeePhone: '',
      }));
    } else {
      // Update preview to the first remaining selected attendee
      const firstRemaining = availableAttendees.find(a => remainingSelected.includes(a.id));
      if (firstRemaining) {
        setData(prev => ({
          ...prev,
          attendeeName: firstRemaining.name,
          attendeeEmail: firstRemaining.email,
          attendeePhone: firstRemaining.phone,
        }));
      }
    }
  } else {
    // Select all attendees on the current page (add to existing selections)
    const newIds = [...selectedAttendeeIds];
    currentPageIds.forEach(id => {
      if (!newIds.includes(id)) {
        newIds.push(id);
      }
    });
    setSelectedAttendeeIds(newIds);
    
    // Update preview with the first attendee on the current page if available
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

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setIsGenerationCanceled(false);
    
    // Simulate generation with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsGenerating(false);
        // Show send email prompt
        setShowSendEmailPrompt(true);
      }
      setGenerationProgress(Math.min(progress, 100));
    }, 300);
  };

  const handleCancelGeneration = () => {
    setIsGenerationCanceled(true);
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const handleSendEmails = () => {
    setIsSendingEmails(true);
    setEmailSendProgress(0);
    
    // Initialize email statuses
    const initialStatuses = selectedAttendees.map(attendee => ({
      attendeeId: attendee.id,
      name: attendee.name,
      email: attendee.email,
      status: 'pending' as const,
    }));
    setEmailStatuses(initialStatuses);
    
    // Simulate sending emails one by one
    let sentCount = 0;
    const total = selectedAttendees.length;
    
    const sendInterval = setInterval(() => {
      if (sentCount < total) {
        setEmailStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[sentCount] = {
            ...newStatuses[sentCount],
            status: 'sending',
          };
          return newStatuses;
        });
        
        setTimeout(() => {
          setEmailStatuses(prev => {
            const newStatuses = [...prev];
            // Simulate random failure for demo (5% chance)
            const failed = Math.random() < 0.05;
            newStatuses[sentCount] = {
              ...newStatuses[sentCount],
              status: failed ? 'failed' : 'sent',
              error: failed ? 'Failed to send' : undefined,
            };
            return newStatuses;
          });
          
          sentCount++;
          setEmailSendProgress((sentCount / total) * 100);
          
          if (sentCount === total) {
            clearInterval(sendInterval);
            setTimeout(() => {
              setIsSendingEmails(false);
              setIsSuccessOpen(true);
              setShowSendEmailPrompt(false);
            }, 500);
          }
        }, 500);
      }
    }, 300);
  };

  const handleSkipEmails = () => {
    setShowSendEmailPrompt(false);
    setIsSuccessOpen(true);
  };

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
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStatus !== 'all') count++;
    if (selectedPaymentStatus !== 'all') count++;
    return count;
  };

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

  const getPaymentBadge = (status: string) => {
    const config = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
      free: { label: 'Free', className: 'bg-blue-100 text-blue-700' },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const handlePreviousAttendee = () => {
    setCurrentPreviewIndex(prev => 
      prev > 0 ? prev - 1 : selectedAttendees.length - 1
    );
  };

  const handleNextAttendee = () => {
    setCurrentPreviewIndex(prev => 
      prev < selectedAttendees.length - 1 ? prev + 1 : 0
    );
  };

  // Get current attendee for preview
  const getCurrentAttendeeForPreview = () => {
    if (selectedAttendees.length === 0) return null;
    return selectedAttendees[currentPreviewIndex] || selectedAttendees[0];
  };

  // Generate certificate data for a specific attendee
  const getCertificateDataForAttendee = (attendee: Attendee): CertificateData => {
    return {
      ...data,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      attendeePhone: attendee.phone,
    };
  };

  const currentAttendee = getCurrentAttendeeForPreview();
  const previewData = currentAttendee ? getCertificateDataForAttendee(currentAttendee) : data;

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

                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">Select Attendees</Label>
                    <div className="flex items-center gap-2">
                      {paginatedAttendees.length > 0 && (
                       <Button variant="ghost" size="sm" className="text-xs cursor-pointer" onClick={handleSelectAll}>
                          {paginatedAttendees.every(a => selectedAttendeeIds.includes(a.id)) ? 'Deselect All' : 'Select All'}
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
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(attendee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{attendee.name}</p>
                                <p className="text-xs text-gray-500 truncate">{attendee.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs capitalize hidden sm:inline-flex">{attendee.status}</Badge>
                              <Badge className={`text-xs ${paymentBadge.className} hidden sm:inline-flex`}>
                                {paymentBadge.label}
                              </Badge>
                              {selectedAttendeeIds.includes(attendee.id) && (
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

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

            <div className="md:col-span-2">
              <Label className="text-xs text-gray-500">Signature</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <Input
                  placeholder="Signature Name"
                  value={data.signatureName}
                  onChange={(e) => handleChange('signatureName', e.target.value)}
                  className="cursor-text"
                />
                <Input
                  placeholder="Signature Title"
                  value={data.signatureTitle}
                  onChange={(e) => handleChange('signatureTitle', e.target.value)}
                  className="cursor-text"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="template" className="cursor-pointer">Template</TabsTrigger>
              <TabsTrigger value="styling" className="cursor-pointer">Styling</TabsTrigger>
              <TabsTrigger value="elements" className="cursor-pointer">Elements</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4 pt-4">
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
                      <SelectItem key={font.value} value={font.value} className="cursor-pointer" style={{ fontFamily: font.value }}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Font Size</Label>
                <Select value={data.fontSize} onValueChange={(value: any) => handleChange('fontSize', value)}>
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value} className="cursor-pointer">
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Text Alignment</Label>
                <div className="flex gap-2 mt-1">
                  {textAlignOptions.map((align) => {
                    const Icon = align.icon;
                    return (
                      <Button
                        key={align.value}
                        variant={data.textAlign === align.value ? 'default' : 'outline'}
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleChange('textAlign', align.value)}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="styling" className="space-y-4 pt-4">
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

              <div>
                <Label className="text-xs text-gray-500">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={data.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <Input
                    value={data.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1 cursor-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Border Style</Label>
                  <Select value={data.borderStyle} onValueChange={(value: any) => handleChange('borderStyle', value)}>
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {borderStyleOptions.map((style) => (
                        <SelectItem key={style.value} value={style.value} className="cursor-pointer">
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Border Width</Label>
                  <Slider
                    value={[data.borderWidth]}
                    onValueChange={([value]) => handleChange('borderWidth', value)}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Border Radius</Label>
                  <Slider
                    value={[data.borderRadius]}
                    onValueChange={([value]) => handleChange('borderRadius', value)}
                    min={0}
                    max={32}
                    step={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Background Pattern</Label>
                  <Select value={data.backgroundPattern} onValueChange={(value: any) => handleChange('backgroundPattern', value)}>
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundPatternOptions.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value} className="cursor-pointer">
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="elements" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-500">Logo</Label>
                    <p className="text-[10px] text-gray-400">Display logo on certificate</p>
                  </div>
                  <Switch
                    checked={data.includeLogo}
                    onCheckedChange={(checked) => handleChange('includeLogo', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-500">Border</Label>
                    <p className="text-[10px] text-gray-400">Show certificate border</p>
                  </div>
                  <Switch
                    checked={data.includeBorder}
                    onCheckedChange={(checked) => handleChange('includeBorder', checked)}
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
            </TabsContent>
          </Tabs>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Certificate</h1>
            <p className="text-sm text-gray-500">Generate a professional certificate for your attendees.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Preview Button */}
          {isMobile && selectedAttendees.length > 0 && (
            <Button 
              variant="outline" 
              className="cursor-pointer"
              onClick={() => setIsMobilePreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview ({selectedAttendees.length})
            </Button>
          )}
          <Button 
            className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
            onClick={handleGenerate}
            disabled={isGenerating || selectedAttendees.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating {selectedAttendees.length} Certificate{selectedAttendees.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Generate {selectedAttendees.length > 0 ? `(${selectedAttendees.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="py-4">
        <Stepper currentStep={currentStep} steps={STEPS} />
      </div>

      {/* Main Content - Grid Layout */}
      <div className={cn(
        "grid gap-6",
        !isMobile ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Left Column - Editor */}
        <div className="min-w-0">
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
          <div className="flex items-center justify-between gap-3 mt-6">
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
                disabled={isGenerating || selectedAttendees.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Generate {selectedAttendees.length > 0 ? `(${selectedAttendees.length})` : ''}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Desktop Preview */}
        {!isMobile && (
          <div className="sticky top-24 h-fit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                    <CardDescription>Real-time preview of your certificate</CardDescription>
                  </div>
                  {selectedAttendees.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {selectedAttendees.length} Certificate{selectedAttendees.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedAttendees.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Select attendees to preview certificates</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Attendee Tabs */}
                    {selectedAttendees.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {selectedAttendees.map((attendee, index) => (
                          <Button
                            key={attendee.id}
                            variant={index === currentPreviewIndex ? 'default' : 'outline'}
                            size="sm"
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setCurrentPreviewIndex(index)}
                          >
                            {attendee.name.split(' ').slice(0, 2).join(' ')}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Certificate Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
                      <div className="min-w-[280px]">
                        <CertificatePreview data={previewData} />
                      </div>
                    </div>

                    {/* Navigation Arrows for Multiple Attendees */}
                    {selectedAttendees.length > 1 && (
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={handlePreviousAttendee}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-500">
                          {currentPreviewIndex + 1} of {selectedAttendees.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={handleNextAttendee}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Preview Sheet - Removed custom X button */}
      <Sheet open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Certificate Preview</SheetTitle>
            <SheetDescription>
              {selectedAttendees.length} Certificate{selectedAttendees.length > 1 ? 's' : ''}
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 overflow-y-auto h-[calc(90vh-80px)]">
            {selectedAttendees.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select attendees to preview certificates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Attendee Dropdown for Mobile */}
                {selectedAttendees.length > 1 && (
                  <Select
                    value={selectedAttendees[currentPreviewIndex]?.id}
                    onValueChange={(value) => {
                      const index = selectedAttendees.findIndex(a => a.id === value);
                      if (index !== -1) setCurrentPreviewIndex(index);
                    }}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select attendee" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAttendees.map((attendee) => (
                        <SelectItem key={attendee.id} value={attendee.id} className="cursor-pointer">
                          {attendee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Certificate Preview */}
                <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
                  <div className="min-w-[280px]">
                    <CertificatePreview data={previewData} />
                  </div>
                </div>

                {/* Navigation Arrows for Multiple Attendees */}
                {selectedAttendees.length > 1 && (
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={handlePreviousAttendee}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      {currentPreviewIndex + 1} of {selectedAttendees.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={handleNextAttendee}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm flex-1"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer text-sm flex-1"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Generating Dialog */}
      <Dialog open={isGenerating} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center">Generating Certificates</DialogTitle>
            <DialogDescription className="text-center">
              Please wait while we generate {selectedAttendees.length} certificate{selectedAttendees.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {Math.round(generationProgress)}%
                </span>
              </div>
            </div>
            <div className="w-full space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                {isGenerationCanceled ? 'Canceling...' : `Generating ${selectedAttendees.length} certificates...`}
              </p>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleCancelGeneration}
              disabled={isGenerationCanceled}
            >
              Cancel Generation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Prompt Dialog */}
      <Dialog open={showSendEmailPrompt} onOpenChange={setShowSendEmailPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Certificates Generated!</DialogTitle>
            <DialogDescription className="text-center">
              Successfully generated {selectedAttendees.length} certificate{selectedAttendees.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Would you like to send these certificates to the attendees&apos; emails?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer w-full sm:w-auto"
                onClick={handleSendEmails}
                disabled={isSendingEmails}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send to {selectedAttendees.length} {selectedAttendees.length > 1 ? 'Attendees' : 'Attendee'}
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer w-full sm:w-auto"
                onClick={handleSkipEmails}
              >
                Skip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sending Emails Dialog */}
      <Dialog open={isSendingEmails} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center">Sending Certificates</DialogTitle>
            <DialogDescription className="text-center">
              Sending certificates to attendees via email
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {emailStatuses.map((status) => (
                <div key={status.attendeeId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(status.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{status.name}</p>
                      <p className="text-xs text-gray-500 truncate">{status.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    {status.status === 'pending' && (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                    {status.status === 'sending' && (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    )}
                    {status.status === 'sent' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {status.status === 'failed' && (
                      <span className="text-xs text-red-600">Failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <Progress value={emailSendProgress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                {Math.round(emailSendProgress)}% complete
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">All Done! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Successfully Generated {selectedAttendees.length} Certificate{selectedAttendees.length > 1 ? 's' : ''}
              </p>
              {emailStatuses.some(s => s.status === 'sent') && (
                <p className="text-sm text-gray-500">
                  {emailStatuses.filter(s => s.status === 'sent').length} emails sent successfully
                </p>
              )}
              {emailStatuses.some(s => s.status === 'failed') && (
                <p className="text-sm text-red-500">
                  {emailStatuses.filter(s => s.status === 'failed').length} emails failed to send
                </p>
              )}
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
                  setEmailStatuses([]);
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
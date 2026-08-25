// app/(public)/events/[slug]/page.tsx

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Video,
  User,
  Building2,
  Ticket,
  DollarSign,
  Award,
  Share2,
  CalendarDays,
  Loader2,
  AlertCircle,
  Heart,
  HeartOff,
  Globe,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Tag,
  BadgeCheck,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthModal } from '@/components/auth/AuthModal';

// ✅ Helper: Check if account is institution
const isInstitutionAccount = (accountType: string): boolean => {
  if (!accountType) return false;
  const normalized = accountType.toLowerCase().trim();
  return normalized === 'institution' || 
         normalized === 'account-type-institution' ||
         normalized === 'account_type_institution' ||
         normalized.includes('institution');
};

// Helper to format price
const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
};

// Helper to format date
const formatEventDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
};

// Helper to get time remaining
const getTimeRemaining = (dateStr: string) => {
  try {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Event has passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Starting soon!';
  } catch {
    return '';
  }
};

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
  certificate: boolean;
}

// ✅ Skeleton Loading Component
function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
              <Skeleton className="h-4 w-24 sm:w-32 rounded" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
              <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <Skeleton className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl sm:rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4 rounded" />
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-28 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-neutral-200/60 shadow-sm">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl" />
                      <div>
                        <Skeleton className="h-3 w-12 mb-1 rounded" />
                        <Skeleton className="h-5 w-24 rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-neutral-200/60 shadow-sm">
              <CardContent className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-1 rounded-full" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-neutral-200/60 shadow-lg overflow-hidden">
              <div className="px-5 py-4 sm:py-5 border-b border-neutral-200/30">
                <Skeleton className="h-4 w-24 mb-2 rounded" />
                <Skeleton className="h-8 w-32 rounded" />
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Separator />
                <div className="space-y-4">
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: event, isLoading, error } = useGetEventBySlugQuery(slug, {
    skip: !slug,
  });

  // ✅ Get current user from Redux store
  const { user, account, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingFormData | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    certificate: true,
  });

  // ✅ Pre-fill form with user data when authenticated (but still editable)
  useEffect(() => {
    if (isAuthenticated) {
      const name = account?.display_name || account?.name || user?.name || '';
      const email = account?.email || user?.email || '';
      const phone = account?.phone || user?.phone || '';
      
      setFormData((prev) => ({
        ...prev,
        fullName: name || prev.fullName,
        email: email || prev.email,
        phone: phone || prev.phone,
        certificate: true,
      }));
    }
  }, [isAuthenticated, account, user]);

  // ✅ When user becomes authenticated after signup/login, submit pending booking
  useEffect(() => {
    if (isAuthenticated && pendingBooking && !registrationComplete) {
      // Update form with user data
      const name = account?.display_name || account?.name || user?.name || '';
      const email = account?.email || user?.email || '';
      const phone = account?.phone || user?.phone || '';
      
      setFormData((prev) => ({
        ...prev,
        fullName: name || prev.fullName,
        email: email || prev.email,
        phone: phone || prev.phone,
        certificate: true,
      }));
      
      // Submit the booking - redirect to payment page
      handleBookingSubmit({
        ...pendingBooking,
        fullName: name || pendingBooking.fullName,
        email: email || pendingBooking.email,
        phone: phone || pendingBooking.phone,
      });
      
      setPendingBooking(null);
      setShowAuthModal(false);
      setRegistrationComplete(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, account, user]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.display_name || event?.name || 'Event',
          text: `Check out this event: ${event?.display_name || event?.name}`,
          url: window.location.href,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch (error) {
        console.log('Failed to copy link');
      }
    }
  };

const handleBookingSubmit = async (data: BookingFormData) => {
  if (!event) return;

  setIsBooking(true);
  setBookingError('');
  
  try {
    // TODO: Replace with actual booking API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBookingSuccess(true);
    setIsBooking(false);
    
    // ✅ Check if event is free (no registration fee AND no certificate fee)
    const isFree = event.price === 0 && event.certificate_price === 0;
    
    setTimeout(() => {
      if (isFree) {
        // ✅ For free events, go directly to booking confirmation
        router.push(`/booking-confirmation?event=${event.slug}`);
      } else {
        // ✅ For paid events, go to checkout
        router.push(`/checkout/${event.slug}?booking=success`);
      }
    }, 500);
    
  } catch (error) {
    setBookingError('Failed to book. Please try again.');
    setIsBooking(false);
  }
};

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) {
      setBookingError('Event not found');
      return;
    }

    // ✅ If not authenticated, show auth modal with booking details pre-filled
    if (!isAuthenticated) {
      setPendingBooking({ ...formData });
      setShowAuthModal(true);
      return;
    }

    // ✅ Authenticated - submit booking and go to payment
    await handleBookingSubmit(formData);
  };

  const handleAuthSuccess = () => {
    // Auth success is handled by the useEffect above
    // The pending booking will be submitted automatically
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setPendingBooking(null);
  };

  const handleResetBooking = () => {
    setBookingSuccess(false);
    setRegistrationComplete(false);
    if (isAuthenticated) {
      const name = account?.display_name || account?.name || user?.name || '';
      const email = account?.email || user?.email || '';
      const phone = account?.phone || user?.phone || '';
      
      setFormData({
        fullName: name,
        email: email,
        phone: phone,
        specialRequests: '',
        certificate: true,
      });
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Event Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/')} className="cursor-pointer">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const isPast = new Date(event.date) < new Date();
  const isFullyBooked = event.current_attendees >= event.max_attendees && event.max_attendees > 0;
  const timeRemaining = getTimeRemaining(event.date);
  const attendancePercentage = event.max_attendees > 0 
    ? Math.min(Math.round((event.current_attendees / event.max_attendees) * 100), 100) 
    : 0;

  const canBook = !isPast && !isFullyBooked;

  const getCreatorDisplay = () => {
    const creator = event.creator;
    if (!creator) {
      return { name: 'Host', isInstitution: false, institutionName: '' };
    }
    
    if (isInstitutionAccount(creator.account_type) && creator.institution_name) {
      return { 
        name: creator.institution_name, 
        isInstitution: true,
        institutionName: creator.institution_name,
        displayName: creator.display_name || creator.name
      };
    }
    
    return { 
      name: creator.display_name || creator.name || 'Host', 
      isInstitution: false,
      institutionName: '',
      displayName: creator.display_name || creator.name
    };
  };

  const creatorInfo = getCreatorDisplay();
  const totalPrice = event.price + (event.certificate_price > 0 ? event.certificate_price : 0);

  // ✅ Show success message for both registration + booking
  const showSuccess = bookingSuccess || registrationComplete;

  // ✅ Determine if form fields should be editable
  const isFormDisabled = false; // Always editable

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-neutral-500 hover:text-neutral-900 transition-all duration-200 group cursor-pointer bg-transparent border-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium hidden sm:inline">Back to Events</span>
              <span className="font-medium sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                onClick={() => setIsSaved(!isSaved)}
                type="button"
              >
                {isSaved ? (
                  <Heart className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-red-500 fill-red-500" />
                ) : (
                  <HeartOff className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 sm:h-10 px-3 sm:px-4 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                onClick={handleShare}
                type="button"
              >
                <Share2 className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm hidden sm:inline">
                  {isShared ? 'Copied!' : 'Share'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Hero Image */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 shadow-lg">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.display_name || event.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 to-neutral-100">
                  <CalendarDays className="h-16 w-16 sm:h-24 sm:w-24 text-neutral-300" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white border-0 shadow-lg px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full cursor-default">
                    <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    Featured
                  </Badge>
                )}
                {event.is_virtual && (
                  <Badge className="bg-primary-500/90 backdrop-blur-sm text-white border-0 shadow-lg px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full cursor-default">
                    <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    Virtual
                  </Badge>
                )}
                {isPast && (
                  <Badge className="bg-neutral-700/90 backdrop-blur-sm text-white border-0 shadow-lg px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full cursor-default">
                    Ended
                  </Badge>
                )}
                {isFullyBooked && !isPast && (
                  <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 shadow-lg px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full cursor-default">
                    Full
                  </Badge>
                )}
              </div>
            </div>

            {/* Event Title & Host */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
                {event.display_name || event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base text-neutral-500">
                <div className="flex items-center gap-2">
                  {creatorInfo.isInstitution ? (
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                  ) : (
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                  )}
                  <span className="hidden xs:inline">Hosted by</span>
                  <span className="font-medium text-neutral-700 flex items-center gap-1">
                    {creatorInfo.name}
                    {creatorInfo.isInstitution && (
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                    )}
                  </span>
                </div>
                <span className="w-px h-4 sm:h-5 rounded-full bg-neutral-300 hidden xs:block" />
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                  <span>{event.is_virtual ? 'Virtual Event' : 'In-Person'}</span>
                </div>
                {!isPast && !isFullyBooked && timeRemaining && (
                  <>
                    <span className="w-px h-4 sm:h-5 rounded-full bg-neutral-300 hidden sm:block" />
                    <div className="flex items-center gap-2 text-secondary-600 font-medium">
                      <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>{timeRemaining}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-primary-50 rounded-xl">
                      <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-400 font-medium uppercase tracking-wider">Date</p>
                      <p className="text-sm sm:text-base font-semibold text-neutral-900">{formatEventDate(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-primary-50 rounded-xl">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-400 font-medium uppercase tracking-wider">Time</p>
                      <p className="text-sm sm:text-base font-semibold text-neutral-900">{event.time || 'TBD'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-primary-50 rounded-xl">
                      <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-400 font-medium uppercase tracking-wider">Location</p>
                      <p className="text-sm sm:text-base font-semibold text-neutral-900 truncate">
                        {event.is_virtual ? 'Virtual' : event.location || 'TBD'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {event.description && (
              <Card className="border-neutral-200/60 shadow-sm cursor-default">
                <CardContent className="p-5 sm:p-6 lg:p-7">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 sm:h-6 rounded-full bg-primary-500" />
                    About This Event
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Event Footer Details */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-neutral-500 pb-4">
              <div className="flex items-center gap-2 cursor-default">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                <span>{event.duration || 'N/A'} minutes</span>
              </div>
              {event.certificate_price > 0 && (
                <>
                  <span className="w-px h-4 sm:h-5 rounded-full bg-neutral-300" />
                  <div className="flex items-center gap-2 cursor-default">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                    <span>Certificate: {formatPrice(event.certificate_price)}</span>
                  </div>
                </>
              )}
              <span className="w-px h-4 sm:h-5 rounded-full bg-neutral-300 hidden sm:block" />
              <div className="flex items-center gap-2 cursor-default">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                <span className="hidden sm:inline">ID: {event.id?.slice(0, 8) || 'N/A'}</span>
                <span className="sm:hidden">#{event.id?.slice(0, 6)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Price Card */}
              <Card className="border-neutral-200/60 shadow-lg overflow-hidden cursor-default">
                <div className="bg-gradient-to-r from-primary-500/5 to-primary-500/10 px-5 py-4 sm:py-5 border-b border-neutral-200/30">
                  <p className="text-xs sm:text-sm text-neutral-400 font-medium uppercase tracking-wider">
                    Registration
                  </p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className={cn(
                      "text-3xl sm:text-4xl font-bold",
                      totalPrice === 0 ? "text-tertiary-600" : "text-primary-600"
                    )}>
                      {formatPrice(totalPrice)}
                    </span>
                    <span className="text-sm sm:text-base text-neutral-400">total</span>
                  </div>
                  {event.certificate_price > 0 && (
                    <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-neutral-500">
                      <span className="line-through">{formatPrice(event.price)}</span>
                      <span className="text-neutral-300">+</span>
                      <span className="text-amber-600 font-medium">{formatPrice(event.certificate_price)}</span>
                      <span className="text-neutral-400">certificate</span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-5 space-y-4">
                  {/* Attendee Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-2 text-neutral-600 cursor-default">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                        <span>Attendees</span>
                      </div>
                      <span className="font-semibold text-neutral-900 cursor-default">
                        {event.current_attendees || 0} / {event.max_attendees || '∞'}
                      </span>
                    </div>
                    {event.max_attendees > 0 && (
                      <div className="w-full h-1.5 sm:h-2 bg-neutral-100 rounded-full overflow-hidden cursor-default">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            attendancePercentage >= 90 ? "bg-red-500" : 
                            attendancePercentage >= 70 ? "bg-amber-500" : 
                            "bg-tertiary-500"
                          )}
                          style={{ width: `${attendancePercentage}%` }}
                        />
                      </div>
                    )}
                    {event.max_attendees > 0 && !isPast && !isFullyBooked && (
                      <p className="text-xs sm:text-sm text-neutral-500 cursor-default">
                        {event.max_attendees - event.current_attendees} spots remaining
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Certificate Included Badge */}
                  {event.certificate_price > 0 && (
                    <div className="flex items-center justify-between bg-amber-50/70 rounded-lg px-3 py-2.5 sm:py-3 border-2 border-amber-400">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-semibold text-amber-800">Certificate Included</span>
                          <p className="text-xs sm:text-sm text-amber-600">Included in total price</p>
                        </div>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-amber-800 ml-auto">
                        {formatPrice(event.certificate_price)}
                      </span>
                    </div>
                  )}

                  {/* Booking Section */}
                  {canBook ? (
                    <>
                      {showSuccess ? (
                        // ✅ Success State - Account created and ticket booked
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-tertiary-50 border border-tertiary-200 rounded-xl p-4 cursor-default">
                            <CheckCircle className="h-7 w-7 text-tertiary-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-tertiary-800 text-sm sm:text-base">
                                {!isAuthenticated && registrationComplete 
                                  ? 'Account Created & Ticket Booked!' 
                                  : 'Booking Confirmed!'}
                              </p>
                              <p className="text-sm text-tertiary-700">
                                {!isAuthenticated && registrationComplete
                                  ? 'Your account has been created and your ticket is confirmed. Redirecting to payment...'
                                  : 'Redirecting to payment...'}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleResetBooking}
                            className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl border border-tertiary-200 text-tertiary-700 hover:bg-tertiary-50 transition-all duration-200 cursor-pointer"
                            variant="outline"
                          >
                            View Other Events
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleBooking} className="space-y-4">
                          {/* ✅ Show auth status */}
                          {!isAuthenticated && (
                            <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200 cursor-default">
                              <LogIn className="h-4 w-4 text-amber-600 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-amber-700">
                                You&apos;ll be prompted to sign in or create an account to complete booking
                              </span>
                            </div>
                          )}

                          {/* ✅ Logged in status indicator */}
                          {isAuthenticated && (
                            <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-200 cursor-default">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-green-700">
                                Booking as {account?.display_name || account?.name || user?.name}
                              </span>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <Label htmlFor="fullName" className="text-sm sm:text-base font-medium cursor-pointer">
                              Full Name <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 pointer-events-none" />
                              <Input
                                id="fullName"
                                placeholder="Enter your full name"
                                className="pl-9 sm:pl-10 h-11 sm:h-12 text-sm sm:text-base cursor-text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                // ✅ Always editable
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm sm:text-base font-medium cursor-pointer">
                              Email Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 pointer-events-none" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-9 sm:pl-10 h-11 sm:h-12 text-sm sm:text-base cursor-text"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                // ✅ Always editable
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-sm sm:text-base font-medium cursor-pointer">
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 pointer-events-none" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+254 700 000 000"
                                className="pl-9 sm:pl-10 h-11 sm:h-12 text-sm sm:text-base cursor-text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                // ✅ Always editable
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="specialRequests" className="text-sm sm:text-base font-medium cursor-pointer">
                              Special Requests
                            </Label>
                            <div className="relative">
                              <MessageSquare className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 pointer-events-none" />
                              <Textarea
                                id="specialRequests"
                                placeholder="Any special requirements or questions..."
                                className="pl-9 sm:pl-10 min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base cursor-text"
                                value={formData.specialRequests}
                                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                              />
                            </div>
                          </div>

                          {bookingError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm sm:text-base text-red-700 cursor-default">
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                              {bookingError}
                            </div>
                          )}

                          <Button
                            type="submit"
                            className={cn(
                              "w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 cursor-pointer",
                              totalPrice === 0 
                                ? "bg-tertiary-500 hover:bg-tertiary-600 shadow-tertiary-500/30" 
                                : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/30",
                              isBooking && "opacity-70 cursor-not-allowed hover:opacity-70"
                            )}
                            disabled={isBooking}
                          >
                            {isBooking ? (
                              <>
                                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                {totalPrice === 0 ? 'Register Now' : 'Proceed to Payment'}
                              </>
                            )}
                          </Button>

                          <p className="text-xs sm:text-sm text-center text-neutral-400 cursor-default">
                            By booking, you agree to our terms and conditions
                          </p>
                        </form>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-neutral-500 mb-2 cursor-default">
                        {isPast ? <XCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : <Users className="h-5 w-5 sm:h-6 sm:w-6" />}
                        <span className="font-medium text-sm sm:text-base">
                          {isPast ? 'Event has ended' : isFullyBooked ? 'Fully Booked' : 'Registration Closed'}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-400 cursor-default">
                        {isPast ? 'Check out our upcoming events' : 'No more spots available'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Share Card */}
              <Card className="border-neutral-200/60 shadow-sm cursor-default">
                <CardContent className="p-4">
                  <Button
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium rounded-xl border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 cursor-pointer"
                    onClick={handleShare}
                    type="button"
                  >
                    <Share2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    {isShared ? 'Link Copied!' : 'Share Event'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Auth Modal - shows when unauthenticated user tries to book */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
        defaultMode="signin"
        prefillData={{
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        }}
      />
    </div>
  );
}
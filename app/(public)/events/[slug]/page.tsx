// app/(public)/events/[slug]/page.tsx

'use client';

import { useState } from 'react';
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
  CheckCircle2,
  Share2,
  CalendarDays,
  ExternalLink,
  Loader2,
  AlertCircle,
  Heart,
  HeartOff,
  Globe,
  Clock as ClockIcon,
  UserCheck,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Tag,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { cn } from '@/lib/utils';

// ✅ Helper: Check if account is institution (handles ALL formats)
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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: event, isLoading, error } = useGetEventBySlugQuery(slug, {
    skip: !slug,
  });

  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
      navigator.clipboard.writeText(window.location.href);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Loading event details...</p>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
      {/* Navigation Bar - Responsive */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/20 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 transition-all duration-200 cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium hidden xs:inline">Back to Events</span>
              <span className="font-medium xs:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                onClick={() => setIsSaved(!isSaved)}
              >
                {isSaved ? (
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                ) : (
                  <HeartOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 sm:h-9 px-2 sm:px-3 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-1 text-xs hidden sm:inline">
                  {isShared ? 'Copied!' : 'Share'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Hero Image */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 shadow-lg sm:shadow-xl shadow-neutral-200/50">
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
              
              <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 flex flex-wrap gap-1.5 sm:gap-2">
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white border-0 shadow-lg shadow-secondary-500/30 px-2 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-xs font-semibold rounded-full">
                    <Award className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="hidden xs:inline">Featured</span>
                    <span className="xs:hidden">★</span>
                  </Badge>
                )}
                {event.is_virtual && (
                  <Badge className="bg-primary-500/90 backdrop-blur-sm text-white border-0 shadow-lg shadow-primary-500/30 px-2 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-xs font-semibold rounded-full">
                    <Video className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="hidden xs:inline">Virtual</span>
                    <span className="xs:hidden">Online</span>
                  </Badge>
                )}
                {isPast && (
                  <Badge className="bg-neutral-700/90 backdrop-blur-sm text-white border-0 shadow-lg shadow-neutral-700/30 px-2 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-xs font-semibold rounded-full">
                    Ended
                  </Badge>
                )}
                {isFullyBooked && !isPast && (
                  <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 shadow-lg shadow-red-500/30 px-2 py-0.5 sm:px-3 sm:py-1.5 text-[9px] sm:text-xs font-semibold rounded-full">
                    Full
                  </Badge>
                )}
              </div>
            </div>

            {/* Event Title & Host */}
            <div className="space-y-2 sm:space-y-3">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-neutral-900 leading-tight">
                  {event.display_name || event.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-500">
                    {creatorInfo.isInstitution ? (
                      <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
                    ) : (
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
                    )}
                    <span className="hidden xs:inline">Hosted by</span>
                    <span className="font-medium text-neutral-700 flex items-center gap-1">
                      {creatorInfo.name}
                      {creatorInfo.isInstitution && (
                        <BadgeCheck className="h-3.5 w-3.5 text-primary-500" />
                      )}
                    </span>
                  </div>
                  <span className="w-0.5 h-3 sm:h-4 rounded-full bg-neutral-300 hidden xs:block" />
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-neutral-500">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
                    <span className="hidden xs:inline">{event.is_virtual ? 'Virtual' : 'In-Person'}</span>
                    <span className="xs:hidden">{event.is_virtual ? 'Online' : 'In-Person'}</span>
                  </div>
                  {!isPast && !isFullyBooked && timeRemaining && (
                    <>
                      <span className="w-0.5 h-3 sm:h-4 rounded-full bg-neutral-300 hidden xs:block" />
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-secondary-600 font-medium">
                        <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">{timeRemaining}</span>
                        <span className="xs:hidden">{timeRemaining.replace(' remaining', '')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-2.5 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-primary-50 rounded-lg sm:rounded-xl">
                      <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Date</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-neutral-900 truncate">{formatEventDate(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-2.5 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-primary-50 rounded-lg sm:rounded-xl">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Time</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-neutral-900">{event.time || 'TBD'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2 sm:col-span-1">
                <CardContent className="p-2.5 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 lg:p-2.5 bg-primary-50 rounded-lg sm:rounded-xl">
                      <MapPinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Location</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-neutral-900 truncate">
                        {event.is_virtual ? 'Virtual' : event.location || 'TBD'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {event.description && (
              <Card className="border-neutral-200/60 shadow-sm">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 sm:h-5 rounded-full bg-primary-500" />
                    About This Event
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Event Details Footer */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-500 pb-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
                <span>{event.duration || 'N/A'} min</span>
              </div>
              {event.certificate_price > 0 && (
                <>
                  <span className="w-0.5 h-3 sm:h-4 rounded-full bg-neutral-300" />
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
                    <span>Cert: {formatPrice(event.certificate_price)}</span>
                  </div>
                </>
              )}
              <span className="w-0.5 h-3 sm:h-4 rounded-full bg-neutral-300 hidden xs:block" />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
                <span className="hidden sm:inline">ID: {event.id?.slice(0, 8) || 'N/A'}</span>
                <span className="sm:hidden">#{event.id?.slice(0, 6)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Card (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="space-y-3 sm:space-y-4">
              <Card className="border-neutral-200/60 shadow-lg sm:shadow-xl shadow-neutral-200/30 overflow-hidden sticky top-20">
                <div className="bg-gradient-to-r from-primary-500/5 to-primary-500/10 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 border-b border-neutral-200/30">
                  <p className="text-[9px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                    Registration
                  </p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className={cn(
                      "text-2xl sm:text-3xl font-bold",
                      event.price === 0 ? "text-tertiary-600" : "text-primary-600"
                    )}>
                      {formatPrice(event.price)}
                    </span>
                    {event.price > 0 && (
                      <span className="text-[10px] sm:text-sm text-neutral-400">per person</span>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-neutral-600">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
                        <span>Attendees</span>
                      </div>
                      <span className="font-semibold text-neutral-900">
                        {event.current_attendees || 0} / {event.max_attendees || '∞'}
                      </span>
                    </div>
                    {event.max_attendees > 0 && (
                      <div className="w-full h-1 sm:h-1.5 bg-neutral-100 rounded-full overflow-hidden">
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
                      <p className="text-[10px] sm:text-xs text-neutral-500">
                        {event.max_attendees - event.current_attendees} spots remaining
                      </p>
                    )}
                  </div>

                  <Separator />

                  <Button
                    className={cn(
                      "w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer",
                      event.price === 0 
                        ? "bg-tertiary-500 hover:bg-tertiary-600 shadow-tertiary-500/30" 
                        : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/30",
                      (isPast || isFullyBooked) && "opacity-50 cursor-not-allowed hover:shadow-lg"
                    )}
                    disabled={isPast || isFullyBooked}
                    onClick={() => {
                      console.log('Register for event:', event.id);
                    }}
                  >
                    {isPast ? 'Event Ended' : isFullyBooked ? 'Fully Booked' : event.price === 0 ? 'Register Now' : 'Get Ticket'}
                  </Button>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Type</span>
                      <span className="font-medium text-neutral-700 capitalize">
                        {event.is_virtual ? 'Virtual' : 'In-Person'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Duration</span>
                      <span className="font-medium text-neutral-700">
                        {event.duration || 'N/A'}m
                      </span>
                    </div>
                    {event.certificate_price > 0 && (
                      <div className="flex items-center justify-between col-span-2">
                        <span className="text-neutral-500">Certificate</span>
                        <span className="font-medium text-neutral-700">
                          {formatPrice(event.certificate_price)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between col-span-2">
                      <span className="text-neutral-500">Status</span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] sm:text-xs",
                        isPast ? "text-neutral-500 border-neutral-200" :
                        isFullyBooked ? "text-red-500 border-red-200" :
                        "text-tertiary-600 border-tertiary-200"
                      )}>
                        {isPast ? 'Ended' : isFullyBooked ? 'Full' : 'Available'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-200/60 shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <Button
                    variant="outline"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium rounded-xl cursor-pointer border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    {isShared ? 'Link Copied!' : 'Share Event'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Bottom Bar - Not sticky, just at the bottom of content */}
      <div className="lg:hidden block border-t border-neutral-200 bg-white shadow-lg mt-4">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Price */}
            <div className="flex-shrink-0 min-w-[65px]">
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Price</p>
              <span className={cn(
                "text-lg font-bold",
                event.price === 0 ? "text-tertiary-600" : "text-primary-600"
              )}>
                {formatPrice(event.price)}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-neutral-200" />

            {/* Attendees */}
            <div className="flex-shrink-0 min-w-[65px]">
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Spots</p>
              <span className="text-sm font-semibold text-neutral-900">
                {event.max_attendees > 0 ? `${event.max_attendees - event.current_attendees} left` : '∞'}
              </span>
            </div>

            {/* Get Ticket Button */}
            <Button
              className={cn(
                "flex-1 h-11 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 cursor-pointer",
                event.price === 0 
                  ? "bg-tertiary-500 hover:bg-tertiary-600 text-white shadow-tertiary-500/30" 
                  : "bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/30",
                (isPast || isFullyBooked) && "opacity-50 cursor-not-allowed hover:shadow-lg"
              )}
              disabled={isPast || isFullyBooked}
              onClick={() => {
                console.log('Register for event:', event.id);
              }}
            >
              {isPast ? 'Ended' : isFullyBooked ? 'Full' : event.price === 0 ? 'Register Now' : 'Get Ticket'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
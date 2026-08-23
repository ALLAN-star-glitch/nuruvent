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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { cn } from '@/lib/utils';

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
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
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
        <div className="text-center max-w-md">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
      {/* Navigation Bar - Sticky by default from navbar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-all duration-200 cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Events</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-neutral-500 hover:text-neutral-900 cursor-pointer"
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
                className="h-9 px-3 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-1.5 text-xs hidden sm:inline">
                  {isShared ? 'Copied!' : 'Share'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-neutral-100 shadow-xl shadow-neutral-200/50">
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
                  <CalendarDays className="h-24 w-24 text-neutral-300" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Status Badges */}
              <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                {event.is_featured && (
                  <Badge className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white border-0 shadow-lg shadow-secondary-500/30 px-3 py-1.5 text-xs font-semibold rounded-full">
                    <Award className="h-3.5 w-3.5 mr-1.5" />
                    Featured
                  </Badge>
                )}
                {event.is_virtual && (
                  <Badge className="bg-primary-500/90 backdrop-blur-sm text-white border-0 shadow-lg shadow-primary-500/30 px-3 py-1.5 text-xs font-semibold rounded-full">
                    <Video className="h-3.5 w-3.5 mr-1.5" />
                    Virtual Event
                  </Badge>
                )}
                {isPast && (
                  <Badge className="bg-neutral-700/90 backdrop-blur-sm text-white border-0 shadow-lg shadow-neutral-700/30 px-3 py-1.5 text-xs font-semibold rounded-full">
                    Event Ended
                  </Badge>
                )}
                {isFullyBooked && !isPast && (
                  <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 shadow-lg shadow-red-500/30 px-3 py-1.5 text-xs font-semibold rounded-full">
                    Fully Booked
                  </Badge>
                )}
              </div>
            </div>

            {/* Event Title & Host */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
                  {event.display_name || event.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span>Hosted by</span>
                    <span className="font-medium text-neutral-700">
                      {event.creator?.display_name || event.creator?.name || 'Unknown Host'}
                    </span>
                    {event.creator?.account_type === 'institution' && (
                      <CheckCircle2 className="h-4 w-4 text-tertiary-500" />
                    )}
                  </div>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Globe className="h-4 w-4 text-neutral-400" />
                    <span>{event.is_virtual ? 'Virtual' : 'In-Person'}</span>
                  </div>
                  {!isPast && !isFullyBooked && timeRemaining && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-neutral-300" />
                      <div className="flex items-center gap-1.5 text-sm text-secondary-600 font-medium">
                        <ClockIcon className="h-4 w-4" />
                        <span>{timeRemaining}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-50 rounded-xl">
                      <CalendarIcon className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-neutral-900">{formatEventDate(event.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-50 rounded-xl">
                      <Clock className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Time</p>
                      <p className="text-sm font-semibold text-neutral-900">{event.time || 'TBD'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-50 rounded-xl">
                      <MapPinIcon className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Location</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {event.is_virtual ? 'Virtual Event' : event.location || 'TBD'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {event.description && (
              <Card className="border-neutral-200/60 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-primary-500" />
                    About This Event
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Event Details Footer */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-400" />
                <span>Duration: {event.duration || 'N/A'} minutes</span>
              </div>
              {event.certificate_price > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-neutral-400" />
                    <span>Certificate: {formatPrice(event.certificate_price)}</span>
                  </div>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-neutral-400" />
                <span>ID: {event.id?.slice(0, 8) || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Card */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Main Registration Card */}
              <Card className="border-neutral-200/60 shadow-xl shadow-neutral-200/30 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary-500/5 to-primary-500/10 px-6 py-4 border-b border-neutral-200/30">
                  <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                    Registration
                  </p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className={cn(
                      "text-3xl font-bold",
                      event.price === 0 ? "text-tertiary-600" : "text-primary-600"
                    )}>
                      {formatPrice(event.price)}
                    </span>
                    {event.price > 0 && (
                      <span className="text-sm text-neutral-400">per person</span>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  {/* Attendee Count with Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Users className="h-4 w-4 text-neutral-400" />
                        <span>Attendees</span>
                      </div>
                      <span className="font-semibold text-neutral-900">
                        {event.current_attendees || 0} / {event.max_attendees || '∞'}
                      </span>
                    </div>
                    {event.max_attendees > 0 && (
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
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
                      <p className="text-xs text-neutral-500">
                        {event.max_attendees - event.current_attendees} spots remaining
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Registration Button */}
                  <Button
                    className={cn(
                      "w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer",
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

                  {/* Quick Info */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Event Type</span>
                      <span className="font-medium text-neutral-700 capitalize">
                        {event.is_virtual ? 'Virtual' : 'In-Person'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Duration</span>
                      <span className="font-medium text-neutral-700">
                        {event.duration || 'N/A'} min
                      </span>
                    </div>
                    {event.certificate_price > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Certificate</span>
                        <span className="font-medium text-neutral-700">
                          {formatPrice(event.certificate_price)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Status</span>
                      <Badge variant="outline" className={cn(
                        "text-xs",
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

              {/* Share Card */}
              <Card className="border-neutral-200/60 shadow-sm">
                <CardContent className="p-4">
                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm font-medium rounded-xl cursor-pointer border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {isShared ? 'Link Copied!' : 'Share Event'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
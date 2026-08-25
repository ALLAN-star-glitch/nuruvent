// app/(public)/booking-confirmation/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, 
  Calendar, 
  ArrowRight, 
  Ticket, 
  Mail, 
  User, 
  Clock, 
  Printer, 
  Download, 
  Share2,
  MapPin,
  Video,
  Building2,
  Smartphone,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  CalendarPlus,
  Heart,
  Star,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useAppSelector } from '@/lib/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Helper to format price
const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
};

// Helper to format date for calendar
const formatDateForCalendar = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventSlug = searchParams.get('event');
  const { isAuthenticated, user, account } = useAppSelector((state) => state.auth);
  const [countdown, setCountdown] = useState(5);
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: event, isLoading } = useGetEventBySlugQuery(eventSlug || '', {
    skip: !eventSlug,
  });

  // Redirect to events page if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/events');
    }
  }, [isAuthenticated, isLoading, router]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if event is free
  const isFree = event ? event.price === 0 && event.certificate_price === 0 : false;

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking Confirmation - ${event?.display_name || event?.name}`,
          text: `I've registered for ${event?.display_name || event?.name}! Join me!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  // Handle add to calendar
  const handleAddToCalendar = () => {
    if (!event) return;
    const startDate = formatDateForCalendar(event.date);
    // Add 3 hours for duration (default)
    const endDate = new Date(event.date);
    endDate.setHours(endDate.getHours() + 3);
    const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.display_name || event.name
    )}&dates=${startDate}/${endDateStr}&details=${encodeURIComponent(
      event.description || 'Event'
    )}&location=${encodeURIComponent(
      event.is_virtual ? 'Virtual Event' : event.location || ''
    )}`;
    
    window.open(calendarUrl, '_blank');
  };

  // Handle download ticket (placeholder)
  const handleDownloadTicket = () => {
    // TODO: Implement actual ticket download
    alert('Ticket download will be available soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto mt-4" />
          <Skeleton className="h-4 w-64 mx-auto mt-2" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Event Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">
            We couldn&apos;t find the event you registered for.
          </p>
          <Button onClick={() => router.push('/events')} className="cursor-pointer">
            Browse Events
          </Button>
        </div>
      </div>
    );
  }

  const attendeeName = account?.display_name || account?.name || user?.name || 'Guest';
  const totalPrice = event.price + (event.certificate_price > 0 ? event.certificate_price : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 py-8 px-4 sm:px-6" ref={printRef}>
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer group"
          >
            <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Back to Event
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-neutral-200/60 shadow-xl overflow-hidden">
          {/* Header */}
          <div className={cn(
            "px-6 py-8 sm:py-10 text-center relative",
            isFree 
              ? "bg-gradient-to-r from-tertiary-500 to-tertiary-600" 
              : "bg-gradient-to-r from-green-500 to-green-600"
          )}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4 animate-in zoom-in duration-500">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {isFree ? 'Booking Confirmed!' : 'Payment Successful!'}
            </h1>
            <p className={cn(
              "mt-1",
              isFree ? "text-tertiary-100" : "text-green-100"
            )}>
              {isFree 
                ? 'You\'re all set for the event' 
                : 'Your ticket has been confirmed'
              }
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl" />
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 text-xs rounded-full cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCalendar}
                className="h-9 text-xs rounded-full cursor-pointer"
              >
                <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                Add to Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTicket}
                className="h-9 text-xs rounded-full cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Ticket
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-9 text-xs rounded-full cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-9 text-xs rounded-full cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Success Message */}
            <div className="text-center">
              <p className="text-neutral-600 text-sm sm:text-base">
                You have successfully registered for{' '}
                <span className="font-semibold text-neutral-900">
                  {event.display_name || event.name}
                </span>
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                A confirmation email has been sent to your registered email address.
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-neutral-400">
                <Info className="h-3 w-3" />
                <span>Booking Reference: #{event.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
              </div>
            </div>

            <Separator />

            {/* Event Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-primary-800 text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Details
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-sm text-primary-700">
                    <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-primary-700">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{event.time || 'TBD'}</span>
                  </div>
                  {event.is_virtual ? (
                    <div className="flex items-start gap-2 text-sm text-primary-700">
                      <Video className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Virtual Event</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-primary-700">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{event.location || 'Location TBD'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-amber-800 text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ticket Holder
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-sm text-amber-700">
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{attendeeName}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-amber-700">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{account?.email || user?.email || 'No email provided'}</span>
                  </div>
                  {!isFree && (
                    <div className="flex items-start gap-2 text-sm text-amber-700">
                      <Ticket className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Paid: {formatPrice(totalPrice)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary - Only for paid events */}
            {!isFree && (
              <>
                <Separator />
                <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Registration Fee</span>
                      <span className="font-medium">{formatPrice(event.price)}</span>
                    </div>
                    {event.certificate_price > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Certificate Fee</span>
                        <span className="font-medium">{formatPrice(event.certificate_price)}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-200 pt-2 flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">Total Paid</span>
                      <span className="font-bold text-green-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push(`/events/${event.slug}`)}
                  className="w-full h-12 text-base font-semibold rounded-xl cursor-pointer"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Event Details
                </Button>
                <Button
                  onClick={() => router.push('/events')}
                  className="w-full h-12 text-base font-semibold rounded-xl bg-primary-500 hover:bg-primary-600 cursor-pointer"
                >
                  Browse More Events
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Auto-redirect */}
            <p className="text-xs text-center text-neutral-400">
              Redirecting to events page in {countdown} seconds...
              <button
                onClick={() => router.push('/events')}
                className="ml-1 text-primary-500 hover:underline cursor-pointer"
              >
                (skip)
              </button>
            </p>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-neutral-400 border-t border-neutral-100">
              <span>Secure Booking</span>
              <span className="w-px h-3 bg-neutral-300" />
              <span>Powered by Nuruvent</span>
            </div>
          </CardContent>
        </Card>

        {/* Related Events Suggestion */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-400">
            Want to discover more events?{' '}
            <Link href="/events" className="text-primary-500 hover:underline cursor-pointer">
              Browse all events
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
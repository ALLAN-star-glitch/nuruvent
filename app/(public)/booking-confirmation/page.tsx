// app/(public)/booking-confirmation/page.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
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
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  CalendarPlus,
  Info,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ============================================================
// PLACEHOLDER DATA
// ============================================================
//
// Replace this with whatever hydrates the page once the real
// booking/event data is fetched.

interface PlaceholderEvent {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  certificate_price: number;
  certificate_enabled: boolean;
  is_virtual: boolean;
  is_hybrid: boolean;
  location: string;
  image_url?: string;
}

interface PlaceholderAttendee {
  name: string;
  email: string;
}

const PLACEHOLDER_EVENT: PlaceholderEvent = {
  id: 'placeholder-event-id',
  slug: 'demo-event',
  name: 'Hands-on Kubernetes Workshop',
  display_name: 'Kubernetes Workshop 2026',
  description:
    'A two-day deep-dive into production Kubernetes for backend engineers.',
  date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  time: '09:00',
  duration: 480,
  price: 2500,
  certificate_price: 500,
  certificate_enabled: true,
  is_virtual: false,
  is_hybrid: true,
  location: 'Nairobi, Kenya',
};

const PLACEHOLDER_ATTENDEE: PlaceholderAttendee = {
  name: 'Jane Doe',
  email: 'jane@example.com',
};

// ============================================================
// HELPERS
// ============================================================

const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
};

const formatDateForCalendar = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// ============================================================
// PAGE
// ============================================================

export default function BookingConfirmationPage() {
  const [countdown, setCountdown] = useState(5);
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ---- TODO: hydrate from a real booking endpoint ----
  const event = PLACEHOLDER_EVENT;
  const attendee = PLACEHOLDER_ATTENDEE;

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const isFree =
    event.price === 0 && event.certificate_price === 0;

  const totalPrice =
    event.price + (event.certificate_price > 0 ? event.certificate_price : 0);

  // ---- Handlers ----

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking Confirmation - ${event.display_name || event.name}`,
          text: `I've registered for ${event.display_name || event.name}! Join me!`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled — no-op
      }
    } else {
      handleCopyLink();
    }
  };

  const handleAddToCalendar = () => {
    const startDate = formatDateForCalendar(event.date);
    const endDate = new Date(event.date);
    endDate.setHours(endDate.getHours() + 3);
    const endDateStr =
      endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.display_name || event.name,
    )}&dates=${startDate}/${endDateStr}&details=${encodeURIComponent(
      event.description || 'Event',
    )}&location=${encodeURIComponent(
      event.is_virtual ? 'Virtual Event' : event.location || '',
    )}`;

    window.open(calendarUrl, '_blank');
  };

  const handleDownloadTicket = () => {
    // TODO: Implement actual ticket download
    alert('Ticket download will be available soon!');
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 py-8 px-4 sm:px-6"
      ref={printRef}
    >
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
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-neutral-200/60 shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              'px-6 py-8 sm:py-10 text-center relative',
              isFree
                ? 'bg-gradient-to-r from-tertiary-500 to-tertiary-600'
                : 'bg-gradient-to-r from-green-500 to-green-600',
            )}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4 animate-in zoom-in duration-500">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {isFree ? 'Booking Confirmed!' : 'Payment Successful!'}
            </h1>
            <p
              className={cn(
                'mt-1',
                isFree ? 'text-tertiary-100' : 'text-green-100',
              )}
            >
              {isFree
                ? "You're all set for the event"
                : 'Your ticket has been confirmed'}
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
                A confirmation email has been sent to your registered email
                address.
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-neutral-400">
                <Info className="h-3 w-3" />
                <span>
                  Booking Reference: #
                  {event.id?.slice(0, 8).toUpperCase() || 'N/A'}
                </span>
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
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
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
                    <span>{attendee.name}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-amber-700">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{attendee.email}</span>
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

            {/* Payment Summary — Only for paid events */}
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
                      <span className="font-medium">
                        {formatPrice(event.price)}
                      </span>
                    </div>
                    {event.certificate_price > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">
                          Certificate Fee
                        </span>
                        <span className="font-medium">
                          {formatPrice(event.certificate_price)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-neutral-200 pt-2 flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">
                        Total Paid
                      </span>
                      <span className="font-bold text-green-600">
                        {formatPrice(totalPrice)}
                      </span>
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
                  asChild
                  className="w-full h-12 text-base font-semibold rounded-xl cursor-pointer"
                  variant="outline"
                >
                  <Link href={`/events/${event.slug}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Event Details
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full h-12 text-base font-semibold rounded-xl bg-primary-500 hover:bg-primary-600 cursor-pointer"
                >
                  <Link href="/events">
                    Browse More Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Auto-redirect */}
            <p className="text-xs text-center text-neutral-400">
              Redirecting to events page in {countdown} seconds...
              <Link
                href="/events"
                className="ml-1 text-primary-500 hover:underline cursor-pointer"
              >
                (skip)
              </Link>
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
            <Link
              href="/events"
              className="text-primary-500 hover:underline cursor-pointer"
            >
              Browse all events
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
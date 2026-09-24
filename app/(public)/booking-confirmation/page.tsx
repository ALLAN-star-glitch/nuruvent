// app/(public)/booking-confirmation/page.tsx

'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Calendar,
  ArrowRight,
  Ticket,
  Mail,
  User,
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
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { useGetRegistrationQuery } from '@/lib/store/api/registrationsApi';
import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';

// ============================================================
// HELPERS
// ============================================================

const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${(price / 100).toLocaleString()}`;
};

const formatDateForCalendar = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// ============================================================
// PAGE
// ============================================================

export default function BookingConfirmationPage() {
  const search = useSearchParams();

  const reference = search.get('reference');
  const registrationId = search.get('registration');
  const slug = search.get('slug') ?? '';
  const guestEmail = search.get('email') ?? undefined;

  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    data: regRes,
    isLoading: regLoading,
    isError: regError,
  } = useGetRegistrationQuery(
    { id: registrationId ?? '', guestEmail },
    { skip: !registrationId },
  );

  const {
    data: eventRes,
    isLoading: eventLoading,
    isError: eventError,
  } = useGetEventBySlugQuery(slug, { skip: !slug });

  const registration = regRes?.data;
  const event = eventRes?.data;

  const isLoading = regLoading || eventLoading;
  const isError = regError || eventError || !registration || !event;

  if (!reference || !registrationId || !slug) {
    return (
      <ErrorState
        title="Missing booking information"
        message="This page requires a booking reference. Please check your confirmation email."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !registration || !event) {
    return (
      <ErrorState
        title="Booking not found"
        message="We couldn't load this booking. It may have expired or the link is invalid."
      />
    );
  }

  // ---- Derived values ----
  const total = registration.pricing.total;
  const discount = registration.pricing.discount_total;
  const isFree = total === 0;

  const attendeeName = registration.guest?.name ?? 'Guest';
  const attendeeEmail = registration.guest?.email ?? guestEmail ?? '';

  const eventDate = event.start_date ?? event.schedules?.[0]?.start_date ?? '';
  const eventLocation = event.is_virtual
    ? 'Virtual Event'
    : event.in_person_location || event.venue?.city || 'Location TBD';

  // ---- Handlers ----
  const handlePrint = () => window.print();

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
          text: `I've registered for ${event.display_name || event.name}!`,
          url: window.location.href,
        });
      } catch {
        /* cancelled */
      }
    } else {
      handleCopyLink();
    }
  };

  const handleAddToCalendar = () => {
    if (!eventDate) return;
    const startDate = formatDateForCalendar(eventDate);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 3);
    const endDateStr =
      endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.display_name || event.name,
    )}&dates=${startDate}/${endDateStr}&details=${encodeURIComponent(
      event.description || 'Event',
    )}&location=${encodeURIComponent(eventLocation)}`;

    window.open(calendarUrl, '_blank');
  };

  const handleDownloadTicket = () => {
    alert('Ticket download will be available soon!');
  };

  return (
    <div
      ref={printRef}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Top nav */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Back to Event
          </Link>
          <Badge
            variant="outline"
            className="text-xs border-primary/30 bg-primary/10 text-primary"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        </div>

        <Card className="border-border/60 shadow-xl overflow-hidden bg-card">
          {/* Header banner */}
          <div className="px-6 py-8 sm:py-10 text-center relative bg-gradient-to-r from-primary to-primary/80">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/20 backdrop-blur-sm mb-4">
              <CheckCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              {isFree ? 'Booking Confirmed!' : 'Payment Successful!'}
            </h1>
            <p className="mt-1 text-primary-foreground/80">
              {isFree
                ? "You're all set for the event"
                : 'Your ticket has been confirmed'}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-card rounded-t-3xl" />
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Quick actions */}
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
                    <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
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

            {/* Success message */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                You have successfully registered for{' '}
                <span className="font-semibold text-foreground">
                  {event.display_name || event.name}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                A confirmation email has been sent to{' '}
                <span className="font-medium text-foreground">
                  {attendeeEmail || 'your registered email'}
                </span>
                .
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>
                  Booking Reference: #{registration.registration_number}
                </span>
              </div>
            </div>

            <Separator />

            {/* Event + Attendee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Details
                </h3>
                <div className="space-y-1.5">
                  {eventDate && (
                    <div className="flex items-start gap-2 text-sm text-foreground/80">
                      <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>
                        {new Date(eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {event.is_virtual ? (
                    <div className="flex items-start gap-2 text-sm text-foreground/80">
                      <Video className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>Virtual Event</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-foreground/80">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{eventLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ticket Holder
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{attendeeName}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{attendeeEmail || '—'}</span>
                  </div>
                  {!isFree && (
                    <div className="flex items-start gap-2 text-sm text-foreground/80">
                      <Ticket className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span>Paid: {formatPrice(total)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment summary */}
            {!isFree && (
              <>
                <Separator />
                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Summary
                  </h3>
                  <div className="space-y-2">
                    {registration.selections.map((sel, i) => (
                      <div
                        key={`${sel.ticket_type_id}-${i}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {sel.quantity} × ticket
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice(sel.line_total)}
                        </span>
                      </div>
                    ))}
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-primary">
                          −{formatPrice(discount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Total Paid
                      </span>
                      <span className="font-bold text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-xl cursor-pointer"
              >
                <Link href={`/events/${event.slug}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Event Details
                </Link>
              </Button>
              <Button
                asChild
                className="w-full h-12 text-base font-semibold rounded-xl cursor-pointer"
              >
                <Link href="/events">
                  Browse More Events
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Encouragement (non-intrusive) */}
            <p className="text-xs text-center text-muted-foreground">
              Want to find more events like this?{' '}
              <Link
                href="/events"
                className="text-primary hover:underline cursor-pointer"
              >
                Browse all events
              </Link>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-muted-foreground border-t border-border">
              <span>Secure Booking</span>
              <span className="w-px h-3 bg-border" />
              <span>Powered by Nuruvent</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <Button asChild className="cursor-pointer">
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    </div>
  );
}
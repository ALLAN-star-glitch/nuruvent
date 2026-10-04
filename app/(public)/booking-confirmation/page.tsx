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
  CalendarPlus,
  Info,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  PartyPopper,
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

  const eventTitle = event.display_name || event.name;

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
          title: `Booking Confirmation - ${eventTitle}`,
          text: `I've registered for ${eventTitle}!`,
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
      eventTitle,
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
      className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-background py-10 px-4 sm:px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Top nav */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Back to event
          </Link>
          <Badge
            variant="outline"
            className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        </div>

        <Card className="border-border/60 shadow-2xl overflow-hidden bg-card">
          {/* Header banner */}
          <div className="relative px-6 pt-10 pb-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px),radial-gradient(circle_at_80%_60%,white_1px,transparent_1px)] [background-size:32px_32px]" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/25 backdrop-blur-sm ring-4 ring-background/10 mb-5 shadow-lg">
                {isFree ? (
                  <PartyPopper className="h-10 w-10 text-primary-foreground" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-primary-foreground" />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
                {isFree ? "You're in!" : 'Payment confirmed'}
              </h1>
              <p className="mt-2 text-primary-foreground/85 text-sm sm:text-base max-w-md mx-auto">
                {isFree
                  ? "Your spot is reserved. We can't wait to see you there."
                  : 'Your ticket is locked in — see you at the event.'}
              </p>
            </div>
          </div>

          {/* Ticket stub — the address block overlapping the banner */}
          <div className="relative -mt-10 px-4 sm:px-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Booking reference
                  </p>
                  <p className="font-mono font-semibold text-foreground text-sm sm:text-base mt-0.5 truncate">
                    #{registration.registration_number}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Confirmed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Quick actions */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ActionPill onClick={handlePrint} icon={<Printer className="h-3.5 w-3.5" />} label="Print" />
              <ActionPill onClick={handleAddToCalendar} icon={<CalendarPlus className="h-3.5 w-3.5" />} label="Add to calendar" />
              <ActionPill onClick={handleDownloadTicket} icon={<Download className="h-3.5 w-3.5" />} label="Download" />
              <ActionPill onClick={handleShare} icon={<Share2 className="h-3.5 w-3.5" />} label="Share" />
              <ActionPill
                onClick={handleCopyLink}
                icon={copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                label={copied ? 'Copied' : 'Copy link'}
              />
            </div>

            <Separator />

            {/* Event title — centred, prominent */}
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-semibold text-primary mb-2">
                You&apos;re attending
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {eventTitle}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
                A confirmation email is on its way to{' '}
                <span className="font-medium text-foreground">
                  {attendeeEmail || 'your registered email'}
                </span>
                . Your session join links will be included.
              </p>
            </div>

            <Separator />

            {/* Event + Attendee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoPanel
                icon={<Calendar className="h-4 w-4" />}
                title="Event details"
                items={[
                  {
                    icon: <Calendar className="h-3.5 w-3.5" />,
                    label: eventDate
                      ? new Date(eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Date to be confirmed',
                  },
                  {
                    icon: event.is_virtual ? (
                      <Video className="h-3.5 w-3.5" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    ),
                    label: event.is_virtual ? 'Virtual event' : eventLocation,
                  },
                ]}
              />

              <InfoPanel
                icon={<User className="h-4 w-4" />}
                title="Ticket holder"
                variant="muted"
                items={[
                  {
                    icon: <User className="h-3.5 w-3.5" />,
                    label: attendeeName,
                  },
                  {
                    icon: <Mail className="h-3.5 w-3.5" />,
                    label: attendeeEmail || '—',
                  },
                  ...(!isFree
                    ? [
                        {
                          icon: <Ticket className="h-3.5 w-3.5" />,
                          label: `Paid ${formatPrice(total)}`,
                        },
                      ]
                    : []),
                ]}
              />
            </div>

            {/* Payment summary */}
            {!isFree && (
              <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment summary
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
                      <span className="font-medium text-foreground tabular-nums">
                        {formatPrice(sel.line_total)}
                      </span>
                    </div>
                  ))}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-primary tabular-nums">
                        −{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Total paid
                    </span>
                    <span className="font-bold text-primary tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Primary CTA */}
            <div className="pt-2">
              <Button
                asChild
                className="w-full h-12 text-base font-semibold rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href="/dashboard/registrations?tab=attending">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Go to My Registrations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                <Info className="h-3 w-3" />
                Find your session join links on the registrations page
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs text-muted-foreground border-t border-border">
              <span>Secure booking</span>
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
// SUBCOMPONENTS
// ============================================================

function ActionPill({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-9 text-xs rounded-full cursor-pointer hover:bg-accent"
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </Button>
  );
}

function InfoPanel({
  icon,
  title,
  items,
  variant = 'primary',
}: {
  icon: React.ReactNode;
  title: string;
  items: Array<{ icon: React.ReactNode; label: string }>;
  variant?: 'primary' | 'muted';
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 space-y-3 border',
        variant === 'primary'
          ? 'bg-primary/5 border-primary/10'
          : 'bg-muted/40 border-border',
      )}
    >
      <h3
        className={cn(
          'font-semibold text-sm flex items-center gap-2',
          variant === 'primary' ? 'text-primary' : 'text-foreground',
        )}
      >
        {icon}
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-sm text-foreground/85"
          >
            <span
              className={cn(
                'mt-0.5 flex-shrink-0',
                variant === 'primary' ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {item.icon}
            </span>
            <span className="break-words">{item.label}</span>
          </div>
        ))}
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
          <Link href="/events">Browse events</Link>
        </Button>
      </div>
    </div>
  );
}
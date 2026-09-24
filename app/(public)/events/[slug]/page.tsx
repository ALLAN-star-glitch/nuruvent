/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/events/[slug]/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle,
  CheckCircle2,
  Clock as ClockIcon,
  CreditCard,
  FileText,
  Globe,
  Heart,
  HeartOff,
  Loader2,
  Mail,
  MapPin as MapPinIcon,
  Phone,
  Share2,
  Tag,
  User,
  Users,
  Video,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useRegisterForEventMutation } from '@/lib/store/api/registrationsApi';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectActiveAccount,
  selectIsAuthenticated,
  selectUser,
} from '@/lib/store/slices/authSlice';
import type { Event, Ticket } from '@/lib/types/events';
import type { Registration } from '@/lib/types/registration';
import {
  formatPrice,
  getCertificatePrice,
  getEventDuration,
  getEventFillRate,
  getEventHostName,
  getEventLocation,
  getEventStartTime,
  getSpotsLeft,
  getTimeUntilEvent,
  isEventFullyBooked,
  isEventPast,
  isHostInstitution,
} from '@/lib/utils/eventDisplay';

// ============================================================
// TYPES
// ============================================================

interface GuestForm {
  name: string;
  email: string;
  phone: string;
}

// ============================================================
// TICKET SELECTOR — SINGLE-SELECT RADIO STYLE
// ============================================================

interface TicketSelectorProps {
  tickets: Ticket[];
  selectedTicketTypeId: string | null;
  onSelect: (ticketTypeId: string) => void;
  disabled?: boolean;
}

function TicketSelector({
  tickets,
  selectedTicketTypeId,
  onSelect,
  disabled,
}: TicketSelectorProps) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/40 rounded-xl border border-dashed border-border cursor-default">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>No tickets currently available for this event</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Select a ticket type">
      {tickets.map((ticket) => {
        const type = ticket.ticket_type;
        const typeId = type?.id;
        const isSoldOut = ticket.quantity <= 0;
        const isInactive = !ticket.is_active;
        const isDisabled = disabled || isSoldOut || isInactive || !typeId;
        const isSelected = !!typeId && selectedTicketTypeId === typeId;

        return (
          <div
            key={ticket.id}
            onClick={() => {
              if (typeId && !isDisabled) {
                onSelect(typeId);
              }
            }}
            tabIndex={isDisabled ? -1 : 0}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && typeId && !isDisabled) {
                e.preventDefault();
                onSelect(typeId);
              }
            }}
            className={cn(
              'relative group w-full text-left rounded-xl border p-3.5 transition-all duration-200 outline-none',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30',
              isDisabled
                ? 'opacity-50 cursor-not-allowed bg-muted/20 hover:border-border hover:bg-transparent'
                : 'cursor-pointer'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Radio Icon + Information */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40 group-hover:border-primary/60'
                  )}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground leading-none">
                      {ticket.name}
                    </span>
                    {type?.display_name && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0 font-medium cursor-default"
                      >
                        {type.display_name}
                      </Badge>
                    )}
                  </div>

                  {ticket.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                    <Users className="h-3 w-3 shrink-0" />
                    {isSoldOut ? (
                      <span className="text-destructive font-medium">Sold out</span>
                    ) : isInactive ? (
                      <span>Unavailable</span>
                    ) : (
                      <span>{ticket.quantity} spots available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="text-right shrink-0 pt-0.5">
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(ticket.price)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SKELETON
// ============================================================

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
            <Skeleton className="h-10 w-3/4 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[420px] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: response, isLoading, error } = useGetEventBySlugQuery(slug, {
    skip: !slug,
  });

  const event: Event | undefined = response?.data;

  const user = useAppSelector(selectUser);
  const account = useAppSelector(selectActiveAccount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // ---- Mutation ----
  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();

  // ---- UI state ----
  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [registration, setRegistration] = useState<Registration | null>(null);

  // ---- Explicit Single Ticket State ----
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string | null>(
    null,
  );

  // ---- Guest details ----
  const [guest, setGuest] = useState<GuestForm>({
    name: '',
    email: '',
    phone: '',
  });

  // Prefill guest inputs on auth load
  useEffect(() => {
    if (isAuthenticated) {
      setGuest({
        name: account?.displayName || account?.name || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [isAuthenticated, account, user]);

  // Derive active single ticket & total
  const selectedTicket = useMemo(() => {
    if (!event?.tickets || !selectedTicketTypeId) return null;
    return (
      event.tickets.find((t) => t.ticket_type?.id === selectedTicketTypeId) ?? null
    );
  }, [event, selectedTicketTypeId]);

  const totalPrice = selectedTicket?.price ?? 0;
  const hasSelection = !!selectedTicket;

  const handleSelectTicket = (ticketTypeId: string) => {
    setSelectedTicketTypeId(ticketTypeId);
    setBookingError('');
  };

  const handleShare = async () => {
    if (!event) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.display_name || event.name, url });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch {
        /* share dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch {
        /* clipboard denied */
      }
    }
  };

  // ---- Handle Registration Submission ----
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (!selectedTicketTypeId) {
      setBookingError('Please select a ticket to continue.');
      return;
    }

    if (!isAuthenticated) {
      if (!guest.name.trim() || !guest.email.trim()) {
        setBookingError('Please fill in both your full name and email address.');
        return;
      }
    }

    // Always payload array with exactly 1 quantity for single-selection
    const selections = [
      { ticket_type_id: selectedTicketTypeId, quantity: 1 },
    ];

    try {
      const res = await registerForEvent({
        eventId: event.id,
        body: {
          selections,
          guest: isAuthenticated ? undefined : guest,
        },
      }).unwrap();

      setRegistration(res.data);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Registration failed. Please review your details and try again.';
      setBookingError(msg);
    }
  };

  // ---- Handle Proceed to Payment ----
  const handleProceedToPayment = () => {
    if (!registration || !event) return;

    // For guests, email lives on registration.guest.email.
    // For authenticated users, fall back to the logged-in user's email.
    const email = registration.guest?.email || user?.email || '';
    const emailParam = email
      ? `&email=${encodeURIComponent(email)}`
      : '';

    router.push(
      `/checkout/${event.slug}?registration=${registration.id}${emailParam}`
    );
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  if (isLoading) return <EventDetailSkeleton />;

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            The event you are looking for does not exist, has been made private, or was removed.
          </p>
          <Button onClick={() => router.push('/')} className="cursor-pointer">
            Explore Events
          </Button>
        </div>
      </div>
    );
  }

  const startDate = event.start_date ?? event.schedules?.[0]?.start_date ?? '';
  const startTime = getEventStartTime(event);
  const duration = getEventDuration(event);
  const location = getEventLocation(event);
  const certificatePrice = getCertificatePrice(event);
  const hostName = getEventHostName(event);
  const hostIsInstitution = isHostInstitution(event);
  const isPast = isEventPast(event);
  const isFullyBooked = isEventFullyBooked(event);
  const spotsLeft = getSpotsLeft(event);
  const fillRate = getEventFillRate(event);
  const timeRemaining = getTimeUntilEvent(event);
  const hasCertificate = certificatePrice > 0;
  const capacity = event.capacity ?? 0;
  const attendees = event.current_attendees ?? 0;

  const fullDate = startDate
    ? new Date(startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'TBD';

  const canBook = !isPast && !isFullyBooked;
  const showSuccess = !!registration;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all group cursor-pointer bg-transparent border-0"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium hidden sm:inline">Back to Events</span>
              <span className="font-medium sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 cursor-pointer rounded-full"
                onClick={() => setIsSaved(!isSaved)}
                type="button"
                aria-label="Save Event"
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
                className="h-9 px-3 cursor-pointer rounded-full"
                onClick={handleShare}
                type="button"
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-medium">
                  {isShared ? 'Copied!' : 'Share'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Details Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Banner Media */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-muted shadow-md border border-border/50">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.display_name || event.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 via-muted to-muted/80">
                  <CalendarDays className="h-20 w-20 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {event.is_featured && (
                  <Badge className="bg-amber-500 text-white border-0 px-3 py-1 font-semibold rounded-full shadow-sm">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    Featured
                  </Badge>
                )}
                {event.is_virtual && (
                  <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 px-3 py-1 font-semibold rounded-full shadow-sm">
                    <Video className="h-3.5 w-3.5 mr-1" />
                    Virtual
                  </Badge>
                )}
                {isPast && (
                  <Badge className="bg-black/70 backdrop-blur-sm text-white border-0 px-3 py-1 font-semibold rounded-full">
                    Ended
                  </Badge>
                )}
                {isFullyBooked && !isPast && (
                  <Badge className="bg-destructive/90 backdrop-blur-sm text-white border-0 px-3 py-1 font-semibold rounded-full">
                    Sold Out
                  </Badge>
                )}
              </div>
            </div>

            {/* Header Content */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {event.display_name || event.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {hostIsInstitution ? (
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <User className="h-4 w-4 shrink-0" />
                  )}
                  <span>Hosted by</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    {hostName}
                    {hostIsInstitution && (
                      <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>
                    {event.is_virtual
                      ? 'Virtual Event'
                      : event.is_hybrid
                        ? 'Hybrid Event'
                        : 'In-Person'}
                  </span>
                </div>
                {!isPast && !isFullyBooked && timeRemaining && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <ClockIcon className="h-4 w-4 shrink-0" />
                      <span>{timeRemaining}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { label: 'Date', value: fullDate, icon: CalendarIcon },
                { label: 'Time', value: startTime, icon: ClockIcon },
                { label: 'Location', value: location, icon: MapPinIcon },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm cursor-default"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold truncate text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Event Description */}
            {event.description && (
              <Card className="border-border/60 shadow-sm cursor-default">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <span className="w-1 h-5 rounded-full bg-primary" />
                    About This Event
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Supplemental Footer Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
              {duration && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  <span>Duration: {duration}</span>
                </div>
              )}
              {hasCertificate && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Certificate Fee: {formatPrice(certificatePrice)}</span>
                  </div>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>Ref: #{event.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          {/* Right Sticky Sidebar — Ticket Selection & Registration */}
          <div className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-20">
              <Card className="border-border shadow-xl overflow-hidden bg-card">
                {/* Header Pricing Summary */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {showSuccess ? 'Registration Summary' : 'Select Ticket'}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {formatPrice(totalPrice)}
                    </span>
                    {hasSelection && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        ({selectedTicket?.name})
                      </span>
                    )}
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Capacity & Progress Meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>Attendance</span>
                      </div>
                      <span className="text-foreground font-semibold">
                        {attendees} / {capacity > 0 ? capacity : '∞'}
                      </span>
                    </div>
                    {capacity > 0 && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            fillRate >= 90
                              ? 'bg-destructive'
                              : fillRate >= 70
                                ? 'bg-amber-500'
                                : 'bg-primary'
                          )}
                          style={{ width: `${Math.min(fillRate, 100)}%` }}
                        />
                      </div>
                    )}
                    {spotsLeft !== null && !isPast && !isFullyBooked && (
                      <p className="text-[11px] text-muted-foreground text-right">
                        {spotsLeft} spots remaining
                      </p>
                    )}
                  </div>

                  <Separator />

                  {!canBook ? (
                    <div className="text-center py-6 cursor-default space-y-2">
                      <div className="inline-flex p-3 rounded-full bg-muted/50 text-muted-foreground mb-1">
                        {isPast ? <XCircle className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {isPast
                          ? 'This event has ended'
                          : isFullyBooked
                            ? 'All spots filled'
                            : 'Registration closed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stay tuned for future sessions or upcoming events.
                      </p>
                    </div>
                  ) : showSuccess ? (
                    // ---- SUCCESS STATE ----
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <span>Registration Created</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Status:{' '}
                          <span className="font-medium text-foreground">
                            {registration.status.display_name}
                          </span>
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          Ref #{registration.registration_number}
                        </p>
                      </div>

                      {totalPrice > 0 ? (
                        <Button
                          onClick={handleProceedToPayment}
                          className="w-full h-11 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Proceed to Checkout
                        </Button>
                      ) : (
                        <p className="text-xs text-center text-muted-foreground py-2">
                          Free registration confirmed. We sent your confirmation pass to your email!
                        </p>
                      )}
                    </div>
                  ) : (
                    // ---- FORM REGISTRATION ----
                    <form onSubmit={handleRegister} className="space-y-4">
                      {bookingError && (
                        <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{bookingError}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          1. Select Ticket
                        </Label>
                        <TicketSelector
                          tickets={event.tickets ?? []}
                          selectedTicketTypeId={selectedTicketTypeId}
                          onSelect={handleSelectTicket}
                          disabled={isRegistering}
                        />
                      </div>

                      {/* Guest or Account Info Block */}
                      {hasSelection && (
                        <div className="space-y-3 pt-2">
                          <Separator />
                          <Label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                            2. Attendee Information
                          </Label>

                          {isAuthenticated ? (
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                              <User className="h-4 w-4 text-primary shrink-0" />
                              <div className="min-w-0 text-xs">
                                <p className="font-medium text-foreground truncate">
                                  {account?.displayName || account?.name || user?.name}
                                </p>
                                <p className="text-muted-foreground truncate">{user?.email}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label htmlFor="guestName" className="text-xs">
                                  Full Name <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input
                                    id="guestName"
                                    value={guest.name}
                                    onChange={(e) =>
                                      setGuest({ ...guest, name: e.target.value })
                                    }
                                    placeholder="Jane Doe"
                                    className="pl-9 h-10 text-xs rounded-lg"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor="guestEmail" className="text-xs">
                                  Email Address <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input
                                    id="guestEmail"
                                    type="email"
                                    value={guest.email}
                                    onChange={(e) =>
                                      setGuest({ ...guest, email: e.target.value })
                                    }
                                    placeholder="jane@example.com"
                                    className="pl-9 h-10 text-xs rounded-lg"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor="guestPhone" className="text-xs">
                                  Phone Number (Optional)
                                </Label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input
                                    id="guestPhone"
                                    type="tel"
                                    value={guest.phone}
                                    onChange={(e) =>
                                      setGuest({ ...guest, phone: e.target.value })
                                    }
                                    placeholder="+254 700 000 000"
                                    className="pl-9 h-10 text-xs rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            type="submit"
                            disabled={isRegistering || !selectedTicketTypeId}
                            className="w-full h-11 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer mt-2"
                          >
                            {isRegistering ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              'Complete Registration'
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
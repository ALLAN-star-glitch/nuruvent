/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/events/[slug]/_components/EventDetailClient.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Calendar as CalendarIcon,
  CalendarDays,
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
  UserPlus,
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
import { cn } from '@/lib/utils';

import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useRegisterForEventMutation } from '@/lib/store/api/registrationsApi';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectActiveAccount,
  selectIsAuthenticated,
  selectUser,
} from '@/lib/store/slices/authSlice';
import type { Event } from '@/lib/types/events';
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

import { TicketSelector } from './TicketSelector';
import { EventDetailSkeleton } from './EventDetailSkeleton';
import { GuestEmailDialog } from './GuestEmailDialog';

// ============================================================
// TYPES
// ============================================================

interface GuestForm {
  name: string;
  email: string;
  phone: string;
}

type AuthMode = 'choice' | 'guest-form';

interface Props {
  slug: string;
}

// ============================================================
// HELPERS
// ============================================================

function getMinTicketPrice(event: Event): number {
  const tickets = event.tickets ?? [];
  const active = tickets.filter((t) => t.is_active && t.quantity > 0);
  if (active.length === 0) return 0;
  return Math.min(...active.map((t) => t.price));
}

// ============================================================
// COMPONENT
// ============================================================

export function EventDetailClient({ slug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ticketParam = searchParams.get('ticket');
  const autorunParam = searchParams.get('autorun') === '1';

  const {
    data: response,
    isLoading,
    error,
  } = useGetEventBySlugQuery(slug, { skip: !slug });

  const event: Event | undefined = response?.data;

  const user = useAppSelector(selectUser);
  const account = useAppSelector(selectActiveAccount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();

  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [registration, setRegistration] = useState<Registration | null>(null);

  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    string | null
  >(null);

  const [guest, setGuest] = useState<GuestForm>({
    name: '',
    email: '',
    phone: '',
  });

  // For anonymous users: choice first, then guest form on demand.
  const [authMode, setAuthMode] = useState<AuthMode>('choice');

  // Free-event email confirmation dialog.
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  // Mobile sticky CTA state.
  const ticketCardRef = useRef<HTMLDivElement | null>(null);
  const [showMobileCta, setShowMobileCta] = useState(false);

  // Guards against re-running the autorun on every render.
  const autorunFiredRef = useRef(false);

  // ---- Prefill guest inputs on auth load ----
  useEffect(() => {
    if (isAuthenticated) {
      setGuest({
        name: account?.displayName || account?.name || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [isAuthenticated, account, user]);

  // ---- Preselect ticket from URL ----
  useEffect(() => {
    if (!ticketParam || !event?.tickets) return;
    const match = event.tickets.find(
      (t) => t.ticket_type?.id === ticketParam,
    );
    if (match) {
      setSelectedTicketTypeId(ticketParam);
    }
  }, [ticketParam, event]);

  // ---- Watch ticket card for the sticky mobile CTA ----
  useEffect(() => {
    const node = ticketCardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowMobileCta(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [event]);

  const selectedTicket = useMemo(() => {
    if (!event?.tickets || !selectedTicketTypeId) return null;
    return (
      event.tickets.find(
        (t) => t.ticket_type?.id === selectedTicketTypeId,
      ) ?? null
    );
  }, [event, selectedTicketTypeId]);

  const totalPrice = selectedTicket?.price ?? 0;
  const hasSelection = !!selectedTicket;

  const handleSelectTicket = (ticketTypeId: string) => {
    setSelectedTicketTypeId(ticketTypeId);
    setBookingError('');
  };

  // ---- Share ----
  const handleShare = async () => {
    if (!event) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.display_name || event.name,
          url,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch {
        /* dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 3000);
      } catch {
        /* denied */
      }
    }
  };

  // ---- Registration submission (shared by guest and authenticated) ----
  const submitRegistration = async () => {
    if (!event) return;
    if (!selectedTicketTypeId) {
      setBookingError('Please select a ticket to continue.');
      return;
    }
    if (!isAuthenticated) {
      if (!guest.name.trim() || !guest.email.trim()) {
        setBookingError(
          'Please fill in both your full name and email address.',
        );
        return;
      }
    }

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

      // Paid events go straight to checkout.
      if (totalPrice > 0) {
        const email =
          res.data.guest?.email || user?.email || guest.email || '';
        const emailParam = email
          ? `&email=${encodeURIComponent(email)}`
          : '';
        router.push(
          `/checkout/${event.slug}?registration=${res.data.id}${emailParam}`,
        );
        return;
      }

      // Free events show the email dialog.
      setIsEmailDialogOpen(true);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Registration failed. Please review your details and try again.';
      setBookingError(msg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRegistration();
  };

  // ---- Autorun after returning from signup ----
  useEffect(() => {
    if (!autorunParam) return;
    if (!isAuthenticated) return;
    if (!selectedTicketTypeId) return;
    if (registration) return;
    if (isRegistering) return;
    if (autorunFiredRef.current) return;

    autorunFiredRef.current = true;

    // Clear the autorun flag from the URL so a refresh doesn't resubmit.
    const cleanUrl = `/events/${slug}?ticket=${selectedTicketTypeId}`;
    router.replace(cleanUrl);

    // Fire-and-forget; errors are shown inline.
    void submitRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autorunParam,
    isAuthenticated,
    selectedTicketTypeId,
    registration,
    isRegistering,
  ]);

  // ---- Back ----
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  const scrollToTicketCard = () => {
    ticketCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // ---- Create account handler ----
  const handleCreateAccount = () => {
    if (!selectedTicketTypeId) return;
    const returnTo = `/events/${slug}?ticket=${selectedTicketTypeId}&autorun=1`;
    router.push(`/signup?next=${encodeURIComponent(returnTo)}`);
  };

  // ---- Continue as guest ----
  const handleContinueAsGuest = () => {
    setAuthMode('guest-form');
    // Give the reveal a beat, then scroll the user to the card.
    setTimeout(() => scrollToTicketCard(), 50);
  };

  if (isLoading) return <EventDetailSkeleton />;

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Event Not Found</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            The event you are looking for does not exist, has been made
            private, or was removed.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="cursor-pointer"
          >
            Explore Events
          </Button>
        </div>
      </div>
    );
  }

  const startDate =
    event.start_date ?? event.schedules?.[0]?.start_date ?? '';
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
      {/* Top Bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between sm:h-16">
            <button
              onClick={handleBack}
              className="group inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent text-sm text-muted-foreground transition-all hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden font-medium sm:inline">
                Back to Events
              </span>
              <span className="font-medium sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 cursor-pointer rounded-full p-0"
                onClick={() => setIsSaved(!isSaved)}
                type="button"
                aria-label="Save Event"
              >
                {isSaved ? (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                ) : (
                  <HeartOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 cursor-pointer rounded-full px-3"
                onClick={handleShare}
                type="button"
              >
                <Share2 className="mr-1.5 h-4 w-4" />
                <span className="text-xs font-medium">
                  {isShared ? 'Copied!' : 'Share'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:py-12 lg:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {/* Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-md sm:aspect-[21/9]">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.display_name || event.name}
                  unoptimized
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted/80">
                  <CalendarDays className="h-20 w-20 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                {event.is_featured && (
                  <Badge className="rounded-full border-0 bg-amber-500 px-3 py-1 font-semibold text-white shadow-sm">
                    <Award className="mr-1 h-3.5 w-3.5" />
                    Featured
                  </Badge>
                )}
                {event.is_virtual && (
                  <Badge className="rounded-full border-0 bg-primary/90 px-3 py-1 font-semibold text-primary-foreground shadow-sm backdrop-blur-sm">
                    <Video className="mr-1 h-3.5 w-3.5" />
                    Virtual
                  </Badge>
                )}
                {isPast && (
                  <Badge className="rounded-full border-0 bg-black/70 px-3 py-1 font-semibold text-white backdrop-blur-sm">
                    Ended
                  </Badge>
                )}
                {isFullyBooked && !isPast && (
                  <Badge className="rounded-full border-0 bg-destructive/90 px-3 py-1 font-semibold text-white backdrop-blur-sm">
                    Sold Out
                  </Badge>
                )}
              </div>
            </div>

            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {event.display_name || event.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {hostIsInstitution ? (
                    <Building2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <User className="h-4 w-4 shrink-0" />
                  )}
                  <span>Hosted by</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {hostName}
                    {hostIsInstitution && (
                      <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </span>
                </div>
                <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
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
                    <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                      <ClockIcon className="h-4 w-4 shrink-0" />
                      <span>{timeRemaining}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {[
                { label: 'Date', value: fullDate, icon: CalendarIcon },
                { label: 'Time', value: startTime, icon: ClockIcon },
                { label: 'Location', value: location, icon: MapPinIcon },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm"
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Description */}
            {event.description && (
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="h-5 w-1 rounded-full bg-primary" />
                    About This Event
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Footer Meta */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              {duration && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  <span>Duration: {duration}</span>
                </div>
              )}
              {hasCertificate && (
                <>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>
                      Certificate Fee: {formatPrice(certificatePrice)}
                    </span>
                  </div>
                </>
              )}
              <span className="h-1 w-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>Ref: #{event.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div ref={ticketCardRef} className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-35">
              <Card className="overflow-hidden border-border bg-card shadow-xl">
                {/* Pricing Summary */}
                <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {showSuccess ? 'Registration Summary' : 'Select Ticket'}
                  </p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {formatPrice(totalPrice)}
                    </span>
                    {hasSelection && (
                      <span className="max-w-[150px] truncate text-xs text-muted-foreground">
                        ({selectedTicket?.name})
                      </span>
                    )}
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  {/* Capacity meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>Attendance</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {attendees} / {capacity > 0 ? capacity : '∞'}
                      </span>
                    </div>
                    {capacity > 0 && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            fillRate >= 90
                              ? 'bg-destructive'
                              : fillRate >= 70
                                ? 'bg-amber-500'
                                : 'bg-primary',
                          )}
                          style={{ width: `${Math.min(fillRate, 100)}%` }}
                        />
                      </div>
                    )}
                    {spotsLeft !== null && !isPast && !isFullyBooked && (
                      <p className="text-right text-[11px] text-muted-foreground">
                        {spotsLeft} spots remaining
                      </p>
                    )}
                  </div>

                  <Separator />

                  {!canBook ? (
                    <div className="space-y-2 py-6 text-center">
                      <div className="mb-1 inline-flex rounded-full bg-muted/50 p-3 text-muted-foreground">
                        {isPast ? (
                          <XCircle className="h-6 w-6" />
                        ) : (
                          <Users className="h-6 w-6" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground">
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
                    <div className="space-y-4">
                      <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <span>Registration Created</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Status:{' '}
                          <span className="font-medium text-foreground">
                            {registration.status.display_name}
                          </span>
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          Ref #{registration.registration_number}
                        </p>
                      </div>

                      {totalPrice > 0 ? (
                        <Button
                          onClick={() => {
                            const email =
                              registration.guest?.email ||
                              user?.email ||
                              guest.email ||
                              '';
                            const emailParam = email
                              ? `&email=${encodeURIComponent(email)}`
                              : '';
                            router.push(
                              `/checkout/${event.slug}?registration=${registration.id}${emailParam}`,
                            );
                          }}
                          className="h-11 w-full cursor-pointer rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Checkout
                        </Button>
                      ) : (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          Free registration confirmed. We sent your
                          confirmation pass to your email!
                        </p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      {bookingError && (
                        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{bookingError}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                          1. Select Ticket
                        </Label>
                        <TicketSelector
                          tickets={event.tickets ?? []}
                          selectedTicketTypeId={selectedTicketTypeId}
                          onSelect={handleSelectTicket}
                          disabled={isRegistering}
                        />
                      </div>

                      {hasSelection && (
                        <>
                          {/* Signed-in path */}
                          {isAuthenticated ? (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                                  2. Attendee Information
                                </Label>
                                <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-3">
                                  <User className="h-4 w-4 shrink-0 text-primary" />
                                  <div className="min-w-0 text-xs">
                                    <p className="truncate font-medium text-foreground">
                                      {account?.displayName ||
                                        account?.name ||
                                        user?.name}
                                    </p>
                                    <p className="truncate text-muted-foreground">
                                      {user?.email}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Button
                                type="submit"
                                disabled={
                                  isRegistering || !selectedTicketTypeId
                                }
                                className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                              >
                                {isRegistering ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registering...
                                  </>
                                ) : (
                                  'Complete Registration'
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Anonymous: choice or guest form */}
                              {authMode === 'choice' ? (
                                <>
                                  <Separator />
                                  <div className="space-y-2 pt-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                                      2. Continue as
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Create an account to manage your
                                      tickets, or continue as a guest — no
                                      signup required.
                                    </p>
                                  </div>

                                  <div className="space-y-2 pt-1">
                                    <Button
                                      type="button"
                                      onClick={handleCreateAccount}
                                      disabled={!selectedTicketTypeId}
                                      className="h-11 w-full cursor-pointer rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                    >
                                      <UserPlus className="mr-2 h-4 w-4" />
                                      Create an account
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={handleContinueAsGuest}
                                      disabled={!selectedTicketTypeId}
                                      className="h-11 w-full cursor-pointer rounded-xl font-medium"
                                    >
                                      Continue as guest
                                    </Button>

                                    <p className="pt-2 text-center text-[11px] text-muted-foreground">
                                      Already have an account?{' '}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const returnTo = `/events/${slug}?ticket=${selectedTicketTypeId}&autorun=1`;
                                          router.push(
                                            `/signin?next=${encodeURIComponent(returnTo)}`,
                                          );
                                        }}
                                        className="font-medium text-primary underline-offset-2 hover:underline"
                                      >
                                        Sign in
                                      </button>
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Separator />
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                                        2. Attendee Information
                                      </Label>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAuthMode('choice')
                                        }
                                        className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                                      >
                                        Back
                                      </button>
                                    </div>

                                    <div className="space-y-1">
                                      <Label
                                        htmlFor="guestName"
                                        className="text-xs"
                                      >
                                        Full Name{' '}
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      </Label>
                                      <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          id="guestName"
                                          value={guest.name}
                                          onChange={(e) =>
                                            setGuest({
                                              ...guest,
                                              name: e.target.value,
                                            })
                                          }
                                          placeholder="Jane Doe"
                                          className="h-10 rounded-lg pl-9 text-xs"
                                          required
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <Label
                                        htmlFor="guestEmail"
                                        className="text-xs"
                                      >
                                        Email Address{' '}
                                        <span className="text-destructive">
                                          *
                                        </span>
                                      </Label>
                                      <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          id="guestEmail"
                                          type="email"
                                          value={guest.email}
                                          onChange={(e) =>
                                            setGuest({
                                              ...guest,
                                              email: e.target.value,
                                            })
                                          }
                                          placeholder="jane@example.com"
                                          className="h-10 rounded-lg pl-9 text-xs"
                                          required
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <Label
                                        htmlFor="guestPhone"
                                        className="text-xs"
                                      >
                                        Phone Number (Optional)
                                      </Label>
                                      <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          id="guestPhone"
                                          type="tel"
                                          value={guest.phone}
                                          onChange={(e) =>
                                            setGuest({
                                              ...guest,
                                              phone: e.target.value,
                                            })
                                          }
                                          placeholder="+254 700 000 000"
                                          className="h-10 rounded-lg pl-9 text-xs"
                                        />
                                      </div>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground">
                                      We&apos;ll email your ticket and join
                                      links to this address.
                                    </p>
                                  </div>

                                  <Button
                                    type="submit"
                                    disabled={
                                      isRegistering || !selectedTicketTypeId
                                    }
                                    className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                  >
                                    {isRegistering ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                      </>
                                    ) : (
                                      'Complete Registration'
                                    )}
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {showMobileCta && canBook && !showSuccess && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="container mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {hasSelection ? 'Selected' : 'Starting at'}
              </p>
              <p className="truncate text-base font-bold text-foreground">
                {formatPrice(
                  hasSelection ? totalPrice : getMinTicketPrice(event),
                )}
              </p>
            </div>
            <Button
              onClick={scrollToTicketCard}
              className="h-11 shrink-0 cursor-pointer rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {hasSelection ? 'Continue' : 'Get Ticket'}
            </Button>
          </div>
        </div>
      )}

      {/* Free-event registration — check email dialog */}
      <GuestEmailDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={guest.email || user?.email || registration?.guest?.email || ''}
        eventName={event.display_name || event.name}
        registrationNumber={registration?.registration_number}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
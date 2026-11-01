/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/events/[slug]/_components/EventDetailClient.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectActiveAccount,
  selectIsAuthenticated,
  selectUser,
} from '@/lib/store/slices/authSlice';
import type { Event } from '@/lib/types/events';
import {
  formatEventDateSummary,
  getEventDuration,
  getEventFillRate,
  getEventHostName,
  getEventLocation,
  getEventLongDateLabel,
  getEventTimeRange,
  getSpotsLeft,
  getTimeUntilEvent,
  isEventFullyBooked,
  isEventPast,
  isHostInstitution,
} from '@/lib/utils/eventDisplay';

import { DetailTopBar } from './DetailTopBar';
import { DetailBanner } from './DetailBanner';
import { DetailHeader } from './DetailHeader';
import { DetailKeyInfo } from './DetailKeyInfo';
import { DetailRecurringStrip } from './DetailRecurringStrip';
import { DetailDescription } from './DetailDescription';
import { DetailFooterMeta } from './DetailFooterMeta';
import { DetailMobileCTA } from './DetailMobileCTA';
import { TicketSidebar } from './TicketSidebar';
import { EventDetailSkeleton } from './EventDetailSkeleton';
import { GuestEmailDialog } from './GuestEmailDialog';
import { useEventRegistration } from './useEventRegistration';

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

interface Props {
  slug: string;
  initialEvent?: Event | null;
}

export function EventDetailClient({ slug, initialEvent }: Props) {
  const router = useRouter();

  const {
    data: response,
    isLoading,
    error,
  } = useGetEventBySlugQuery(slug, { skip: !slug });

  const event: Event | undefined = response?.data || initialEvent || undefined;

  const user = useAppSelector(selectUser);
  const account = useAppSelector(selectActiveAccount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { data: teamsData } = useGetUserTeamsQuery();

  const ticketCardRef = useRef<HTMLDivElement | null>(null);
  const [showMobileCta, setShowMobileCta] = useState(false);

  // Scroll-to-tickets helper, defined before the hook so the guest flow
  // can invoke it after switching to the form.
  const scrollToTicketCard = () => {
    ticketCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const {
    selectedTicketTypeId,
    selectedTicket,
    totalPrice,
    hasSelection,
    guest,
    authMode,
    isEmailDialogOpen,
    registration,
    bookingError,
    isRegistering,
    setGuest,
    setIsEmailDialogOpen,
    handleSelectTicket,
    handleRegister,
    handleContinueAsGuest,
    handleCreateAccount,
    backToChoice,
  } = useEventRegistration(event, slug, () => {
    setTimeout(scrollToTicketCard, 50);
  });

  const owningTeam = useMemo(
    () => teamsData?.teams?.find((t) => t.id === event?.team_id) ?? null,
    [teamsData, event?.team_id],
  );

  const ticketsHref =
    owningTeam && event?.team_id
      ? `/dashboard/${owningTeam.account_id}/${event.team_id}/tickets`
      : '/dashboard/tickets';

  // Observe the sidebar; toggle mobile sticky CTA when out of view.
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

  // --- early returns ---
  if (isLoading && !event) return <EventDetailSkeleton />;

  if ((error || !event) && !event) {
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

  // --- derived display data ---
  const dateLabel = getEventLongDateLabel(event);
  const dateSummary = formatEventDateSummary(event);
  const timeRange = getEventTimeRange(event);
  const duration = getEventDuration(event);
  const location = getEventLocation(event);
  const hostName = getEventHostName(event);
  const hostIsInstitution = isHostInstitution(event);
  const isPast = isEventPast(event);
  const isFullyBooked = isEventFullyBooked(event);
  const spotsLeft = getSpotsLeft(event);
  const fillRate = getEventFillRate(event);
  const timeRemaining = getTimeUntilEvent(event);
  const hasCertificate = event.certificate_enabled === true;
  const capacity = event.capacity ?? 0;
  const attendees = event.current_attendees ?? 0;
  const isRange = event.is_recurring || event.is_multi_day;
  const canBook = !isPast && !isFullyBooked;
  const showSuccess = !!registration;
  const minTicketPrice = getMinTicketPrice(event);

  const attendeeName =
    account?.displayName || account?.name || user?.name || '';
  const attendeeEmail = user?.email || '';

  const handleSignIn = () => {
    const returnTo = `/events/${slug}?ticket=${selectedTicketTypeId}&autorun=1`;
    router.push(`/signin?next=${encodeURIComponent(returnTo)}`);
  };

  const handleProceedToCheckout = () => {
    if (!registration) return;
    const email =
      registration.guest?.email || user?.email || guest.email || '';
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';
    router.push(
      `/checkout/${event.slug}?registration=${registration.id}${emailParam}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DetailTopBar shareTitle={event.display_name || event.name} />

      <div className="container mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:py-12 lg:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            <DetailBanner
              imageUrl={event.image_url}
              title={event.display_name || event.name}
              isFeatured={event.is_featured}
              isRecurring={event.is_recurring}
              isVirtual={event.is_virtual}
              isPast={isPast}
              isFullyBooked={isFullyBooked}
            />

            <DetailHeader
              title={event.display_name || event.name}
              hostName={hostName}
              hostIsInstitution={hostIsInstitution}
              isVirtual={event.is_virtual}
              isHybrid={event.is_hybrid}
              isPast={isPast}
              isFullyBooked={isFullyBooked}
              timeRemaining={timeRemaining}
            />

            <DetailKeyInfo
              isRange={isRange}
              dateLabel={dateLabel}
              timeRange={timeRange}
              location={location}
            />

            {isRange && (
              <DetailRecurringStrip
                dateSummary={dateSummary}
                recurrence={event.recurrence}
                isRecurring={event.is_recurring}
              />
            )}

            <DetailDescription description={event.description} />

            <DetailFooterMeta
              duration={duration}
              hasCertificate={hasCertificate}
              eventId={event.id}
            />
          </div>

          {/* Right column */}
          <TicketSidebar
            ref={ticketCardRef}
            event={event}
            totalPrice={totalPrice}
            hasSelection={hasSelection}
            selectedTicketName={selectedTicket?.name ?? null}
            capacity={capacity}
            attendees={attendees}
            fillRate={fillRate}
            spotsLeft={spotsLeft}
            isPast={isPast}
            isFullyBooked={isFullyBooked}
            canBook={canBook}
            selectedTicketTypeId={selectedTicketTypeId}
            isRegistering={isRegistering}
            isAuthenticated={isAuthenticated}
            authMode={authMode}
            guest={guest}
            bookingError={bookingError}
            registration={registration}
            attendeeName={attendeeName}
            attendeeEmail={attendeeEmail}
            onSelectTicket={handleSelectTicket}
            onSubmit={handleRegister}
            onContinueAsGuest={handleContinueAsGuest}
            onBackToChoice={backToChoice}
            setGuest={setGuest}
            onSignIn={handleSignIn}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>
      </div>

      {showMobileCta && canBook && !showSuccess && (
        <DetailMobileCTA
          hasSelection={hasSelection}
          totalPrice={totalPrice}
          minTicketPrice={minTicketPrice}
          onScrollToTickets={scrollToTicketCard}
        />
      )}

      <GuestEmailDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        email={guest.email || user?.email || registration?.guest?.email || ''}
        eventName={event.display_name || event.name}
        registrationNumber={registration?.registration_number}
        isAuthenticated={isAuthenticated}
        ticketsHref={ticketsHref}
      />
    </div>
  );
}
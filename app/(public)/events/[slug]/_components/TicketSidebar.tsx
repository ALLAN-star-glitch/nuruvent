// app/(public)/events/[slug]/_components/TicketSidebar.tsx

'use client';

import { forwardRef } from 'react';
import { Users, Video, XCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/eventDisplay';
import type { Event } from '@/lib/types/events';
import type { Registration } from '@/lib/types/registration';

import { RegistrationSuccess } from './RegistrationSuccess';
import { TicketForm } from './TicketForm';
import type {
  AuthMode,
  GuestForm,
} from './useEventRegistration';

interface TicketSidebarProps {
  event: Event;
  totalPrice: number;
  hasSelection: boolean;
  selectedTicketName: string | null;
  capacity: number;
  attendees: number;
  fillRate: number;
  spotsLeft: number | null;
  isPast: boolean;
  isFullyBooked: boolean;
  canBook: boolean;
  selectedTicketTypeId: string | null;
  isRegistering: boolean;
  isAuthenticated: boolean;
  authMode: AuthMode;
  guest: GuestForm;
  bookingError: string;
  registration: Registration | null;
  attendeeName: string;
  attendeeEmail: string;
  onSelectTicket: (ticketTypeId: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onContinueAsGuest: () => void;
  onBackToChoice: () => void;
  setGuest: React.Dispatch<React.SetStateAction<GuestForm>>;
  onSignIn: () => void;
  onProceedToCheckout: () => void;
}

/**
 * The right-hand ticket card: price header, capacity meter, and either
 * the registration form or the post-registration success block.
 *
 * Forwards a ref to the outer wrapper so the parent can observe it
 * with an IntersectionObserver (mobile sticky CTA visibility).
 */
export const TicketSidebar = forwardRef<HTMLDivElement, TicketSidebarProps>(
  function TicketSidebar(
    {
      event,
      totalPrice,
      hasSelection,
      selectedTicketName,
      capacity,
      attendees,
      fillRate,
      spotsLeft,
      isPast,
      isFullyBooked,
      canBook,
      selectedTicketTypeId,
      isRegistering,
      isAuthenticated,
      authMode,
      guest,
      bookingError,
      registration,
      attendeeName,
      attendeeEmail,
      onSelectTicket,
      onSubmit,
      onContinueAsGuest,
      onBackToChoice,
      setGuest,
      onSignIn,
      onProceedToCheckout,
    },
    ref,
  ) {
    const showSuccess = !!registration;
    const registrationEnabled = event.registration_enabled !== false;

    // Resolve the join URL for open-access events. Prefer event-level,
    // fall back to the first schedule.
    const directJoinUrl =
      event.zoom_link ||
      event.meet_link ||
      event.schedules?.[0]?.zoom_link ||
      event.schedules?.[0]?.meet_link ||
      '';

    // Header label adapts to the mode.
    const headerLabel = showSuccess
      ? 'Registration Summary'
      : !registrationEnabled
        ? 'Join Event'
        : 'Select Ticket';

    return (
      <div ref={ref} className="lg:col-span-1">
        <div className="space-y-4 lg:sticky lg:top-35">
          <Card className="overflow-hidden border-border bg-card shadow-xl">
            {/* Header */}
            <div className="border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {headerLabel}
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {registrationEnabled ? formatPrice(totalPrice) : 'Open'}
                </span>
                {registrationEnabled && hasSelection && selectedTicketName && (
                  <span className="max-w-[150px] truncate text-xs text-muted-foreground">
                    ({selectedTicketName})
                  </span>
                )}
                {!registrationEnabled && (
                  <span className="text-xs text-muted-foreground">
                    No registration required
                  </span>
                )}
              </div>
            </div>

            <CardContent className="space-y-4 p-5">
              {/* Capacity meter — only shown when registration is on */}
              {registrationEnabled && (
                <>
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
                </>
              )}

              {/* Branch: ended / open-access / success / form */}
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
              ) : !registrationEnabled ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Open Access Event
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No registration required. Use the button below to join
                      the session directly.
                    </p>
                  </div>
                  {directJoinUrl ? (
                    <a
                      href={directJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      The meeting link will be available closer to the event.
                    </p>
                  )}
                </div>
              ) : showSuccess ? (
                <RegistrationSuccess
                  registration={registration!}
                  totalPrice={totalPrice}
                  onProceedToCheckout={onProceedToCheckout}
                />
              ) : (
                <TicketForm
                  event={event}
                  selectedTicketTypeId={selectedTicketTypeId}
                  hasSelection={hasSelection}
                  isRegistering={isRegistering}
                  isAuthenticated={isAuthenticated}
                  authMode={authMode}
                  guest={guest}
                  bookingError={bookingError}
                  attendeeName={attendeeName}
                  attendeeEmail={attendeeEmail}
                  onSelectTicket={onSelectTicket}
                  onSubmit={onSubmit}
                  onContinueAsGuest={onContinueAsGuest}
                  onBackToChoice={onBackToChoice}
                  setGuest={setGuest}
                  onSignIn={onSignIn}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
);
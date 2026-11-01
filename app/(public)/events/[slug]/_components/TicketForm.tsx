// app/(public)/events/[slug]/_components/TicketForm.tsx

'use client';

import { AlertCircle, Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Event } from '@/lib/types/events';

import { TicketSelector } from './TicketSelector';
import { GuestAttendeeForm } from './GuestAttendeeForm';
import type {
  AuthMode,
  GuestForm,
} from './useEventRegistration';

interface TicketFormProps {
  event: Event;
  selectedTicketTypeId: string | null;
  hasSelection: boolean;
  isRegistering: boolean;
  isAuthenticated: boolean;
  authMode: AuthMode;
  guest: GuestForm;
  bookingError: string;
  attendeeName: string;
  attendeeEmail: string;
  /** Called when a ticket is selected from the list. */
  onSelectTicket: (ticketTypeId: string) => void;
  /** Form submit handler (authenticated or guest path). */
  onSubmit: (e: React.FormEvent) => Promise<void>;
  /** Switches authMode to guest-form and scrolls the card into view. */
  onContinueAsGuest: () => void;
  /** Switches back to authMode: 'choice'. */
  onBackToChoice: () => void;
  /** Updates the guest form fields. */
  setGuest: React.Dispatch<React.SetStateAction<GuestForm>>;
  /** Navigates to /signin with a return-to URL. */
  onSignIn: () => void;
}

/**
 * The ticket-purchase form. Renders three shapes based on auth state
 * and the user's choice:
 *
 *   1. No ticket selected → only the ticket list
 *   2. Authenticated      → list + attendee card + submit
 *   3. Guest, choice mode → list + "Continue" + sign-in link
 *   4. Guest, form mode   → list + guest fields + submit
 */
export function TicketForm({
  event,
  selectedTicketTypeId,
  hasSelection,
  isRegistering,
  isAuthenticated,
  authMode,
  guest,
  bookingError,
  attendeeName,
  attendeeEmail,
  onSelectTicket,
  onSubmit,
  onContinueAsGuest,
  onBackToChoice,
  setGuest,
  onSignIn,
}: TicketFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          onSelect={onSelectTicket}
          disabled={isRegistering}
        />
      </div>

      {!hasSelection ? null : isAuthenticated ? (
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
                  {attendeeName}
                </p>
                <p className="truncate text-muted-foreground">
                  {attendeeEmail}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isRegistering || !selectedTicketTypeId}
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
          {authMode === 'choice' ? (
            <>
              <Separator />
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    2. Attendee Information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No account needed. We&apos;ll send your ticket and join
                    links straight to your email.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={onContinueAsGuest}
                  disabled={!selectedTicketTypeId}
                  className="h-11 w-full cursor-pointer rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Continue
                </Button>

                <p className="pt-2 text-center text-[11px] text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onSignIn}
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
              <GuestAttendeeForm
                guest={guest}
                onChange={setGuest}
                onBack={onBackToChoice}
              />
              <Button
                type="submit"
                disabled={isRegistering || !selectedTicketTypeId}
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
    </form>
  );
}
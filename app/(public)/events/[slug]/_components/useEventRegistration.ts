/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/events/[slug]/_components/useEventRegistration.ts

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useRegisterForEventMutation } from '@/lib/store/api/registrationsApi';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectActiveAccount,
  selectIsAuthenticated,
  selectUser,
} from '@/lib/store/slices/authSlice';
import type { Event } from '@/lib/types/events';
import type { Registration } from '@/lib/types/registration';

// ============================================================
// TYPES
// ============================================================

export interface GuestForm {
  name: string;
  email: string;
  phone: string;
}

export type AuthMode = 'choice' | 'guest-form';

export interface UseEventRegistrationResult {
  // state
  selectedTicketTypeId: string | null;
  selectedTicket: Event['tickets'] extends (infer T)[] | undefined ? T | null : never;
  totalPrice: number;
  hasSelection: boolean;
  guest: GuestForm;
  authMode: AuthMode;
  isEmailDialogOpen: boolean;
  registration: Registration | null;
  bookingError: string;
  isRegistering: boolean;

  // setters
  setGuest: React.Dispatch<React.SetStateAction<GuestForm>>;
  setIsEmailDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // handlers
  handleSelectTicket: (ticketTypeId: string) => void;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  handleContinueAsGuest: () => void;
  handleCreateAccount: () => void;
  backToChoice: () => void;
}

// ============================================================
// HOOK
// ============================================================

/**
 * Owns the entire registration form lifecycle for the detail page:
 * ticket selection, guest info, submission, autorun, and all
 * redirect/signin/signup flows.
 *
 * The caller supplies `event` (may be undefined during loading) and
 * `slug`, plus a `onAfterRegistration` callback so the parent can
 * scroll to the ticket card.
 */
export function useEventRegistration(
  event: Event | undefined,
  slug: string,
  onAfterRegisteringGuest?: () => void,
): UseEventRegistrationResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ticketParam = searchParams.get('ticket');
  const autorunParam = searchParams.get('autorun') === '1';

  const user = useAppSelector(selectUser);
  const account = useAppSelector(selectActiveAccount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();

  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    string | null
  >(null);
  const [guest, setGuest] = useState<GuestForm>({
    name: '',
    email: '',
    phone: '',
  });
  const [authMode, setAuthMode] = useState<AuthMode>('choice');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [bookingError, setBookingError] = useState('');

  const autorunFiredRef = useRef(false);

  // Seed guest form from the current user.
  useEffect(() => {
    if (isAuthenticated) {
      setGuest({
        name: account?.displayName || account?.name || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [isAuthenticated, account, user]);

  // Auto-select ticket from ?ticket=… when the event loads.
  useEffect(() => {
    if (!ticketParam || !event?.tickets) return;
    const match = event.tickets.find(
      (t) => t.ticket_type?.id === ticketParam,
    );
    if (match) setSelectedTicketTypeId(ticketParam);
  }, [ticketParam, event]);

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

  // Autorun once when ?autorun=1 is present and prerequisites are met.
  useEffect(() => {
    if (!autorunParam) return;
    if (!isAuthenticated) return;
    if (!selectedTicketTypeId) return;
    if (registration) return;
    if (isRegistering) return;
    if (autorunFiredRef.current) return;

    autorunFiredRef.current = true;

    const cleanUrl = `/events/${slug}?ticket=${selectedTicketTypeId}`;
    router.replace(cleanUrl);

    void submitRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autorunParam,
    isAuthenticated,
    selectedTicketTypeId,
    registration,
    isRegistering,
  ]);

  const handleContinueAsGuest = () => {
    setAuthMode('guest-form');
    onAfterRegisteringGuest?.();
  };

  const handleCreateAccount = () => {
    if (!selectedTicketTypeId) return;
    const returnTo = `/events/${slug}?ticket=${selectedTicketTypeId}&autorun=1`;
    router.push(`/signup?next=${encodeURIComponent(returnTo)}`);
  };

  const backToChoice = () => setAuthMode('choice');

  return {
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
  };
}
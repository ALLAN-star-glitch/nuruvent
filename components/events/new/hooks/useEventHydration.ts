// components/events/new/hooks/useEventHydration.ts

'use client';

import { useEffect, useRef, useState } from 'react';

import { useGetEventByIdQuery } from '@/lib/store/api/eventsApi';
import type { Event as EventModel } from '@/lib/types/events';

import { mapEventToForm } from '@/components/events/mapEventToForm';
import type { EventFormData } from '@/components/events/new';

// ============================================================
// useEventHydration
// ============================================================
//
// Fetches an event by ID and hydrates the wizard's form state.
//
// Runs once per event. The hydration is idempotent — refetching or
// re-rendering doesn't re-hydrate after the initial load, so it
// won't clobber user edits mid-session.
//
// The `setLastSavedData` callback is called with the same value as
// `setFormData` so the auto-save engine sees "no changes yet" and
// doesn't fire on mount.

export interface UseEventHydrationResult {
  /** True while the initial fetch is in flight. */
  isLoading: boolean;
  /** True when the fetch completed but the event wasn't found. */
  notFound: boolean;
  /** Non-null when the fetch failed with a non-404 error. */
  error: string | null;
  /** The raw event, useful for status badge and metadata. */
  event: EventModel | undefined;
}

export function useEventHydration(
  eventId: string | undefined,
  setFormData: (data: EventFormData) => void,
  setLastSavedData: (data: EventFormData | null) => void,
): UseEventHydrationResult {
  const {
    data: response,
    isLoading,
    isError,
    error: queryError,
  } = useGetEventByIdQuery(eventId ?? '', { skip: !eventId });

  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard so we only hydrate once per event ID.
  const hydratedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    if (hydratedForRef.current === eventId) return;

    if (isLoading) return;

    if (isError) {
      const status = (queryError as { status?: number } | undefined)?.status;
      if (status === 404) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotFound(true);
      } else {
        const message =
          (queryError as { data?: { message?: string } } | undefined)?.data
            ?.message ?? 'Failed to load event.';
        setError(message);
      }
      return;
    }

    const event = response?.data;
    if (!event) {
      // Not loading, not errored, no data — treat as not found.
      setNotFound(true);
      return;
    }

    const mapped = mapEventToForm(event);
    setFormData(mapped);
    setLastSavedData(mapped);
    hydratedForRef.current = eventId;

    // Clear any previous error/not-found state in case of a re-fetch
    // that succeeded after an earlier failure.
    setNotFound(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isLoading, isError, response, queryError]);

  return {
    isLoading,
    notFound,
    error,
    event: response?.data,
  };
}
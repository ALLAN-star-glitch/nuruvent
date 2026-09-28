/* eslint-disable react-hooks/set-state-in-effect */
// components/events/new/hooks/useEventHydration.ts

'use client';

import { useEffect, useRef, useState } from 'react';

import { useGetEventByIdQuery } from '@/lib/store/api/eventsApi';
import type {
  BaseResponse,
  Event as EventModel,
} from '@/lib/types/events';

import { mapEventToForm } from '@/components/events/mapEventToForm';
import type { EventFormData } from '@/components/events/new';

export interface UseEventHydrationResult {
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
  event: EventModel | undefined;
}

export function useEventHydration(
  eventId: string | undefined,
  setFormData: (data: EventFormData) => void,
  setLastSavedData: (data: EventFormData | null) => void,
): UseEventHydrationResult {
  const queryResult = useGetEventByIdQuery(eventId ?? '', {
    skip: !eventId,
  }) as {
    data: BaseResponse<EventModel> | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
  };

  const response = queryResult.data;
  const { isLoading, isFetching, isError, error: queryError } = queryResult;

  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const event = response?.data;
    if (!event) return;
    if (event.id !== eventId) return;
    if (hydratedRef.current === eventId) return;

    const mapped = mapEventToForm(event);
    setFormData(mapped);
    setLastSavedData(mapped);
    hydratedRef.current = eventId;

    if (notFound) setNotFound(false);
    if (error) setError(null);
  }, [
    eventId,
    response,
    notFound,
    error,
    setFormData,
    setLastSavedData,
  ]);

  useEffect(() => {
    if (!eventId) return;
    if (isLoading || isFetching) return;
    if (!isError) return;

    const status = (queryError as { status?: number } | undefined)?.status;
    if (status === 404) {
      setNotFound(true);
      return;
    }

    const message =
      (queryError as { data?: { message?: string } } | undefined)?.data
        ?.message ?? 'Failed to load event.';
    setError(message);
  }, [eventId, isLoading, isFetching, isError, queryError]);

  useEffect(() => {
    if (!eventId) return;
    if (isLoading || isFetching) return;
    if (isError) return;
    if (response?.data) return;

    setNotFound(true);
  }, [eventId, isLoading, isFetching, isError, response]);

  return {
    isLoading: isLoading && !response?.data,
    notFound,
    error,
    event: response?.data,
  };
}
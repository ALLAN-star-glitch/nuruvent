// components/events/new/hooks/useEventSubmit.ts

'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateDraftMutation,
  useCreateEventMutation,
  usePublishEventMutation,
  useUpdateEventMutation,
  useUploadEventImageMutation,
} from '@/lib/store/api/eventsApi';

import type {
  EventFormData,
  FormErrors,
} from '@/components/events/new';
import {
  buildDraftPayload,
  buildPublishPayload,
  buildUpdatePayload,
} from '@/components/events/new';

import type { UseEventDraftResult } from './useEventDraft';
import type { UseEventImageResult } from './useEventImage';

// ============================================================
// useEventSubmit
// ============================================================
//
// The explicit submit path. Handles "Save Draft" and "Publish".
//
// Flips `submitInFlightRef.current` while mutations run, so the
// auto-save engine skips its debounced fire.

export interface UseEventSubmitResult {
  isSaving: boolean;
  submit: (status: 'draft' | 'published') => Promise<void>;
}

interface UseEventSubmitParams {
  /**
   * The team this event belongs to. Sent as ?team_id= on create
   * requests so the backend scopes the new event to the correct
   * team. Without it, the backend falls back to the request
   * context's team, which can be stale.
   */
  teamId: string;

  formData: EventFormData;
  draft: UseEventDraftResult;
  image: UseEventImageResult;

  validateStep: (step: number) => FormErrors;
  isPublishReady: boolean;

  setValidationErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  setError: (e: string | null) => void;

  onCreated: (eventId: string) => void;
  onSuccess: (published: boolean) => void;
  onDraftReset: () => void;

  setLastSavedData: (d: EventFormData | null) => void;
  setSaveStatus: (s: 'idle' | 'saving' | 'saved') => void;

  submitInFlightRef: React.MutableRefObject<boolean>;
}

export function useEventSubmit({
  teamId,
  formData,
  draft,
  image,
  validateStep,
  isPublishReady,
  setValidationErrors,
  setError,
  onCreated,
  onSuccess,
  onDraftReset,
  setLastSavedData,
  setSaveStatus,
  submitInFlightRef,
}: UseEventSubmitParams): UseEventSubmitResult {
  const [createDraft] = useCreateDraftMutation();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [publishEvent] = usePublishEventMutation();
  const [uploadEventImage] = useUploadEventImageMutation();

  const [isSaving, setIsSaving] = useState(false);

  const submit = useCallback(
    async (status: 'draft' | 'published') => {
      setError(null);

      if (status === 'published' && !isPublishReady) {
        const merged: FormErrors = {
          ...validateStep(1),
          ...validateStep(2),
          ...validateStep(3),
        };
        setValidationErrors(merged);
        setError('Please fix all errors before publishing.');
        return;
      }

      setIsSaving(true);
      setSaveStatus('saving');
      submitInFlightRef.current = true;

      try {
        const currentId = draft.getDraftId();

        // ========================================================
        // PUBLISH
        // ========================================================
        if (status === 'published') {
          if (currentId) {
            if (image.imageFile) {
              await uploadEventImage({
                eventId: currentId,
                image: image.imageFile,
              }).unwrap();
              image.clearImage();
            }

            const payload = buildUpdatePayload(formData);

            await updateEvent({
              id: currentId,
              data: payload,
            }).unwrap();

            await publishEvent(currentId).unwrap();

            onCreated(currentId);
            draft.clearDraftId();
          } else {
            const response = await createEvent({
              teamId,
              data: buildPublishPayload(formData),
            }).unwrap();
            onCreated(response.data.id);
            image.clearImage();
          }
        } else {
          // ========================================================
          // SAVE DRAFT
          // ========================================================
          if (currentId) {
            if (image.imageFile) {
              await uploadEventImage({
                eventId: currentId,
                image: image.imageFile,
              }).unwrap();
              image.clearImage();
            }

            const payload = buildUpdatePayload(formData);

            const response = await updateEvent({
              id: currentId,
              data: payload,
            }).unwrap();
            onCreated(response.data.id);
          } else {
            const response = await createDraft({
              teamId,
              data: buildDraftPayload(formData),
            }).unwrap();
            const newId = response.data.id;
            draft.setDraftId(newId);
            onCreated(newId);
            image.clearImage();
          }
        }

        setLastSavedData({ ...formData });
        setSaveStatus('saved');
        onSuccess(status === 'published');

        if (status === 'draft') {
          onDraftReset();
        }
      } catch (err: unknown) {
        console.error('Submit error:', err);
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          (status === 'published'
            ? 'Failed to publish event. Please try again.'
            : 'Failed to save draft. Please try again.');
        setError(message);
        toast.error(message);
      } finally {
        setIsSaving(false);
        submitInFlightRef.current = false;
      }
    },
    [
      teamId,
      createDraft,
      createEvent,
      draft,
      formData,
      image,
      isPublishReady,
      onCreated,
      onDraftReset,
      onSuccess,
      publishEvent,
      setError,
      setLastSavedData,
      setSaveStatus,
      setValidationErrors,
      submitInFlightRef,
      updateEvent,
      uploadEventImage,
      validateStep,
    ],
  );

  return {
    isSaving,
    submit,
  };
}
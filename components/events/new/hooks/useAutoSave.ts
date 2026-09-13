/* eslint-disable react-hooks/set-state-in-effect */
// components/events/new/hooks/useAutoSave.ts

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateDraftMutation,
  useUpdateEventMutation,
  useUploadEventImageMutation,
} from '@/lib/store/api/eventsApi';

import type { EventFormData } from '@/components/events/new';
import {
  buildDraftPayload,
  buildUpdatePayload,
} from '@/components/events/new';

import type { UseEventDraftResult } from './useEventDraft';
import type { UseEventImageResult } from './useEventImage';

// ============================================================
// useAutoSave
// ============================================================
//
// The auto-save engine. Debounces 2s after the last change, saves to
// the server (create on first save, update after), and uploads the
// image once the event exists.
//
// Does NOT own `isLoadingFlow`. Instead it reads a ref that the wizard
// flips while a manual submit is running, so auto-save and submit
// don't race.
//
// Does NOT handle:
//   - Publish — that's useEventSubmit
//   - Validation — that's useEventValidation
//   - draftId storage — that's useEventDraft

const DEBOUNCE_MS = 2000;

export type SaveStatus = 'idle' | 'saving' | 'saved';

export interface UseAutoSaveResult {
  saveStatus: SaveStatus;
  setSaveStatus: (s: SaveStatus) => void;
  hasChanges: boolean;
  isAutoSaving: boolean;
  lastSavedData: EventFormData | null;
  setLastSavedData: (d: EventFormData | null) => void;
  performAutoSave: () => Promise<void>;
}

interface UseAutoSaveParams {
  formData: EventFormData;
  draft: UseEventDraftResult;
  image: UseEventImageResult;

  /**
   * Ref the wizard flips to true while an explicit submit (draft save
   * or publish) is running. Auto-save skips its debounced fire while
   * this is true, so we don't race two mutations against the same row.
   */
  submitInFlightRef: React.MutableRefObject<boolean>;

  onDraftCreated?: (eventId: string) => void;
}

export function useAutoSave({
  formData,
  draft,
  image,
  submitInFlightRef,
  onDraftCreated,
}: UseAutoSaveParams): UseAutoSaveResult {
  const [createDraft] = useCreateDraftMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [uploadEventImage] = useUploadEventImageMutation();

  const [lastSavedData, setLastSavedData] = useState<EventFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSavingRef = useRef(false);
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // ---- Dirty tracking ----
  useEffect(() => {
    if (!lastSavedData) {
      const first = formData.schedules?.[0];
      const hasAny =
        !!formData.name || !!formData.event_type_id || !!first?.start_date;
      setHasChanges(hasAny);
      if (hasAny && saveStatus !== 'saving') setSaveStatus('saving');
      return;
    }

    const current = {
      ...formData,
      imagePreview: formData.imagePreview || undefined,
    };
    const saved = {
      ...lastSavedData,
      imagePreview: lastSavedData.imagePreview || undefined,
    };

    const changed = JSON.stringify(current) !== JSON.stringify(saved);
    setHasChanges(changed);

    if (changed && saveStatus !== 'saving') {
      setSaveStatus('saving');
    } else if (!changed && !isAutoSaving) {
      setSaveStatus('saved');
    }
  }, [formData, lastSavedData, isAutoSaving, saveStatus]);

  // ---- The actual save ----
  const performAutoSave = useCallback(async () => {
    if (isAutoSavingRef.current) return;
    if (submitInFlightRef.current) return;

    const current = formDataRef.current;
    const firstSchedule = current.schedules?.[0];
    const hasAny =
      !!current.name?.trim() ||
      !!current.event_type_id ||
      !!firstSchedule?.start_date;
    if (!hasAny) return;

    const currentDraftId = draft.getDraftId();

    isAutoSavingRef.current = true;
    setIsAutoSaving(true);

    try {
      if (currentDraftId) {
        try {
          await updateEvent({
            id: currentDraftId,
            data: buildUpdatePayload(current),
          }).unwrap();

          if (image.imageFile) {
            await uploadEventImage({
              eventId: currentDraftId,
              image: image.imageFile,
            }).unwrap();
            image.clearImage();
          }
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          if (status === 404) {
            draft.clearDraftId();
            throw err;
          }
          throw err;
        }
      } else {
        const response = await createDraft(
          buildDraftPayload(current),
        ).unwrap();

        const newId = response.data.id;
        draft.setDraftId(newId);
        onDraftCreated?.(newId);

        if (image.imageFile) {
          await uploadEventImage({
            eventId: newId,
            image: image.imageFile,
          }).unwrap();
          image.clearImage();
        }
      }

      setLastSavedData({ ...current });
      setHasChanges(false);
      setSaveStatus('saved');
    } catch (err: unknown) {
      console.error('Auto-save error:', err);
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        toast.error('Draft not found. Please refresh the page.');
      } else {
        toast.error('Failed to save draft. Please try again.');
      }
    } finally {
      isAutoSavingRef.current = false;
      setIsAutoSaving(false);
    }
  }, [
    createDraft,
    draft,
    image,
    onDraftCreated,
    submitInFlightRef,
    updateEvent,
    uploadEventImage,
  ]);

  // ---- Debounced timer ----
  useEffect(() => {
    const current = formDataRef.current;
    const firstSchedule = current.schedules?.[0];
    const hasAny =
      !!current.name?.trim() ||
      !!current.event_type_id ||
      !!firstSchedule?.start_date;

    if (!hasAny) return;
    if (submitInFlightRef.current) return;
    if (isAutoSaving) return;
    if (!hasChanges) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, DEBOUNCE_MS);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [hasChanges, isAutoSaving, performAutoSave, submitInFlightRef]);

  // ---- Save on unmount ----
  useEffect(() => {
    return () => {
      if (hasChanges) performAutoSave();
    };
  }, [hasChanges, performAutoSave]);

  // ---- beforeunload guard ----
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  return {
    saveStatus,
    setSaveStatus,
    hasChanges,
    isAutoSaving,
    lastSavedData,
    setLastSavedData,
    performAutoSave,
  };
}
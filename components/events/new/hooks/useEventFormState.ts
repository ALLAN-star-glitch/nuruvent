// components/events/new/hooks/useEventFormState.ts

'use client';

import { useCallback, useState } from 'react';

import type {
  EventFormData,
  FormErrors,
} from '@/components/events/new';

// ============================================================
// useEventFormState
// ============================================================
//
// Owns the editable shape of the event: formData plus the two error
// maps that travel with it (validationErrors from step validation,
// errors from field-level checks like image size).
//
// `touched` tracks which fields the user has interacted with — useful
// for "show errors only after blur" behavior later.
//
// `handleFieldChange` is the single entry point for every field
// update. It also clears any existing validation error on that field
// and flips the save indicator to "saving" so the parent's autosave
// effect fires.

export interface UseEventFormStateResult {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
  handleFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;

  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;

  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  validationErrors: FormErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<FormErrors>>;

  /** Reset everything back to the given defaults (or the initial ones). */
  reset: (defaults: EventFormData) => void;
}

export function useEventFormState(
  initial: EventFormData,
): UseEventFormStateResult {
  const [formData, setFormData] = useState<EventFormData>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});

  const handleFieldChange = useCallback(
    <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear any validation error on this field as soon as the user
      // changes it — they're actively fixing the problem.
      setValidationErrors((prev) => {
        if (!prev[field as keyof FormErrors]) return prev;
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    },
    [],
  );

  const reset = useCallback((defaults: EventFormData) => {
    setFormData(defaults);
    setErrors({});
    setTouched({});
    setValidationErrors({});
  }, []);

  return {
    formData,
    setFormData,
    handleFieldChange,
    errors,
    setErrors,
    touched,
    setTouched,
    validationErrors,
    setValidationErrors,
    reset,
  };
}
// components/events/new/hooks/useEventImage.ts

'use client';

import { useCallback, useState, type ChangeEvent } from 'react';

import type { FormErrors } from '@/components/events/new';

// ============================================================
// useEventImage
// ============================================================
//
// Owns the event's cover image: the File the user selected (pending
// upload) and the preview data URL shown in the UI.
//
// Validation (size, MIME type) lives here. The caller receives
// `errors.image` and renders it.
//
// The hook does NOT upload. Uploading is orchestrated by the autosave
// and submit flows, which read `imageFile` and call the RTK mutation
// themselves. Once the upload succeeds, they call `clearImage()`.

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UseEventImageResult {
  /** The File pending upload, if any. */
  imageFile: File | null;
  /** The data URL for the preview, if any. */
  imagePreview: string | null;
  /** Handle a file input's change event. Validates and loads. */
  handleImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Clear both file and preview. Called after successful upload. */
  clearImage: () => void;
  /**
   * Sync the hook's preview from an external source (e.g. when
   * hydrating an existing event on the edit page).
   */
  setPreview: (preview: string | null) => void;
}

export function useEventImage(
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
): UseEventImageResult {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const clearImageError = useCallback(() => {
    setErrors((prev) => {
      if (!prev.image) return prev;
      const next = { ...prev };
      delete next.image;
      return next;
    });
  }, [setErrors]);

  const handleImageSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_SIZE_BYTES) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image must be less than 5MB',
        }));
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: 'Only JPG, PNG, and WEBP images are supported',
        }));
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        clearImageError();
      };
      reader.readAsDataURL(file);
    },
    [clearImageError, setErrors],
  );

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const setPreview = useCallback((preview: string | null) => {
    setImagePreview(preview);
  }, []);

  return {
    imageFile,
    imagePreview,
    handleImageSelect,
    clearImage,
    setPreview,
  };
}
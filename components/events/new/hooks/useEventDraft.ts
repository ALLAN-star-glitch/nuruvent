// components/events/new/hooks/useEventDraft.ts

'use client';

import { useCallback, useRef, useState } from 'react';

import { DRAFT_ID_STORAGE_KEY } from '@/components/events/new';

// ============================================================
// useEventDraft
// ============================================================
//
// Owns the persisted draft ID.
//
// Two modes:
//   - Create mode (default): localStorage is the source of truth.
//   - Edit mode (persistence: false): localStorage is ignored. The
//     ID is fixed (passed as `initialId`) and never persisted.
//
// The ref is the synchronously-readable source of truth. State exists
// so components re-render when the ID changes. localStorage is the
// durable copy.
//
// getDraftId() reads from the ref first, so it never returns a stale
// value even if a render hasn't happened yet.

export interface UseEventDraftOptions {
  persistence?: boolean;
  initialId?: string | null;
}

export interface UseEventDraftResult {
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  getDraftId: () => string | null;
  clearDraftId: () => void;
}

export function useEventDraft(
  options: UseEventDraftOptions = {},
): UseEventDraftResult {
  const { persistence = true, initialId = null } = options;

  // Lazy init — useState supports the function form.
  const [draftId, setDraftIdState] = useState<string | null>(() => {
    if (!persistence) return initialId;
    if (typeof window === 'undefined') return initialId;
    return localStorage.getItem(DRAFT_ID_STORAGE_KEY) ?? initialId;
  });

  // Ref mirrors the state, but is written synchronously by setDraftId
  // and clearDraftId so getDraftId() reads the freshest value.
  const draftIdRef = useRef<string | null>(draftId);

  const setDraftId = useCallback(
    (id: string | null) => {
      draftIdRef.current = id;
      setDraftIdState(id);
      if (persistence && typeof window !== 'undefined') {
        if (id) {
          localStorage.setItem(DRAFT_ID_STORAGE_KEY, id);
        } else {
          localStorage.removeItem(DRAFT_ID_STORAGE_KEY);
        }
      }
    },
    [persistence],
  );

  const getDraftId = useCallback((): string | null => {
    // Ref is always fresh.
    if (draftIdRef.current) return draftIdRef.current;

    // Fall back to storage (in case another tab set it).
    if (persistence && typeof window !== 'undefined') {
      const stored = localStorage.getItem(DRAFT_ID_STORAGE_KEY);
      if (stored) {
        draftIdRef.current = stored;
        return stored;
      }
    }

    return null;
  }, [persistence]);

  const clearDraftId = useCallback(() => {
    draftIdRef.current = null;
    setDraftIdState(null);
    if (persistence && typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_ID_STORAGE_KEY);
    }
  }, [persistence]);

  return {
    draftId,
    setDraftId,
    getDraftId,
    clearDraftId,
  };
}
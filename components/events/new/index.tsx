// components/events/new/index.ts

// ============================================================
// EVENTS / NEW — BARREL EXPORT
// ============================================================
//
// Re-exports the public surface of the Create Event wizard.
// Shared types & transform live one level up, under events/.

// ---- Shared types & constants ----
export type {
  EventFormData,
  FormErrors,
  ScheduleForm,
  RecurrenceForm,
  SpeakerForm,
  MaterialForm,
  SEOForm,
  TicketForm,
  WeekdayCode,
} from '../types';

export {
  defaultFormData,
  STEPS,
  DRAFT_ID_STORAGE_KEY,
  DEFAULT_TICKET_TYPE_SLUG,
  NO_CATEGORY,
  WEEKDAY_CODES,
  WEEKDAY_LABELS,
  makeEmptySchedule,
  makeEmptyRecurrence,
  makeEmptyTicket,
  makeEmptySpeaker,
  makeEmptyMaterial,
  makeEmptySEO,
} from '../types';

// ---- Shared transform helpers ----
export {
  buildDraftPayload,
  buildPublishPayload,
  buildUpdatePayload,
  mapAIDraftToForm,
} from '../transform';

// ---- Leaf components (create-specific) ----
export { SaveStatusIndicator } from './SaveStatusIndicator';
export { EventPreviewCard } from './EventPreviewCard';
export { Stepper } from './Stepper';
export { PreviewModal } from './PreviewModal';
export { SaveSuccessDialog } from './SaveSuccessDialog';

// components/events/new/steps/BasicInfoStep.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { CategoryField } from '@/components/events/fields/CategoryField';
import { EventTypeField } from '@/components/events/fields/EventTypeField';
import { SchedulesField } from '@/components/events/fields/ScheduleField';
import {
  TagsField,
  TextField,
  TextareaField,
} from '@/components/form';
import type {
  EventType as EventTypeModel,
  GeneratedEventDraft,
} from '@/lib/types/events';

import type {
  EventFormData,
  FormErrors,
  ScheduleForm,
} from '../../types';

// ============================================================
// BASIC INFO STEP (Step 1)
// ============================================================

interface BasicInfoStepProps {
  formData: EventFormData;
  validationErrors: FormErrors;
  eventTypes: EventTypeModel[];
  onFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
  onAIDraft: (draft: GeneratedEventDraft) => void;
  onEventTypeTouched: () => void;
  onOpenConnectModal?: () => void;
  eventId?: string; 
  onSchedulesCommitted?: (next: ScheduleForm[]) => void;
}

export function BasicInfoStep({
  formData,
  validationErrors,
  eventTypes,
  onFieldChange,
  onEventTypeTouched,
  onOpenConnectModal,
  eventId,
  onSchedulesCommitted,
}: BasicInfoStepProps) {
  const searchParams = useSearchParams();
  // If the user just connected a video platform, we want to force the schedule open
  const videoJustConnected = searchParams.get('video_connected') === 'true';

  return (
    <div className="space-y-5">
      {/* ---- Event Name ---- */}
      <TextField
        name="name"
        label={
          <>
            Event Name <span className="text-error-500 ml-1">*</span>
          </>
        }
        placeholder="e.g., Advanced Data Science Workshop"
        helper="The internal name for your event."
        value={formData.name}
        onChange={(v) => onFieldChange('name', v)}
        maxLength={100}
        error={validationErrors.name}
      />

      {/* ---- Event Type + Category (side by side) ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventTypeField
          value={formData.event_type_id}
          onChange={(v) => onFieldChange('event_type_id', v)}
          onTouched={onEventTypeTouched}
          eventTypes={eventTypes}
          error={validationErrors.event_type_id}
        />

        <CategoryField
          value={formData.category_id}
          onChange={(v) => onFieldChange('category_id', v)}
          error={validationErrors.category_id}
        />
      </div>

      {/* ---- Schedules ---- */}
      <SchedulesField
        value={formData.schedules}
        onChange={(v: ScheduleForm[]) => onFieldChange('schedules', v)}
        error={validationErrors.schedules}
        onOpenConnectModal={onOpenConnectModal}
        eventId={eventId} 
        onSchedulesCommitted={onSchedulesCommitted}
        videoJustConnected={videoJustConnected} // <--- Pass the new prop
      />

      {/* ---- Short Description ---- */}
      <TextField
        name="short_description"
        label="Short Description"
        placeholder="A one-line summary shown on listings and cards"
        helper="Optional. Appears in cards and search results."
        value={formData.short_description}
        onChange={(v) => onFieldChange('short_description', v)}
        maxLength={160}
        showCounter
        optional
        error={validationErrors.short_description}
      />

      {/* ---- Description ---- */}
      <TextareaField
        name="description"
        label={
          <>
            Description <span className="text-error-500 ml-1">*</span>
          </>
        }
        placeholder="Describe your event, what attendees will learn..."
        value={formData.description}
        onChange={(v) => onFieldChange('description', v)}
        error={validationErrors.description}
      />

      {/* ---- Tags ---- */}
      <TagsField
        name="tags"
        label="Tags"
        placeholder="Type a tag and press Enter"
        value={formData.tags}
        onChange={(v) => onFieldChange('tags', v)}
        optional
      />

      {/* ---- Language ---- */}
      <TextField
        name="language"
        label="Language"
        placeholder="en"
        helper="ISO code — e.g. en, sw, fr."
        value={formData.language}
        onChange={(v) => onFieldChange('language', v)}
        maxLength={10}
      />
    </div>
  );
}
// components/events/new/steps/BasicInfoStep.tsx

'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import { CategoryField } from '@/components/events/fields/CategoryField';
import { EventTypeField } from '@/components/events/fields/EventTypeField';
import {
  TagsField,
  TextField,
  TextareaField,
} from '@/components/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { EventType as EventTypeModel } from '@/lib/types/events';

import type { EventFormData, FormErrors } from '../../types';

interface BasicInfoStepProps {
  formData: EventFormData;
  validationErrors: FormErrors;
  eventTypes: EventTypeModel[];
  onFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
  onEventTypeTouched: () => void;
}

export function BasicInfoStep({
  formData,
  validationErrors,
  eventTypes,
  onFieldChange,
  onEventTypeTouched,
}: BasicInfoStepProps) {
  const enabled = formData.registration_enabled;

  return (
    <div className="space-y-5">
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

      <TagsField
        name="tags"
        label="Tags"
        placeholder="Type a tag and press Enter"
        value={formData.tags}
        onChange={(v) => onFieldChange('tags', v)}
        optional
      />

      <TextField
        name="language"
        label="Language"
        placeholder="en"
        helper="ISO code — e.g. en, sw, fr."
        value={formData.language}
        onChange={(v) => onFieldChange('language', v)}
        maxLength={10}
      />

      {/* ============================================================
          Registration choice card
          ============================================================ */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border transition-colors',
          enabled
            ? 'border-primary/30 bg-primary/[0.03]'
            : 'border-amber-300/60 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20',
        )}
      >
        {/* Accent stripe on the left — visually marks the "mode" */}
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            enabled ? 'bg-primary' : 'bg-amber-500',
          )}
        />

        <div className="p-4 pl-5 space-y-4">
          {/* Header row: icon + title + switch */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  enabled
                    ? 'bg-primary/10 text-primary'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                )}
              >
                {enabled ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0">
                <Label
                  htmlFor="registration_enabled"
                  className={cn(
                    'block text-sm font-semibold cursor-pointer',
                    enabled
                      ? 'text-foreground'
                      : 'text-amber-800 dark:text-amber-300',
                  )}
                >
                  {enabled ? 'Require registration' : 'Open access event'}
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {enabled
                    ? 'Attendees provide name and email to receive a personal join link.'
                    : 'The join link is shown publicly. No data is collected.'}
                </p>
              </div>
            </div>

            <Switch
              id="registration_enabled"
              checked={enabled}
              onCheckedChange={(v) =>
                onFieldChange('registration_enabled', v)
              }
              className="shrink-0 mt-1"
              aria-label="Toggle registration"
            />
          </div>

          {/* Detail body: changes with mode */}
          <div
            className={cn(
              'rounded-lg border px-3 py-2.5 text-xs leading-relaxed',
              enabled
                ? 'border-primary/20 bg-background/60 text-foreground/80'
                : 'border-amber-300/40 bg-background/60 text-amber-800 dark:text-amber-300',
            )}
          >
            {enabled ? (
              <ul className="space-y-1 list-none">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  Attendance tracking, reminders, and certificates enabled
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  You can sell tickets and collect attendee data
                </li>
              </ul>
            ) : (
              <ul className="space-y-1 list-none">
                <li className="flex items-start gap-1.5">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  No attendance tracking, reminders, or certificates
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  No ticket sales — the event is free to join
                </li>
                <li className="flex items-start gap-1.5">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  The Zoom / Meet link is visible to anyone
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
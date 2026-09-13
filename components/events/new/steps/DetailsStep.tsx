// components/events/new/steps/DetailsStep.tsx

'use client';

import { AlertCircle, Star, Trash2, Upload } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { AccessField } from '@/components/events/fields/AccessField';
import { RecurrenceField } from '@/components/events/fields/RecurrenceField';
import { VenueField } from '@/components/events/fields/VenueField';
import { VirtualPlatformField } from '@/components/events/fields/VirtualField';
import { NumberField } from '@/components/form';

import type {
  EventFormData,
  FormErrors,
} from '../../types';

// ============================================================
// DETAILS STEP (Step 3)
// ============================================================
//
// Fields rendered:
//   - Certificate toggle + price
//   - Virtual / In-person toggle
//       - virtual: VirtualPlatformField
//       - in-person: VenueField
//   - Recurrence
//   - Access & Privacy
//   - Promotion (Featured toggle)
//   - Event image
//
// Pricing, capacity, and waitlist moved to TicketStep (step 2).

interface DetailsStepProps {
  formData: EventFormData;
  validationErrors: FormErrors;
  errors: FormErrors;
  imagePreview: string | null;

  onFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;

  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export function DetailsStep({
  formData,
  validationErrors,
  errors,
  imagePreview,
  onFieldChange,
  onImageSelect,
  onImageRemove,
}: DetailsStepProps) {
  return (
    <div className="space-y-6">
      {/* ====================================================
          Certificate
         ==================================================== */}
      <Card className="border border-neutral-light">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-lg border border-amber-100">
            <div>
              <Label className="text-sm font-medium text-neutral-dark">
                Certificate Available
              </Label>
              <p className="text-xs text-neutral-gray">
                Attendees can purchase a certificate of completion
              </p>
            </div>
            <Switch
              checked={formData.certificate_enabled}
              onCheckedChange={(c) =>
                onFieldChange('certificate_enabled', c)
              }
              className="cursor-pointer data-[state=checked]:bg-amber-500"
            />
          </div>

          {formData.certificate_enabled && (
            <NumberField
              name="certificate_price"
              label="Certificate Price"
              suffix="KES"
              placeholder="0"
              value={formData.certificate_price}
              onChange={(v) => onFieldChange('certificate_price', v)}
              min={0}
              decimal
              step="0.01"
              error={validationErrors.certificate_price}
            />
          )}
        </CardContent>
      </Card>

      {/* ====================================================
          Virtual / In-person
         ==================================================== */}
      <Card className="border border-neutral-light">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
            <div>
              <Label className="text-sm font-medium text-neutral-dark">
                Virtual Event
              </Label>
              <p className="text-xs text-neutral-gray">
                Toggle if this is an online event
              </p>
            </div>
            <Switch
              checked={formData.is_virtual}
              onCheckedChange={(checked) =>
                onFieldChange('is_virtual', checked)
              }
              className="cursor-pointer"
            />
          </div>

          {formData.is_virtual ? (
            <VirtualPlatformField
              value={{
                virtual_platform:
                  formData.virtual_platform as
                    | ''
                    | 'zoom'
                    | 'meet'
                    | 'teams'
                    | 'custom',
                virtual_platform_url: formData.virtual_platform_url,
                zoom_link: formData.zoom_link,
                meet_link: formData.meet_link,
              }}
              onChange={(key, v) => onFieldChange(key, v)}
              error={validationErrors.zoom_link}
            />
          ) : (
            <VenueField
              value={{
                venue_name: formData.venue_name || formData.location,
                venue_address: formData.venue_address,
                venue_city: formData.venue_city,
                venue_country: formData.venue_country,
              }}
              onChange={(key, v) => {
                if (key === 'venue_name') {
                  onFieldChange('venue_name', v);
                  onFieldChange('location', v);
                } else {
                  onFieldChange(key, v);
                }
              }}
              error={validationErrors.location}
            />
          )}
        </CardContent>
      </Card>

      {/* ====================================================
          Recurrence
         ==================================================== */}
      <Card className="border border-neutral-light">
        <CardContent className="pt-6">
          <RecurrenceField
            enabled={formData.is_recurring}
            value={formData.recurrence}
            onEnabledChange={(enabled) =>
              onFieldChange('is_recurring', enabled)
            }
            onChange={(r) => onFieldChange('recurrence', r)}
            error={validationErrors.recurrence}
          />
        </CardContent>
      </Card>

      {/* ====================================================
          Access & Privacy
         ==================================================== */}
      <Card className="border border-neutral-light">
        <CardContent className="pt-6">
          <AccessField
            value={{
              visibility: formData.is_private ? 'private' : 'public',
              password: formData.password,
              invite_only: formData.invite_only,
              invited_emails: formData.invited_emails,
            }}
            onChange={(key, v) => {
              if (key === 'visibility') {
                onFieldChange('is_private', v === 'private');
              } else {
                onFieldChange(key, v);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* ====================================================
          Promotion
         ==================================================== */}
      <Card className="border border-neutral-light">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-dark">
            Promotion
          </CardTitle>
          <CardDescription className="text-xs text-neutral-gray">
            Control how your event appears in listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-100">
            <div>
              <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary-500" />
                Featured Event
              </Label>
              <p className="text-xs text-neutral-gray">
                Featured events appear prominently on the homepage
              </p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(c) => onFieldChange('is_featured', c)}
              className="cursor-pointer data-[state=checked]:bg-secondary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* ====================================================
          Event Image
         ==================================================== */}
      <Card className="border border-neutral-light">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-dark">
              Event Image
            </Label>

            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full hover:bg-error-600 transition-colors cursor-pointer"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className={cn(
                  'flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                  errors.image
                    ? 'border-error-500 bg-error-50'
                    : 'border-neutral-light hover:border-primary-300 hover:bg-primary-50',
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload
                    className={cn(
                      'h-10 w-10',
                      errors.image ? 'text-error-500' : 'text-neutral-gray',
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm mt-2',
                      errors.image
                        ? 'text-error-500'
                        : 'text-neutral-gray',
                    )}
                  >
                    {errors.image || 'Click to upload event image'}
                  </p>
                  <p className="text-xs text-neutral-gray">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onImageSelect}
                />
              </label>
            )}

            {errors.image && (
              <p className="text-sm text-error-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.image}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
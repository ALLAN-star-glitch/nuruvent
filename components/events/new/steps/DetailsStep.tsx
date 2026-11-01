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
import { CertificateTierField } from '@/components/events/fields/CertificateTierField';


import type { EventFormData, FormErrors } from '../../types';

// ============================================================
// DETAILS STEP (Step 3)
// ============================================================
//
// Fields rendered:
//   - Certificate toggle + tier selector
//   - Recurrence
//   - Access & Privacy
//   - Promotion (Featured toggle)
//   - Event image

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
      <Card className="border border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Issue Certificates for This Event
              </Label>
              <p className="text-xs text-muted-foreground">
                Attendees receive a certificate of completion after the event.
              </p>
            </div>
            <Switch
              checked={formData.certificate_enabled}
              onCheckedChange={(c) => {
                onFieldChange('certificate_enabled', c);
                // Clear the tier when the toggle is turned off so a
                // stale template ID doesn't linger in the payload.
                // Toggling back on re-defaults via the picker's effect.
                if (!c) {
                  onFieldChange('certificate_template_id', '');
                }
              }}
              className="cursor-pointer"
            />
          </div>

          {formData.certificate_enabled && (
            <CertificateTierField
              value={formData.certificate_template_id}
              onChange={(id) =>
                onFieldChange('certificate_template_id', id)
              }
              error={validationErrors.certificate_template_id}
            />
          )}
        </CardContent>
      </Card>



      {/* ====================================================
          Access & Privacy
         ==================================================== */}
      <Card className="border border-border">
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
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Promotion
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Control how your event appears in listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
            <div>
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary-500" />
                Featured Event
              </Label>
              <p className="text-xs text-muted-foreground">
                Featured events appear prominently on the homepage
              </p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(c) => onFieldChange('is_featured', c)}
              className="cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* ====================================================
          Event Image
         ==================================================== */}
      <Card className="border border-border">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
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
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors cursor-pointer"
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
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted/40',
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload
                    className={cn(
                      'h-10 w-10',
                      errors.image ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm mt-2',
                      errors.image
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                    )}
                  >
                    {errors.image || 'Click to upload event image'}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
              <p className="text-sm text-destructive flex items-center gap-1">
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
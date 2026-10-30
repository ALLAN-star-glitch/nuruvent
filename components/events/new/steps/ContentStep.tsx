// components/events/new/steps/ContentStep.tsx

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { MaterialsField } from '@/components/events/fields/MaterialsField';
import { SEOField } from '@/components/events/fields/SEOField';
import { SpeakersField } from '@/components/events/fields/SpeakersField';

import type {
  EventFormData,
  FormErrors,
} from '../../types';

// ============================================================
// CONTENT STEP (Step 4)
// ============================================================
//
// Optional content for the event page:
//   - Speakers   (SpeakersField — list editor)
//   - Materials  (MaterialsField — list editor)
//   - SEO        (SEOField — collapsible block)
//
// Nothing here is required for publishing. The step exists so the
// wizard has a home for "extra content" that would otherwise crowd
// step 2 or step 3.

interface ContentStepProps {
  formData: EventFormData;
  validationErrors: FormErrors;
  onFieldChange: <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => void;
}

export function ContentStep({
  formData,
  validationErrors,
  onFieldChange,
}: ContentStepProps) {
  return (
    <div className="space-y-6">
      {/* ---- Speakers ---- */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Speakers
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Add presenters, instructors, or guest speakers. Optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SpeakersField
            value={formData.speakers}
            onChange={(v) => onFieldChange('speakers', v)}
            error={validationErrors.speakers}
          />
        </CardContent>
      </Card>

      {/* ---- Materials ---- */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            Materials
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Pre-reading, handouts, or resources attendees can access.
            Optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialsField
            value={formData.materials}
            onChange={(v) => onFieldChange('materials', v)}
            error={validationErrors.materials}
          />
        </CardContent>
      </Card>

      {/* ---- SEO ---- */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            SEO &amp; Social Preview
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Control how your event appears in search results and on social
            media. Optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SEOField
            value={formData.seo}
            onChange={(v) => onFieldChange('seo', v)}
            error={validationErrors.seo}
          />
        </CardContent>
      </Card>
    </div>
  );
}
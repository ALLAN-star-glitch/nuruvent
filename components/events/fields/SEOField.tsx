// components/events/fields/SEOField.tsx

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TagsField } from '@/components/form/TagsField';
import { TextareaField } from '@/components/form/TextareaField';
import { TextField } from '@/components/form/TextField';
import { FieldBaseProps, fieldId } from '@/components/form/types';
import { SEOForm } from '../new';
import { makeEmptySEO } from '../types';



// ============================================================
// SEO FIELD (events)
// ============================================================
//
// Collapsible block. Nothing is required; if the user leaves it all
// blank, the transform skips the SEO block entirely.

interface SEOFieldProps extends FieldBaseProps {
  value: SEOForm | null;
  onChange: (value: SEOForm | null) => void;
}

export function SEOField({
  value,
  onChange,
  error,
  disabled,
  id,
}: SEOFieldProps) {
  const [open, setOpen] = useState(false);
  const seo = value ?? makeEmptySEO();

  const update = <K extends keyof SEOForm>(key: K, v: SEOForm[K]) => {
    onChange({ ...seo, [key]: v });
  };

  return (
    <div id={fieldId('seo', id)} className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left cursor-pointer"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-neutral-gray" />
        ) : (
          <ChevronRight className="h-4 w-4 text-neutral-gray" />
        )}
        <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2 cursor-pointer">
          <Search className="h-4 w-4 text-primary-500" />
          SEO &amp; Social Preview
        </Label>
        <span className="text-xs text-neutral-gray ml-auto">
          Optional
        </span>
      </button>

      {open && (
        <div className={cn('space-y-4 pl-6 pt-2')}>
          <TextField
            name="seo_meta_title"
            label="Meta Title"
            placeholder="Page title in search results"
            value={seo.meta_title}
            onChange={(v) => update('meta_title', v)}
            disabled={disabled}
            maxLength={60}
            showCounter
            optional
          />

          <TextareaField
            name="seo_meta_description"
            label="Meta Description"
            placeholder="Snippet shown in search results"
            value={seo.meta_description}
            onChange={(v) => update('meta_description', v)}
            disabled={disabled}
            maxLength={160}
            showCounter
            optional
            minHeightClass="min-h-[80px]"
          />

          <TagsField
            name="seo_meta_keywords"
            label="Meta Keywords"
            placeholder="Type a keyword and press Enter"
            value={seo.meta_keywords}
            onChange={(v) => update('meta_keywords', v)}
            disabled={disabled}
            optional
            maxTags={20}
          />

          <TextField
            name="seo_og_title"
            label="OG Title"
            placeholder="Title for social previews"
            value={seo.og_title}
            onChange={(v) => update('og_title', v)}
            disabled={disabled}
            optional
          />

          <TextareaField
            name="seo_og_description"
            label="OG Description"
            placeholder="Description for social previews"
            value={seo.og_description}
            onChange={(v) => update('og_description', v)}
            disabled={disabled}
            optional
            minHeightClass="min-h-[70px]"
          />

          <TextField
            name="seo_og_image_url"
            label="OG Image URL"
            placeholder="https://..."
            value={seo.og_image_url}
            onChange={(v) => update('og_image_url', v)}
            disabled={disabled}
            type="url"
            optional
          />
        </div>
      )}

      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
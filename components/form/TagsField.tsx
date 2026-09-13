// components/form/TagsField.tsx

'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

// ============================================================
// TAGS FIELD
// ============================================================
//
// Chip-style input. Enter or comma commits a tag. Backspace on an
// empty input removes the last chip.
//
// Generic — no domain knowledge. Used by any form that wants tags.

interface TagsFieldProps extends FieldBaseProps {
  value: string[];
  onChange: (value: string[]) => void;

  name: string;
  label: string;
  placeholder?: string;
  helper?: string;
  optional?: boolean;

  maxTags?: number;
  maxTagLength?: number;
  /** Enforce uniqueness case-insensitively. Default true. */
  unique?: boolean;
}

const DEFAULT_MAX_TAGS = 10;
const DEFAULT_MAX_TAG_LENGTH = 32;

export function TagsField({
  value,
  onChange,
  name,
  label,
  placeholder,
  helper,
  optional,
  maxTags = DEFAULT_MAX_TAGS,
  maxTagLength = DEFAULT_MAX_TAG_LENGTH,
  unique = true,
  error,
  disabled,
  id,
}: TagsFieldProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, maxTagLength);
    if (!tag) return;
    if (value.length >= maxTags) return;
    if (
      unique &&
      value.some((t) => t.toLowerCase() === tag.toLowerCase())
    ) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const atLimit = value.length >= maxTags;

  return (
    <FieldWrapper
      id={fieldId(name, id)}
      label={label}
      helper={helper ?? `Press Enter to add. Up to ${maxTags} tags.`}
      error={error}
      optional={optional}
    >
      <div
        className={cn(
          'flex flex-wrap gap-1.5 items-center min-h-10 px-2 py-1.5 rounded-md border bg-white',
          'focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500',
          error ? 'border-error-500' : 'border-input',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-700 cursor-pointer"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={
            value.length === 0
              ? (placeholder ?? 'Type and press Enter')
              : atLimit
                ? `Limit reached (${maxTags})`
                : 'Add another…'
          }
          disabled={disabled || atLimit}
          className="flex-1 min-w-[140px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 h-7 cursor-text shadow-none"
        />
      </div>
    </FieldWrapper>
  );
}
// components/form/LanguageField.tsx

'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

// ============================================================
// LANGUAGE FIELD
// ============================================================

interface LanguageFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;

  name?: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  optional?: boolean;
}

const MAX_LENGTH = 10;

export function LanguageField({
  value,
  onChange,
  name = 'language',
  label = 'Language',
  placeholder = 'en',
  helper = 'ISO code — e.g. en, sw, fr. Defaults to en.',
  optional,
  error,
  disabled,
  id,
}: LanguageFieldProps) {
  return (
    <FieldWrapper
      id={fieldId(name, id)}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
    >
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
        maxLength={MAX_LENGTH}
        disabled={disabled}
        className={cn(
          'cursor-text focus:ring-primary focus:border-primary',
          error && 'border-destructive',
        )}
      />
    </FieldWrapper>
  );
}
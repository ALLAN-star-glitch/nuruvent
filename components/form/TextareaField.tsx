// components/form/TextareaField.tsx

'use client';

import type { ChangeEvent, ReactNode } from 'react';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { FieldWrapper } from './FieldWrapper';
import { fieldId, type FieldBaseProps } from './types';

interface TextareaFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;

  name: string;
  label: ReactNode;
  placeholder?: string;
  helper?: string;
  optional?: boolean;

  minHeightClass?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export function TextareaField({
  value,
  onChange,
  name,
  label,
  placeholder,
  helper,
  optional,
  minHeightClass = 'min-h-[120px]',
  maxLength,
  showCounter,
  error,
  disabled,
  id,
}: TextareaFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <FieldWrapper
      id={fieldId(name, id)}
      label={label}
      helper={helper}
      error={error}
      optional={optional}
      counter={
        showCounter && maxLength
          ? { current: value.length, max: maxLength }
          : undefined
      }
    >
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          minHeightClass,
          'cursor-text focus:ring-primary focus:border-primary',
          error && 'border-destructive',
        )}
      />
    </FieldWrapper>
  );
}
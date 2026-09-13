// components/events/fields/EventTypeField.tsx

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { EventType as EventTypeModel } from '@/lib/types/events';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { FieldBaseProps, fieldId } from '@/components/form/types';



// ============================================================
// EVENT TYPE FIELD
// ============================================================
//
// Event types are passed in as props (loaded by the parent) rather
// than fetched here. Reason: the parent often needs the same list to
// resolve the selected type's display_name for the preview card, and
// we don't want two subscriptions to the same query.

interface EventTypeFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  eventTypes: EventTypeModel[];
  onTouched?: () => void;
}

export function EventTypeField({
  value,
  onChange,
  eventTypes,
  onTouched,
  error,
  disabled,
  id,
}: EventTypeFieldProps) {
  return (
    <FieldWrapper
      id={fieldId('event_type_id', id)}
      label={
        <>
          Event Type <span className="text-error-500 ml-1">*</span>
        </>
      }
      error={error}
    >
      <Select
        value={value}
        onValueChange={(v) => {
          onChange(v);
          onTouched?.();
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn('cursor-pointer', error && 'border-error-500')}
        >
          <SelectValue placeholder="Select event type" />
        </SelectTrigger>
        <SelectContent>
          {eventTypes.map((type) => (
            <SelectItem
              key={type.id}
              value={type.id}
              className="cursor-pointer"
            >
              {type.display_name || type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
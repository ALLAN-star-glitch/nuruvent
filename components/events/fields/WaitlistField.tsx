// components/events/fields/WaitlistField.tsx

'use client';

import { Users } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FieldBaseProps, fieldId } from '@/components/form/types';



// ============================================================
// WAITLIST FIELD (events)
// ============================================================
//
// Simple toggle. When enabled, attendees can join a waitlist once
// the event is full. There's no waitlist capacity in the UI yet.

interface WaitlistFieldProps extends FieldBaseProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function WaitlistField({
  value,
  onChange,
  error,
  disabled,
  id,
}: WaitlistFieldProps) {
  return (
    <div id={fieldId('waitlist_enabled', id)} className="space-y-2">
      <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
        <div>
          <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" />
            Enable waitlist
          </Label>
          <p className="text-xs text-neutral-gray">
            Let attendees join a waitlist once capacity is reached.
          </p>
        </div>
        <Switch
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>

      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
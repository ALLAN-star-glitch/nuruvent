// components/events/fields/VirtualPlatformField.tsx

'use client';

import { Video } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextField } from '@/components/form/TextField';
import { FieldBaseProps, fieldId } from '@/components/form/types';



// ============================================================
// VIRTUAL PLATFORM FIELD (events)
// ============================================================
//
// Composite: platform + URL + zoom link + meet link.
// Shown when the event is virtual or hybrid.

export type VirtualPlatform =
  | ''
  | 'zoom'
  | 'meet'
  | 'teams'
  | 'custom';

interface VirtualPlatformValue {
  virtual_platform: VirtualPlatform;
  virtual_platform_url: string;
  zoom_link: string;
  meet_link: string;
}

interface VirtualPlatformFieldProps extends FieldBaseProps {
  value: VirtualPlatformValue;
  onChange: <K extends keyof VirtualPlatformValue>(
    key: K,
    v: VirtualPlatformValue[K],
  ) => void;
}

const PLATFORMS: { value: VirtualPlatform; label: string }[] = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'meet', label: 'Google Meet' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'custom', label: 'Other / custom URL' },
];

export function VirtualPlatformField({
  value,
  onChange,
  error,
  disabled,
  id,
}: VirtualPlatformFieldProps) {
  const showZoom = !value.virtual_platform || value.virtual_platform === 'zoom';
  const showMeet = !value.virtual_platform || value.virtual_platform === 'meet';
  const showCustomUrl =
    value.virtual_platform === 'custom' ||
    value.virtual_platform === 'teams';

  return (
    <div id={fieldId('virtual_platform', id)} className="space-y-4">
      <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
        <Video className="h-4 w-4 text-primary-500" />
        Virtual Platform
      </Label>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-neutral-dark">
          Platform
        </Label>
        <Select
          value={value.virtual_platform || '__none__'}
          onValueChange={(v) =>
            onChange(
              'virtual_platform',
              (v === '__none__' ? '' : v) as VirtualPlatform,
            )
          }
          disabled={disabled}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Choose platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__" className="cursor-pointer">
              Not specified
            </SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem
                key={p.value}
                value={p.value}
                className="cursor-pointer"
              >
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showZoom && (
        <TextField
          name="zoom_link"
          label="Zoom Link"
          placeholder="https://zoom.us/meeting/..."
          value={value.zoom_link}
          onChange={(v) => onChange('zoom_link', v)}
          disabled={disabled}
          optional
        />
      )}

      {showMeet && (
        <TextField
          name="meet_link"
          label="Google Meet Link"
          placeholder="https://meet.google.com/..."
          value={value.meet_link}
          onChange={(v) => onChange('meet_link', v)}
          disabled={disabled}
          optional
        />
      )}

      {showCustomUrl && (
        <TextField
          name="virtual_platform_url"
          label="Meeting URL"
          placeholder="https://..."
          value={value.virtual_platform_url}
          onChange={(v) => onChange('virtual_platform_url', v)}
          disabled={disabled}
          optional
        />
      )}

      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
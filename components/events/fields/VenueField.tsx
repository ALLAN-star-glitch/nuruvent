// components/events/fields/VenueField.tsx

'use client';

import { MapPin } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { TextField } from '@/components/form/TextField';
import { FieldBaseProps, fieldId } from '@/components/form/types';

// ============================================================
// VENUE FIELD (events)
// ============================================================

interface VenueValue {
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_country: string;
}

interface VenueFieldProps extends FieldBaseProps {
  value: VenueValue;
  onChange: <K extends keyof VenueValue>(key: K, v: VenueValue[K]) => void;
}

export function VenueField({
  value,
  onChange,
  error,
  disabled,
  id,
}: VenueFieldProps) {
  return (
    <div id={fieldId('venue', id)} className="space-y-4">
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        Venue
      </Label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="venue_name"
          label="Venue Name"
          placeholder="e.g., iHub"
          value={value.venue_name}
          onChange={(v) => onChange('venue_name', v)}
          disabled={disabled}
          optional
        />

        <TextField
          name="venue_city"
          label="City"
          placeholder="e.g., Nairobi"
          value={value.venue_city}
          onChange={(v) => onChange('venue_city', v)}
          disabled={disabled}
          optional
        />

        <TextField
          name="venue_address"
          label="Address"
          placeholder="e.g., Senteu Plaza, 3rd Floor"
          value={value.venue_address}
          onChange={(v) => onChange('venue_address', v)}
          disabled={disabled}
          optional
        />

        <TextField
          name="venue_country"
          label="Country"
          placeholder="e.g., Kenya"
          value={value.venue_country}
          onChange={(v) => onChange('venue_country', v)}
          disabled={disabled}
          optional
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
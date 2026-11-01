// app/(public)/events/[slug]/_components/GuestAttendeeForm.tsx

'use client';

import { Mail, Phone, User } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { GuestForm } from './useEventRegistration';

interface GuestAttendeeFormProps {
  guest: GuestForm;
  onChange: React.Dispatch<React.SetStateAction<GuestForm>>;
  onBack: () => void;
}

/**
 * Guest attendee fields: full name, email, optional phone.
 * Used inside the ticket sidebar when the visitor is not signed in
 * and has chosen the "Continue as guest" path.
 */
export function GuestAttendeeForm({
  guest,
  onChange,
  onBack,
}: GuestAttendeeFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
          2. Attendee Information
        </Label>
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Back
        </button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="guestName" className="text-xs">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="guestName"
            value={guest.name}
            onChange={(e) =>
              onChange({ ...guest, name: e.target.value })
            }
            placeholder="Jane Doe"
            className="h-10 rounded-lg pl-9 text-xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="guestEmail" className="text-xs">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="guestEmail"
            type="email"
            value={guest.email}
            onChange={(e) =>
              onChange({ ...guest, email: e.target.value })
            }
            placeholder="jane@example.com"
            className="h-10 rounded-lg pl-9 text-xs"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="guestPhone" className="text-xs">
          Phone Number (Optional)
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="guestPhone"
            type="tel"
            value={guest.phone}
            onChange={(e) =>
              onChange({ ...guest, phone: e.target.value })
            }
            placeholder="+254 700 000 000"
            className="h-10 rounded-lg pl-9 text-xs"
          />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        We&apos;ll email your ticket and join links to this address.
      </p>
    </div>
  );
}
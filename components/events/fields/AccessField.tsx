// components/events/fields/AccessField.tsx

'use client';

import { Lock, Shield } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TagsField } from '@/components/form/TagsField';
import { FieldBaseProps, fieldId } from '@/components/form/types';



// ============================================================
// ACCESS & PRIVACY FIELD (events)
// ============================================================
//
// Composite: visibility, password, invite-only, invited emails.
// Uses TagsField for the email list (each email becomes a chip).

type Visibility = 'public' | 'private' | 'unlisted';

interface AccessValue {
  visibility: Visibility;
  password: string;
  invite_only: boolean;
  invited_emails: string[];
}

interface AccessFieldProps extends FieldBaseProps {
  value: AccessValue;
  onChange: <K extends keyof AccessValue>(key: K, v: AccessValue[K]) => void;
}

export function AccessField({
  value,
  onChange,
  error,
  disabled,
  id,
}: AccessFieldProps) {
  return (
    <div id={fieldId('access', id)} className="space-y-4">
      <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary-500" />
        Access &amp; Privacy
      </Label>

      {/* Visibility */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-neutral-dark">
          Visibility
        </Label>
        <Select
          value={value.visibility}
          onValueChange={(v) => onChange('visibility', v as Visibility)}
          disabled={disabled}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public" className="cursor-pointer">
              Public — listed and searchable
            </SelectItem>
            <SelectItem value="unlisted" className="cursor-pointer">
              Unlisted — accessible by link only
            </SelectItem>
            <SelectItem value="private" className="cursor-pointer">
              Private — invited users only
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-neutral-dark flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-neutral-gray" />
          Password <span className="text-neutral-gray text-xs">(optional)</span>
        </Label>
        <Input
          type="text"
          placeholder="Leave blank for no password"
          value={value.password}
          onChange={(e) => onChange('password', e.target.value)}
          disabled={disabled}
          className="cursor-text"
        />
        <p className="text-[11px] text-neutral-gray">
          Attendees must enter this to register.
        </p>
      </div>

      {/* Invite only */}
      <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
        <div>
          <Label className="text-sm font-medium text-neutral-dark">
            Invite only
          </Label>
          <p className="text-xs text-neutral-gray">
            Only people you invite can register.
          </p>
        </div>
        <Switch
          checked={value.invite_only}
          onCheckedChange={(c) => onChange('invite_only', c)}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>

      {/* Invited emails */}
      {value.invite_only && (
        <TagsField
          name="invited_emails"
          label="Invited Emails"
          placeholder="Type an email and press Enter"
          helper="One email per chip. Attendees receive an invite link."
          value={value.invited_emails}
          onChange={(v) => onChange('invited_emails', v)}
          disabled={disabled}
          maxTags={200}
          maxTagLength={120}
        />
      )}

      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
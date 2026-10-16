// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateBasicsForm.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CertificateTierSelect } from '@/components/events/fields/CertificateTierSelect';

import type { TemplateFormState } from './types';

interface Props {
  accountId: string;
  form: TemplateFormState;
  onChange: <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => void;
  disabled?: boolean;
}

export function TemplateBasicsForm({
  accountId,
  form,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tpl-name" className="text-sm">
          Template name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tpl-name"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g. CPD Certificate 2026"
          maxLength={100}
          disabled={disabled}
        />
        <p className="text-[11px] text-muted-foreground">
          Shown to organizers when choosing a template.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpl-desc" className="text-sm">
          Description
        </Label>
        <Textarea
          id="tpl-desc"
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Optional — describe when to use this template"
          rows={2}
          maxLength={500}
          disabled={disabled}
        />
      </div>

      <CertificateTierSelect
        accountId={accountId}
        value={form.tierTemplateId}
        onChange={(tierId, priceMinor, slug) => {
          onChange('tierTemplateId', tierId);
          onChange('priceMinor', priceMinor);
          onChange('tierSlug', slug);
        }}
        disabled={disabled}
      />
    </div>
  );
}
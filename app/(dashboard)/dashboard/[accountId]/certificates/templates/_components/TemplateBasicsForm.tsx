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
  onTierChange: (tierId: string, priceMinor: number, slug: string) => void;
  disabled?: boolean;
}

export function TemplateBasicsForm({
  accountId,
  form,
  onChange,
  onTierChange,
  disabled,
}: Props) {
  const isTierSelected = !!form.tierSlug || !!form.tierTemplateId;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border-2 border-primary/20 bg-primary/[0.02] p-5">
      <CertificateTierSelect
        accountId={accountId}
        value={form.tierTemplateId}
        onChange={onTierChange}
        disabled={disabled}
        fallbackPriceMinor={form.priceMinor}
      />
      </div>

      <div className={`space-y-4 transition-opacity duration-300 ${!isTierSelected ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-1.5">
          <Label htmlFor="tpl-name" className="text-sm font-medium">
            Template name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tpl-name"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. CPD Certificate 2026"
            maxLength={100}
            disabled={disabled || !isTierSelected}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tpl-desc" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="tpl-desc"
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Optional — describe when to use this template"
            rows={2}
            maxLength={500}
            disabled={disabled || !isTierSelected}
          />
        </div>
      </div>
    </div>
  );
}
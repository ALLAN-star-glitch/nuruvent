// components/events/fields/CertificateTierSelect.tsx

'use client';

import { AlertCircle } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListCertificateTemplatesQuery } from '@/lib/store/api/certificatesApi';

interface Props {
  accountId: string;
  value: string | undefined;
  /**
   * Called with the chosen tier's system-template ID, price (minor
   * units), and system slug. The slug drives UI gating in the design
   * form — 'default' | 'professional' | 'premium'.
   */
  onChange: (systemTemplateId: string, priceMinor: number, slug: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Dropdown over Nuruvent's system tiers. Used by the template editor.
 * The organizer chooses a tier; the tier's price is what they'll pay
 * per certificate. They cannot enter a custom price.
 */
export function CertificateTierSelect({
  accountId,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const { data, isLoading } = useListCertificateTemplatesQuery(accountId, {
    skip: !accountId,
  });

  const tiers = (data?.data?.templates ?? [])
    .filter((t) => t.is_system)
    .sort((a, b) => (a.price_minor ?? 0) - (b.price_minor ?? 0));

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground">Loading tiers…</p>
    );
  }

  if (tiers.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No certificate tiers available. Contact support.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="tpl-tier" className="text-sm">
        Certificate tier
      </Label>
      <Select
        value={value ?? ''}
        disabled={disabled}
        onValueChange={(id) => {
          const tier = tiers.find((t) => t.id === id);
          if (tier) {
            onChange(
              id,
              tier.price_minor ?? 0,
              tier.system_slug ?? '',
            );
          }
        }}
      >
        <SelectTrigger id="tpl-tier" className="cursor-pointer">
          <SelectValue placeholder="Choose a tier" />
        </SelectTrigger>
        <SelectContent>
          {tiers.map((t) => (
            <SelectItem key={t.id} value={t.id} className="cursor-pointer">
              {t.name} — KES {((t.price_minor ?? 0) / 100).toFixed(0)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-muted-foreground">
        Charged to you per certificate issued. Attendees don&apos;t see
        this — include it in your ticket price.
      </p>
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
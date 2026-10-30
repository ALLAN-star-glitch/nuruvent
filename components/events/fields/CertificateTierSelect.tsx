// components/events/fields/CertificateTierSelect.tsx

'use client';

import { AlertCircle, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListCertificateTemplatesQuery } from '@/lib/store/api/certificatesApi';
import type { CertificateTemplateDesign } from '@/lib/types/certificates';

interface Props {
  accountId: string;
  value: string | undefined;
  onChange: (systemTemplateId: string, priceMinor: number, slug: string, design: CertificateTemplateDesign) => void;
  error?: string;
  disabled?: boolean;
  fallbackPriceMinor?: number;
}

export function CertificateTierSelect({
  accountId,
  value,
  onChange,
  error,
  disabled,
  fallbackPriceMinor,
}: Props) {
  const { data, isLoading } = useListCertificateTemplatesQuery(accountId, {
    skip: !accountId,
    refetchOnMountOrArgChange: true, 
  });

  const tiers = (data?.data?.templates ?? [])
    .filter((t) => t.is_system)
    .sort((a, b) => (a.price_minor ?? 0) - (b.price_minor ?? 0));

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading tiers…</p>;
  if (tiers.length === 0) return <p className="text-xs text-muted-foreground">No certificate tiers available.</p>;

  let displayValue = value;
  if (!displayValue && fallbackPriceMinor) {
    const matched = tiers.find((t) => t.price_minor === fallbackPriceMinor);
    if (matched) displayValue = matched.id;
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Step 1: Choose a Tier
        </Label>
      </div>
      
      <Select
        value={displayValue ?? ''}
        disabled={disabled}
        onValueChange={(id) => {
          const tier = tiers.find((t) => t.id === id);
          if (tier) {
            // Pass the design object up to the parent
            onChange(id, tier.price_minor ?? 0, tier.system_slug ?? '', tier.design);
          }
        }}
      >
        <SelectTrigger 
          id="tpl-tier" 
          className={`cursor-pointer h-12 rounded-xl text-base ${displayValue ? 'border-primary/50 bg-primary/5' : 'border-primary/30'}`}
        >
          <SelectValue placeholder="Choose a tier to continue..." />
        </SelectTrigger>
        <SelectContent>
          {tiers.map((t) => (
            <SelectItem key={t.id} value={t.id} className="cursor-pointer py-3">
              <div className="flex w-full items-center justify-between gap-8">
                <span className="font-medium">{t.display_name || t.name}</span>
                <span className="font-bold text-primary">
                  KES {((t.price_minor ?? 0) / 100).toFixed(0)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
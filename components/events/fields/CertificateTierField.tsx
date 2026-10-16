// components/events/fields/CertificateTierField.tsx

'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useListCertificateTemplatesQuery } from '@/lib/store/api/certificatesApi';

interface Props {
  value: string | undefined;
  onChange: (templateId: string, priceMinor: number, slug: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Card-style tier picker for the event wizard.
 *
 * Behaviour:
 *   - Shows all system templates sorted by price ascending.
 *   - Preselects the tier whose ID matches `value`.
 *   - When `value` is empty on mount, defaults to the "Standard" tier
 *     (system slug `default`) once. Subsequent renders never re-default,
 *     so a user who clears the field is not fought by the effect.
 */
export function CertificateTierField({
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const { data, isLoading } = useListCertificateTemplatesQuery(accountId, {
    skip: !accountId,
  });

  const tiers = (data?.data?.templates ?? [])
    .filter((t) => t.is_system)
    .sort((a, b) => (a.price_minor ?? 0) - (b.price_minor ?? 0));

  const defaultedRef = useRef(false);

  useEffect(() => {
    if (defaultedRef.current) return;
    if (disabled) return;
    if (value) return;
    if (tiers.length === 0) return;

    const standard =
      tiers.find((t) => t.system_slug === 'default') ?? tiers[0];
    if (!standard) return;

    defaultedRef.current = true;
    onChange(
      standard.id,
      standard.price_minor ?? 0,
      standard.system_slug ?? '',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, disabled, tiers.length]);

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
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Certificate Tier
      </label>
      <p className="text-xs text-muted-foreground">
        You pay this per certificate. Include it in your ticket price —
        attendees don&apos;t see it separately.
      </p>

      <div className="space-y-2 pt-1">
        {tiers.map((t) => {
          const selected = value === t.id;
          const priceKes = ((t.price_minor ?? 0) / 100).toFixed(0);
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(t.id, t.price_minor ?? 0, t.system_slug ?? '')
              }
              className={cn(
                'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-muted/40',
                !disabled && 'cursor-pointer',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {t.name}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  KES {priceKes}
                </span>
                {selected && <Check className="h-4 w-4 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
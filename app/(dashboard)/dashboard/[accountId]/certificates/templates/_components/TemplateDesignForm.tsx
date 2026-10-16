// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateDesignForm.tsx

'use client';

import { Lock } from 'lucide-react';

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

import type { TemplateFormState } from './types';
import { CertificateTemplateDesign } from '@/lib/types/certificates';

interface Props {
  form: TemplateFormState;
  onChange: <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => void;
  onDesignChange: (
    key: keyof CertificateTemplateDesign,
    value: string | boolean,
  ) => void;
  disabled?: boolean;
}

// ============================================================
// TIER FEATURE GATING
// ============================================================
//
// Mirrors the backend's domain/tier_features.go. The UI disables
// fields the tier doesn't permit; the backend strips them regardless.

type Tier = 'default' | 'professional' | 'premium' | '';

const TIER_LABEL: Record<Exclude<Tier, ''>, string> = {
  default: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
};

function canUse(tier: Tier, feature: 'logo' | 'signature' | 'seal' | 'background' | 'watermark' | 'double_border'): boolean {
  if (!tier) return true; // no tier → no restrictions
  switch (feature) {
    case 'logo':
    case 'signature':
      return tier === 'professional' || tier === 'premium';
    case 'seal':
    case 'background':
    case 'watermark':
    case 'double_border':
      return tier === 'premium';
    default:
      return true;
  }
}

function requiredTier(feature: 'logo' | 'signature' | 'seal' | 'background' | 'watermark' | 'double_border'): Tier {
  switch (feature) {
    case 'logo':
    case 'signature':
      return 'professional';
    case 'seal':
    case 'background':
    case 'watermark':
    case 'double_border':
      return 'premium';
  }
}

const FONT_OPTIONS = [
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
];

const QR_POSITIONS = [
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' },
];

function ColorInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const v = value ?? '#000000';
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={v}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-9 cursor-pointer rounded-md border border-border"
        />
        <Input
          value={v}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}

export function TemplateDesignForm({
  form,
  onDesignChange,
  disabled,
}: Props) {
  const d = form.design;
  const tier = form.tierSlug as Tier;

  const allDisabled = disabled ?? false;

  // Per-feature disabled state
  const lockLogo = allDisabled || !canUse(tier, 'logo');
  const lockSignature = allDisabled || !canUse(tier, 'signature');
  const lockSeal = allDisabled || !canUse(tier, 'seal');
  const lockBackground = allDisabled || !canUse(tier, 'background');
  const lockWatermark = allDisabled || !canUse(tier, 'watermark');
  const lockDoubleBorder = !canUse(tier, 'double_border');

  return (
    <div className="space-y-5">
      {/* Colors */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Colors
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ColorInput
            label="Background"
            value={d.background_color}
            onChange={(v) => onDesignChange('background_color', v)}
            disabled={allDisabled}
          />
          <ColorInput
            label="Text"
            value={d.text_color}
            onChange={(v) => onDesignChange('text_color', v)}
            disabled={allDisabled}
          />
          <ColorInput
            label="Accent"
            value={d.accent_color}
            onChange={(v) => onDesignChange('accent_color', v)}
            disabled={allDisabled}
          />
        </div>
      </div>

      {/* Font */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Font family</Label>
        <Select
          value={d.font_family ?? 'Georgia'}
          onValueChange={(v) => onDesignChange('font_family', v)}
          disabled={allDisabled}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value} className="cursor-pointer">
                <span style={{ fontFamily: f.value }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Border */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Border
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Border style</Label>
            <Select
              value={d.border_style ?? 'none'}
              onValueChange={(v) => onDesignChange('border_style', v)}
              disabled={allDisabled}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">
                  None
                </SelectItem>
                <SelectItem value="single" className="cursor-pointer">
                  Single line
                </SelectItem>
                <SelectItem value="double" disabled={lockDoubleBorder} className="cursor-pointer">
                  Double line
                  {lockDoubleBorder && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      🔒 {TIER_LABEL[requiredTier('double_border') as Exclude<Tier, ''>]}
                    </span>
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(d.border_style === 'single' || d.border_style === 'double') && (
            <ColorInput
              label="Border color"
              value={d.border_color}
              onChange={(v) => onDesignChange('border_color', v)}
              disabled={allDisabled}
            />
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Images
        </p>
        <div className="space-y-3">
          <ImageInput
            label="Logo URL"
            value={d.logo_url ?? ''}
            onChange={(v) => onDesignChange('logo_url', v)}
            placeholder="https://…/logo.png"
            disabled={lockLogo}
            lockHint={
              lockLogo && !allDisabled
                ? `${TIER_LABEL[requiredTier('logo') as Exclude<Tier, ''>]} tier required`
                : undefined
            }
          />
          <ImageInput
            label="Signature image URL"
            value={d.signature_url ?? ''}
            onChange={(v) => onDesignChange('signature_url', v)}
            placeholder="https://…/signature.png"
            disabled={lockSignature}
            lockHint={
              lockSignature && !allDisabled
                ? `${TIER_LABEL[requiredTier('signature') as Exclude<Tier, ''>]} tier required`
                : undefined
            }
          />
          <ImageInput
            label="Seal URL"
            value={d.seal_url ?? ''}
            onChange={(v) => onDesignChange('seal_url', v)}
            placeholder="https://…/seal.png"
            disabled={lockSeal}
            lockHint={
              lockSeal && !allDisabled
                ? `${TIER_LABEL[requiredTier('seal') as Exclude<Tier, ''>]} tier required`
                : undefined
            }
          />
          <ImageInput
            label="Background image URL"
            value={d.background_url ?? ''}
            onChange={(v) => onDesignChange('background_url', v)}
            placeholder="https://…/background.jpg"
            disabled={lockBackground}
            lockHint={
              lockBackground && !allDisabled
                ? `${TIER_LABEL[requiredTier('background') as Exclude<Tier, ''>]} tier required`
                : undefined
            }
          />
        </div>
      </div>

      {/* Signatory */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Signatory
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={d.signatory_name ?? ''}
              onChange={(e) => onDesignChange('signatory_name', e.target.value)}
              placeholder="Dr. Alice Mwangi"
              disabled={lockSignature}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input
              value={d.signatory_title ?? ''}
              onChange={(e) => onDesignChange('signatory_title', e.target.value)}
              placeholder="Program Director"
              disabled={lockSignature}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div>
            <Label className="text-sm">Show signature line</Label>
            <p className="text-[11px] text-muted-foreground">
              Draws a rule above the signatory name.
            </p>
          </div>
          <Switch
            checked={d.signature_line ?? false}
            onCheckedChange={(v) => onDesignChange('signature_line', v)}
            disabled={lockSignature}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Badges & Watermark */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Badges & Watermark
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <Label className="text-sm">Show &quot;Verified&quot; badge</Label>
              <p className="text-[11px] text-muted-foreground">
                Renders a small verified pill next to the QR code.
              </p>
            </div>
            <Switch
              checked={d.verify_badge ?? false}
              onCheckedChange={(v) => onDesignChange('verify_badge', v)}
              disabled={lockSignature}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Watermark text</Label>
            <Input
              value={d.watermark_text ?? ''}
              onChange={(e) => onDesignChange('watermark_text', e.target.value)}
              placeholder="Official Certificate"
              disabled={lockWatermark}
            />
            {lockWatermark && !allDisabled && (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                {TIER_LABEL[requiredTier('watermark') as Exclude<Tier, ''>]} tier required
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QR position */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">QR code position</Label>
        <Select
          value={d.qr_position ?? 'bottom-right'}
          onValueChange={(v) => onDesignChange('qr_position', v)}
          disabled={allDisabled}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QR_POSITIONS.map((p) => (
              <SelectItem key={p.value} value={p.value} className="cursor-pointer">
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ============================================================
// IMAGE INPUT
// ============================================================

function ImageInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  lockHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  lockHint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-start gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 text-xs"
        />
        {value && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      {lockHint && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          {lockHint}
        </p>
      )}
    </div>
  );
}
// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateDesignForm.tsx

'use client';

import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUploadInput } from '@/components/ui/file-upload-input';

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

type Tier = 'default' | 'professional' | 'premium' | '';
type Feature = 'logo' | 'signature' | 'seal' | 'background' | 'watermark' | 'double_border';

const TIER_LABEL: Record<Exclude<Tier, ''>, string> = {
  default: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
};

function canUse(tier: Tier, feature: Feature): boolean {
  if (!tier) return true;
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

function requiredTier(feature: Feature): Tier {
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
  locked,
  onLockedClick,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
  locked?: boolean;
  onLockedClick?: () => void;
}) {
  const v = value || '#000000';
  return (
    <div className="space-y-1.5 relative">
      <Label className="text-xs text-muted-foreground flex items-center justify-between">
        {label}
        {locked && <Lock className="h-3 w-3 text-amber-600" />}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={v}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || locked}
          className="h-9 w-9 cursor-pointer rounded-md border border-border"
        />
        <Input
          value={v}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || locked}
          className="h-9 flex-1 font-mono text-xs"
        />
      </div>
      {locked && onLockedClick && (
        <div className="absolute inset-0 top-5 z-10 cursor-pointer" onClick={onLockedClick} />
      )}
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

  const [lockedFeature, setLockedFeature] = useState<Feature | null>(null);

  const isLocked = (feature: Feature) => !canUse(tier, feature);

  const handleLockedClick = (feature: Feature) => {
    setLockedFeature(feature);
  };

  const scrollToTier = () => {
    setLockedFeature(null);
    const el = document.getElementById('tpl-tier');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
      el.classList.add('ring-4', 'ring-primary/50', 'animate-pulse');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-primary/50', 'animate-pulse');
      }, 2000);
    }
  };

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
          value={d.font_family || 'Georgia'}
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
          <div className="space-y-1.5 relative">
            <Label className="text-xs text-muted-foreground flex items-center justify-between">
              Border style
              {isLocked('double_border') && (
                <span className="text-[10px] text-amber-600 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Premium required for Double
                </span>
              )}
            </Label>
            <Select
              value={d.border_style || 'none'}
              onValueChange={(v) => {
                if (v === 'double' && isLocked('double_border')) {
                  handleLockedClick('double_border');
                  return;
                }
                onDesignChange('border_style', v);
              }}
              disabled={allDisabled || isLocked('double_border')}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">None</SelectItem>
                <SelectItem value="single" className="cursor-pointer">Single line</SelectItem>
                <SelectItem value="double" className="cursor-pointer">
                  Double line
                </SelectItem>
              </SelectContent>
            </Select>
            {isLocked('double_border') && (
              <div className="absolute inset-0 top-5 z-10 cursor-pointer" onClick={() => handleLockedClick('double_border')} />
            )}
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
          <FileUploadInput
            label="Logo"
            value={d.logo_url ?? ''}
            onChange={(v) => onDesignChange('logo_url', v)}
            templateId={form.templateId || form.tierTemplateId || ''}
            disabled={allDisabled}
            locked={isLocked('logo')}
            onLockedClick={() => handleLockedClick('logo')}
          />
          <FileUploadInput
            label="Signature image"
            value={d.signature_url ?? ''}
            onChange={(v) => onDesignChange('signature_url', v)}
            templateId={form.templateId || form.tierTemplateId || ''}
            disabled={allDisabled}
            locked={isLocked('signature')}
            onLockedClick={() => handleLockedClick('signature')}
          />
          <FileUploadInput
            label="Seal"
            value={d.seal_url ?? ''}
            onChange={(v) => onDesignChange('seal_url', v)}
            templateId={form.templateId || form.tierTemplateId || ''}
            disabled={allDisabled}
            locked={isLocked('seal')}
            onLockedClick={() => handleLockedClick('seal')}
          />
          <FileUploadInput
            label="Background image"
            value={d.background_url ?? ''}
            onChange={(v) => onDesignChange('background_url', v)}
            templateId={form.templateId || form.tierTemplateId || ''}
            disabled={allDisabled}
            locked={isLocked('background')}
            onLockedClick={() => handleLockedClick('background')}
          />
        </div>
      </div>

      {/* Signatory */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Signatory
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 relative">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={d.signatory_name ?? ''}
              onChange={(e) => onDesignChange('signatory_name', e.target.value)}
              placeholder="Dr. Alice Mwangi"
              disabled={allDisabled}
            />
            {isLocked('signature') && (
              <div className="absolute inset-0 top-5 z-10 cursor-pointer" onClick={() => handleLockedClick('signature')} />
            )}
          </div>
          <div className="space-y-1.5 relative">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input
              value={d.signatory_title ?? ''}
              onChange={(e) => onDesignChange('signatory_title', e.target.value)}
              placeholder="Program Director"
              disabled={allDisabled}
            />
            {isLocked('signature') && (
              <div className="absolute inset-0 top-5 z-10 cursor-pointer" onClick={() => handleLockedClick('signature')} />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 relative">
          <div>
            <Label className="text-sm">Show signature line</Label>
            <p className="text-[11px] text-muted-foreground">
              Draws a rule above the signatory name.
            </p>
          </div>
          <Switch
            checked={d.signature_line ?? false}
            onCheckedChange={(v) => onDesignChange('signature_line', v)}
            disabled={allDisabled}
            className="cursor-pointer"
          />
          {isLocked('signature') && (
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => handleLockedClick('signature')} />
          )}
        </div>
      </div>

      {/* Badges & Watermark */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Badges & Watermark
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 relative">
            <div>
              <Label className="text-sm">Show &quot;Verified&quot; badge</Label>
              <p className="text-[11px] text-muted-foreground">
                Renders a small verified pill next to the QR code.
              </p>
            </div>
            <Switch
              checked={d.verify_badge ?? false}
              onCheckedChange={(v) => onDesignChange('verify_badge', v)}
              disabled={allDisabled}
              className="cursor-pointer"
            />
             {isLocked('signature') && (
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => handleLockedClick('signature')} />
            )}
          </div>

          <div className="space-y-1.5 relative">
            <Label className="text-xs text-muted-foreground">Watermark text</Label>
            <Input
              value={d.watermark_text ?? ''}
              onChange={(e) => onDesignChange('watermark_text', e.target.value)}
              placeholder="Official Certificate"
              disabled={allDisabled}
            />
            {isLocked('watermark') && (
              <div className="absolute inset-0 top-5 z-10 cursor-pointer" onClick={() => handleLockedClick('watermark')} />
            )}
          </div>
        </div>
      </div>

      {/* QR position */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">QR code position</Label>
        <Select
          value={d.qr_position || 'bottom-right'}
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

      {/* Locked Feature Dialog */}
      <Dialog open={!!lockedFeature} onOpenChange={(open) => !open && setLockedFeature(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Lock className="h-5 w-5" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground">
              The <strong className="text-foreground">
                {lockedFeature && TIER_LABEL[requiredTier(lockedFeature) as Exclude<Tier, ''>]}
              </strong> tier is required to use this feature.
              <br /><br />
              Your current tier (<strong className="capitalize">{TIER_LABEL[tier as Exclude<Tier, ''>] || 'Basic'}</strong>) does not support it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setLockedFeature(null)}>
              Cancel
            </Button>
            <Button onClick={scrollToTier} className="bg-primary text-primary-foreground">
              <Sparkles className="mr-2 h-4 w-4" />
              Switch Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateDesignForm.tsx

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


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
    value: string,
  ) => void;
  disabled?: boolean;
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
            disabled={disabled}
          />
          <ColorInput
            label="Text"
            value={d.text_color}
            onChange={(v) => onDesignChange('text_color', v)}
            disabled={disabled}
          />
          <ColorInput
            label="Accent"
            value={d.accent_color}
            onChange={(v) => onDesignChange('accent_color', v)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Font */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Font family</Label>
        <Select
          value={d.font_family ?? 'Georgia'}
          onValueChange={(v) => onDesignChange('font_family', v)}
          disabled={disabled}
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
            disabled={disabled}
          />
          <ImageInput
            label="Seal URL"
            value={d.seal_url ?? ''}
            onChange={(v) => onDesignChange('seal_url', v)}
            placeholder="https://…/seal.png"
            disabled={disabled}
          />
          <ImageInput
            label="Signature image URL"
            value={d.signature_url ?? ''}
            onChange={(v) => onDesignChange('signature_url', v)}
            placeholder="https://…/signature.png"
            disabled={disabled}
          />
          <ImageInput
            label="Background image URL"
            value={d.background_url ?? ''}
            onChange={(v) => onDesignChange('background_url', v)}
            placeholder="https://…/background.jpg"
            disabled={disabled}
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
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input
              value={d.signatory_title ?? ''}
              onChange={(e) => onDesignChange('signatory_title', e.target.value)}
              placeholder="Program Director"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* QR position */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">QR code position</Label>
        <Select
          value={d.qr_position ?? 'bottom-right'}
          onValueChange={(v) => onDesignChange('qr_position', v)}
          disabled={disabled}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
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
    </div>
  );
}
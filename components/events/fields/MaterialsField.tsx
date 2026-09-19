// components/events/fields/MaterialsField.tsx

'use client';

import { FileText, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TextareaField } from '@/components/form/TextareaField';
import { TextField } from '@/components/form/TextField';
import { FieldBaseProps, fieldId } from '@/components/form/types';
import { MaterialForm } from '../new';
import { makeEmptyMaterial } from '../types';

// ============================================================
// MATERIALS FIELD (events)
// ============================================================

interface MaterialsFieldProps extends FieldBaseProps {
  value: MaterialForm[];
  onChange: (value: MaterialForm[]) => void;
}

const MAX_MATERIALS = 30;

export function MaterialsField({
  value,
  onChange,
  error,
  disabled,
  id,
}: MaterialsFieldProps) {
  const update = <K extends keyof MaterialForm>(
    index: number,
    key: K,
    v: MaterialForm[K],
  ) => {
    const next = value.slice();
    next[index] = { ...next[index], [key]: v };
    onChange(next);
  };

  const addMaterial = () => {
    if (value.length >= MAX_MATERIALS) return;
    onChange([...value, makeEmptyMaterial(value.length)]);
  };

  const removeMaterial = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div id={fieldId('materials', id)} className="space-y-3">
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Materials <span className="text-muted-foreground text-xs">(optional)</span>
      </Label>

      {value.length === 0 && (
        <div className="p-4 border border-dashed border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No materials yet.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addMaterial}
            disabled={disabled}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add material
          </Button>
        </div>
      )}

      {value.map((material, index) => (
        <div
          key={material._key}
          className="border border-border rounded-lg p-4 space-y-4 bg-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Material {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeMaterial(index)}
              disabled={disabled}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              aria-label={`Remove material ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              name={`material_title_${index}`}
              label="Title"
              placeholder="e.g., Pre-reading PDF"
              value={material.title}
              onChange={(v) => update(index, 'title', v)}
              disabled={disabled}
            />
            <TextField
              name={`material_url_${index}`}
              label="URL"
              placeholder="https://..."
              value={material.url}
              onChange={(v) => update(index, 'url', v)}
              disabled={disabled}
              type="url"
            />
          </div>

          <TextareaField
            name={`material_description_${index}`}
            label="Description"
            placeholder="What is this material for?"
            value={material.description}
            onChange={(v) => update(index, 'description', v)}
            disabled={disabled}
            optional
            minHeightClass="min-h-[70px]"
          />

          <div className="flex items-center justify-between p-2 bg-muted rounded-md">
            <Label className="text-xs font-medium text-foreground">
              Pre-event material
            </Label>
            <Switch
              checked={material.is_pre_event}
              onCheckedChange={(c) => update(index, 'is_pre_event', c)}
              disabled={disabled}
              className="cursor-pointer"
            />
          </div>
        </div>
      ))}

      {value.length > 0 && value.length < MAX_MATERIALS && (
        <Button
          type="button"
          variant="outline"
          onClick={addMaterial}
          disabled={disabled}
          className="w-full cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add another material
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
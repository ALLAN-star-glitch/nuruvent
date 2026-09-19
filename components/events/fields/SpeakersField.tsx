// components/events/fields/SpeakersField.tsx

'use client';

import { Plus, Trash2, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TextareaField } from '@/components/form/TextareaField';
import { TextField } from '@/components/form/TextField';
import { FieldBaseProps, fieldId } from '@/components/form/types';
import { SpeakerForm } from '../new';
import { makeEmptySpeaker } from '../types';

// ============================================================
// SPEAKERS FIELD (events)
// ============================================================

interface SpeakersFieldProps extends FieldBaseProps {
  value: SpeakerForm[];
  onChange: (value: SpeakerForm[]) => void;
}

const MAX_SPEAKERS = 20;

export function SpeakersField({
  value,
  onChange,
  error,
  disabled,
  id,
}: SpeakersFieldProps) {
  const update = <K extends keyof SpeakerForm>(
    index: number,
    key: K,
    v: SpeakerForm[K],
  ) => {
    const next = value.slice();
    next[index] = { ...next[index], [key]: v };
    onChange(next);
  };

  const addSpeaker = () => {
    if (value.length >= MAX_SPEAKERS) return;
    onChange([...value, makeEmptySpeaker(value.length)]);
  };

  const removeSpeaker = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div id={fieldId('speakers', id)} className="space-y-3">
      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-primary" />
        Speakers <span className="text-muted-foreground text-xs">(optional)</span>
      </Label>

      {value.length === 0 && (
        <div className="p-4 border border-dashed border-border rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No speakers yet.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={addSpeaker}
            disabled={disabled}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add speaker
          </Button>
        </div>
      )}

      {value.map((speaker, index) => (
        <div
          key={speaker._key}
          className="border border-border rounded-lg p-4 space-y-4 bg-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Speaker {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeSpeaker(index)}
              disabled={disabled}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              aria-label={`Remove speaker ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              name={`speaker_name_${index}`}
              label="Name"
              placeholder="e.g., Dr. Jane Doe"
              value={speaker.name}
              onChange={(v) => update(index, 'name', v)}
              disabled={disabled}
            />
            <TextField
              name={`speaker_title_${index}`}
              label="Title"
              placeholder="e.g., CTO, Acme Corp"
              value={speaker.title}
              onChange={(v) => update(index, 'title', v)}
              disabled={disabled}
              optional
            />
          </div>

          <TextareaField
            name={`speaker_bio_${index}`}
            label="Bio"
            placeholder="A short bio…"
            value={speaker.bio}
            onChange={(v) => update(index, 'bio', v)}
            disabled={disabled}
            optional
            minHeightClass="min-h-[80px]"
          />

          <TextField
            name={`speaker_photo_${index}`}
            label="Photo URL"
            placeholder="https://..."
            value={speaker.photo_url}
            onChange={(v) => update(index, 'photo_url', v)}
            disabled={disabled}
            optional
            type="url"
          />

          <div className="flex items-center justify-between p-2 bg-muted rounded-md">
            <Label className="text-xs font-medium text-foreground">
              Keynote speaker
            </Label>
            <Switch
              checked={speaker.is_keynote}
              onCheckedChange={(c) => update(index, 'is_keynote', c)}
              disabled={disabled}
              className="cursor-pointer"
            />
          </div>
        </div>
      ))}

      {value.length > 0 && value.length < MAX_SPEAKERS && (
        <Button
          type="button"
          variant="outline"
          onClick={addSpeaker}
          disabled={disabled}
          className="w-full cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add another speaker
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
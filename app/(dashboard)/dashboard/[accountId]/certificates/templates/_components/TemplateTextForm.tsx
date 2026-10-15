// app/(dashboard)/accountId]/certificates/templates/_components/TemplateTextForm.tsx
// (Note: path typo above is only in the comment — use the real path)

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


import type { TemplateFormState } from './types';
import { CertificateTemplateDesign } from '@/lib/types/certificates';

interface Props {
  form: TemplateFormState;
  onDesignChange: (
    key: keyof CertificateTemplateDesign,
    value: string,
  ) => void;
  disabled?: boolean;
}

export function TemplateTextForm({ form, onDesignChange, disabled }: Props) {
  const d = form.design;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/40 p-3">
        <p className="text-[11px] text-muted-foreground">
          Use placeholders to insert recipient and event data. They will be
          replaced at render time:
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            '{{recipient_name}}',
            '{{context_title}}',
            '{{context_date}}',
            '{{context_duration}}',
            '{{issuer_name}}',
          ].map((p) => (
            <code
              key={p}
              className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground"
            >
              {p}
            </code>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Title</Label>
        <Input
          value={d.title_text ?? ''}
          onChange={(e) => onDesignChange('title_text', e.target.value)}
          placeholder="Certificate of Completion"
          disabled={disabled}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Subtitle</Label>
        <Input
          value={d.subtitle_text ?? ''}
          onChange={(e) => onDesignChange('subtitle_text', e.target.value)}
          placeholder="This certifies that"
          disabled={disabled}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Body</Label>
        <Textarea
          value={d.body_text ?? ''}
          onChange={(e) => onDesignChange('body_text', e.target.value)}
          placeholder="has successfully completed {{context_title}} on {{context_date}}."
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Footer</Label>
        <Input
          value={d.footer_text ?? ''}
          onChange={(e) => onDesignChange('footer_text', e.target.value)}
          placeholder="Verify at nuruvent.com/verify"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
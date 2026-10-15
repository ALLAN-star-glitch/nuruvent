// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateEditorHeader.tsx

import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
  backHref: string;
  title: string;
  isSaving: boolean;
  canSave: boolean;
  onSave: () => void;
}

export function TemplateEditorHeader({
  backHref,
  title,
  isSaving,
  canSave,
  onSave,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Link href={backHref}>
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the design, text, and price for your certificate template.
          </p>
        </div>
      </div>

      <Button
        className="cursor-pointer self-start sm:self-center"
        onClick={onSave}
        disabled={isSaving || !canSave}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save template
          </>
        )}
      </Button>
    </div>
  );
}
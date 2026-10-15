// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/DeleteTemplateDialog.tsx

'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteCertificateTemplateMutation } from '@/lib/store/api/certificatesApi';
import { CertificateTemplate } from '@/lib/types/certificates';


interface Props {
  template: CertificateTemplate | null;
  onOpenChange: (v: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteTemplateDialog({
  template,
  onOpenChange,
  onDeleted,
}: Props) {
  const [deleteTemplate, { isLoading }] = useDeleteCertificateTemplateMutation();

  const handleDelete = async () => {
    if (!template) return;
    try {
      await deleteTemplate(template.id).unwrap();
      toast.success('Template deleted');
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete template';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={!!template} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete template
          </DialogTitle>
          <DialogDescription>
            This template will be soft-deleted. Certificates already issued
            with it are unaffected.
          </DialogDescription>
        </DialogHeader>

        {template && (
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">{template.name}</p>
            {template.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {template.description}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={isLoading || !template}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Delete template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateCard.tsx

'use client';

import { useState } from 'react';
import {
  Award,
  Check,
  Eye,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CertificateTemplate } from '@/lib/types/certificates';

import { TemplatePreview } from './TemplatePreview';

interface Props {
  template: CertificateTemplate;
  onEdit: (t: CertificateTemplate) => void;
  onDelete: (t: CertificateTemplate) => void;
  onSetDefault: (t: CertificateTemplate) => void;
  isSettingDefault?: boolean;
  /** When true, admins get edit/delete actions on system templates. */
  adminMode?: boolean;
}

function formatPrice(minor: number | null | undefined): string {
  if (minor === null || minor === undefined) return 'Not set';
  if (minor === 0) return 'Free';
  return `KES ${(minor / 100).toFixed(2)}`;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
  adminMode = false,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const design = template.design ?? {};

  // Everyone can "Edit" — but for system templates, non-admins get the
  // "Customize" fork flow. Admins can also edit in place.
  const canEdit = true;
  // Delete is only shown for system templates in admin mode. Account
  // templates always allow delete.
  const canDelete = template.is_system ? adminMode : true;

  const editLabel = template.is_system && !adminMode ? 'Customize' : 'Edit';

  return (
    <>
      <Card
        className={cn(
          'flex flex-col border-border transition-colors hover:border-primary/40',
          template.is_default && 'border-primary/50 ring-1 ring-primary/20',
        )}
      >
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          {/* Header: icon + badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {template.is_default && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary"
                >
                  <Star className="mr-1 h-3 w-3" />
                  Default
                </Badge>
              )}
              {template.is_system && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
            </div>
          </div>

          {/* Name + description */}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {template.name}
            </h3>
            {template.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {template.description}
              </p>
            )}
          </div>

          {/* Design mini-preview — clickable, opens the modal */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group cursor-pointer rounded-md border border-border p-1 text-left transition-shadow hover:shadow-md"
            aria-label="Preview template"
          >
            <TemplatePreview design={design} size="sm" />
          </button>

          {/* Meta: price */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium text-foreground">
              {formatPrice(template.price_minor)}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 cursor-pointer"
              onClick={() => onEdit(template)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              {editLabel}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => setPreviewOpen(true)}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {!template.is_system && !template.is_default && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => onSetDefault(template)}
                disabled={isSettingDefault}
                title="Set as default"
              >
                <Star className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!template.is_system && !template.is_default && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onSetDefault(template)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Set as default
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onEdit(template)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {editLabel}
                </DropdownMenuItem>
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => onDelete(template)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* System template hint (non-admin) */}
          {template.is_system && !adminMode && (
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Check className="h-3 w-3" />
              Click &quot;{editLabel}&quot; to create your own version
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] w-[min(95vw,1100px)] max-w-none overflow-y-auto p-6 sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>{template.name}</DialogTitle>
            <DialogDescription>
              Sample rendering with placeholder data. Actual certificates
              use real event data.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 w-full">
            <TemplatePreview design={design} size="lg" tier={template.is_system ? 'premium' : undefined} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
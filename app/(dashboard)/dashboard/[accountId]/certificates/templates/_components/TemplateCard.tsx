// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateCard.tsx

'use client';

import {
  Award,
  Check,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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


interface Props {
  template: CertificateTemplate;
  onEdit: (t: CertificateTemplate) => void;
  onDelete: (t: CertificateTemplate) => void;
  onSetDefault: (t: CertificateTemplate) => void;
  isSettingDefault?: boolean;
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
}: Props) {
  const design = template.design ?? {};
  const previewBg = design.background_color ?? '#FFFFFF';
  const previewText = design.text_color ?? '#1A1A1A';
  const previewAccent = design.accent_color ?? '#0A6EBD';

  return (
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

        {/* Design preview */}
        <div
          className="rounded-md border p-3"
          style={{
            backgroundColor: previewBg,
            color: previewText,
            borderColor: previewAccent + '40',
          }}
        >
          <p
            className="text-center text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: previewAccent }}
          >
            {design.title_text ?? 'Certificate of Completion'}
          </p>
          <div
            className="mx-auto mt-1.5 h-0.5 w-12 rounded-full"
            style={{ backgroundColor: previewAccent }}
          />
          <p className="mt-2 text-center text-[10px]">
            {design.subtitle_text ?? 'This certifies that'}
          </p>
          <p
            className="mt-1 text-center text-xs font-semibold"
            style={{ color: previewAccent }}
          >
            {design.body_text ?? '{{recipient_name}}'}
          </p>
        </div>

        {/* Meta: price + slug */}
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
            Edit
          </Button>

          {!template.is_default && !template.is_system && (
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

          {!template.is_system && (
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
                {!template.is_default && (
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
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => onDelete(template)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* System note */}
        {template.is_system && (
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Check className="h-3 w-3" />
            Provided by Nuruvent — read-only
          </p>
        )}
      </CardContent>
    </Card>
  );
}
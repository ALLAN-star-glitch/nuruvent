'use client';

import type { MouseEvent } from 'react';
import {
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  MoreVertical,
  RotateCcw,
  Trash,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  isTrashed: boolean;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onMoveToTrash: () => void;
  small?: boolean;
}

export function EventActionsMenu({
  isTrashed,
  onView,
  onEdit,
  onDuplicate,
  onPublish,
  onRestore,
  onPermanentDelete,
  onMoveToTrash,
  small,
}: Props) {
  const stop =
    (fn: () => void) => (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      fn();
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={small ? 'h-7 w-7 cursor-pointer p-0' : 'h-8 w-8 cursor-pointer'}
        >
          <MoreVertical
            className={small ? 'h-4 w-4 text-muted-foreground' : 'h-4 w-4'}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isTrashed ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer text-emerald-600 dark:text-emerald-400"
              onClick={stop(onRestore)}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Restore
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={stop(onPermanentDelete)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Permanently
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={stop(onView)}
            >
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={stop(onEdit)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={stop(onDuplicate)}
            >
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-emerald-600 dark:text-emerald-400"
              onClick={stop(onPublish)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Publish
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={stop(onView)}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View Public Page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-amber-600 dark:text-amber-400"
              onClick={stop(onMoveToTrash)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
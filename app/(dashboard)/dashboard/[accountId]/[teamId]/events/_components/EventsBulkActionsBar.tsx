'use client';

import {
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Loader2,
  RotateCcw,
  Trash,
  Trash2,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { UIEvent } from './types';

interface Props {
  selectedIds: string[];
  uiEvents: UIEvent[];
  activeTab: string;
  publishingEventId: string | null;
  onClear: () => void;
  onView: () => void;
  onEdit: (id: string) => void;
  onPublish: (event: UIEvent) => void;
  onBulkAction: (action: string) => void;
  onDeleteEvent: (event: UIEvent) => void;
}

export function EventsBulkActionsBar({
  selectedIds,
  uiEvents,
  activeTab,
  publishingEventId,
  onClear,
  onView,
  onEdit,
  onPublish,
  onBulkAction,
  onDeleteEvent,
}: Props) {
  const count = selectedIds.length;

  const allDraft = selectedIds.every((id) => {
    const e = uiEvents.find((x) => x.id === id);
    return e?.status === 'Draft' && !e?.isDeleted;
  });

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {count} event{count > 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {count === 1 && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={onView}
            >
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onEdit(selectedIds[0])}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
          </>
        )}

        {allDraft && count > 0 && (
          <Button
            size="sm"
            className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              if (count === 1) {
                const event = uiEvents.find((e) => e.id === selectedIds[0]);
                if (event) onPublish(event);
              } else {
                onBulkAction('publish');
              }
            }}
            disabled={publishingEventId !== null}
          >
            {publishingEventId && count === 1 ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Publish {count > 1 ? `(${count})` : ''}
          </Button>
        )}

        {count > 1 && (
          <>
            {activeTab === 'trash' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  onClick={() => onBulkAction('restore')}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Restore
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => onBulkAction('permanentDelete')}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete Permanently
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onBulkAction('duplicate')}
                >
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  onClick={() => onBulkAction('delete')}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                </Button>
              </>
            )}
          </>
        )}

        {count === 1 && (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/30"
            onClick={() => {
              const event = uiEvents.find((e) => e.id === selectedIds[0]);
              if (event) onDeleteEvent(event);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer"
          onClick={onClear}
        >
          <XCircle className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
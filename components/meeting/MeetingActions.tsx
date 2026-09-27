'use client';

import {
  Edit,
  Loader2,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface MeetingActionsProps {
  running: boolean;
  onEdit: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}

export function MeetingActions({
  running,
  onEdit,
  onShare,
  onRegenerate,
  onDelete,
}: MeetingActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <Button
        size="sm"
        variant="outline"
        onClick={onEdit}
        disabled={running}
        className="cursor-pointer"
      >
        <Edit className="h-3.5 w-3.5 mr-1.5" />
        Edit Meeting
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onShare}
        disabled={running}
        className="cursor-pointer"
      >
        <Share2 className="h-3.5 w-3.5 mr-1.5" />
        Share
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onRegenerate}
        disabled={running}
        className="cursor-pointer"
      >
        {running ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            Working…
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Recreate Meeting
          </>
        )}
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onDelete}
        disabled={running}
        className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        Delete Meeting
      </Button>
    </div>
  );
}
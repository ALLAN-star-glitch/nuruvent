// components/events/fields/schedule/MeetingActionsInline.tsx

import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformMeta } from '../../video/PlatformPickerModal';

export function MeetingActionsInline({
  meetingLink,
  platform,
  isPersisted,
  hasMeeting,
  canCreateMeeting,
  isRunning,
  otherSessionsMissingMeeting,
  onCreate,
  onRegenerate,
  onDelete,
  onCopy,
  copied,
  disabled,
  isRecurring, // <--- NEW
}: {
  meetingLink?: string;
  platform?: PlatformMeta;
  isPersisted: boolean;
  hasMeeting: boolean;
  canCreateMeeting: boolean;
  isRunning: boolean;
  otherSessionsMissingMeeting: number;
  onCreate: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onCopy: () => void;
  copied: boolean;
  disabled?: boolean;
  isRecurring?: boolean; // <--- NEW
}) {
  if (!isPersisted) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          Save the event first, then you can create and manage meetings
          for each session.
        </p>
      </div>
    );
  }

  if (hasMeeting && meetingLink) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 space-y-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">
            Meeting link
            {platform && (
              <span className="text-muted-foreground font-normal ml-1">
                · {platform.label}
              </span>
            )}
          </p>
          <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-xs font-mono text-foreground/80 truncate flex-1 min-w-0">
              {meetingLink}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() =>
              window.open(meetingLink, '_blank', 'noopener,noreferrer')
            }
            disabled={disabled || isRunning}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Join
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs"
            onClick={onCopy}
            disabled={disabled || isRunning}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs"
            onClick={onRegenerate}
            disabled={disabled || isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Working…
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Regenerate
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer h-8 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onDelete}
            disabled={disabled || isRunning}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  if (otherSessionsMissingMeeting > 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          This session and {otherSessionsMissingMeeting} other
          {otherSessionsMissingMeeting === 1 ? '' : 's'} have no meeting
          yet. Create them all from the event page after saving, or open
          the detail view.
        </p>
      </div>
    );
  }

  if (!canCreateMeeting) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          Pick a video platform above to create a meeting for this
          session.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 p-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        {isRecurring
          ? 'Unique meetings will be created automatically for every occurrence when you publish.'
          : 'No meeting yet. It will be created automatically when you publish, or you can create it now.'}
      </p>
      
      {!isRecurring && (
        <Button
          size="sm"
          className="cursor-pointer h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onCreate}
          disabled={disabled || isRunning}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Create meeting now
            </>
          )}
        </Button>
      )}
    </div>
  );
}
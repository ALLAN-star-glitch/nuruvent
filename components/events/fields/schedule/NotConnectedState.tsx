// components/events/fields/schedule/NotConnectedState.tsx

import { ArrowRight, Link2, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotConnectedState({
  disabled,
  onConnect,
  onUseManual,
}: {
  disabled?: boolean;
  onConnect: () => void;
  onUseManual: () => void;
}) {
  return (
    <div className="p-4 border-t border-border bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm">
          <Plug className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">
            Connect a video platform to create this meeting automatically
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ll create a meeting on your connected account and track
            attendance for you. Takes 30 seconds.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
        <Button
          type="button"
          size="lg"
          onClick={onConnect}
          disabled={disabled}
          className={cn(
            'cursor-pointer w-full sm:w-auto',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'font-semibold shadow-sm',
          )}
        >
          <Plug className="h-4 w-4 mr-2" />
          Connect platform
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onUseManual}
          disabled={disabled}
          className={cn(
            'cursor-pointer w-full sm:w-auto',
            'border-border bg-background/80 backdrop-blur',
            'text-foreground hover:bg-background',
            'font-semibold',
          )}
        >
          <Link2 className="h-4 w-4 mr-2" />
          Paste a link manually
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
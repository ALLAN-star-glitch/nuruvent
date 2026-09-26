// components/events/video/ConnectVideoModal.tsx

'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  Plug,
  Video,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { VideoPlatform } from '@/lib/types/events';

import { useVideoConnection } from './useVideoConnection';

// ============================================================
// ConnectVideoModal
// ============================================================
//
// Shows the current connection state for a video platform and lets
// the host connect or disconnect.

interface ConnectVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: VideoPlatform;
  /**
   * Where the platform should send the user after the OAuth flow
   * completes. May be a relative path ("/dashboard/events/new") or an
   * absolute URL. Relative paths are upgraded to absolute using the
   * current frontend origin before being sent to the backend —
   * otherwise the backend would redirect the browser to its own
   * origin and the frontend wouldn't load.
   */
  returnUrl: string;
  /** Optional: called after a successful connect. */
  onConnected?: () => void;
}

const PLATFORM_META: Record<
  VideoPlatform,
  { label: string; helpText: string }
> = {
  zoom: {
    label: 'Zoom',
    helpText:
      'Connect your Zoom account to create meetings automatically for every virtual session.',
  },
  google_meet: {
    label: 'Google Meet',
    helpText:
      'Connect your Google account to create Meet links automatically. (Coming soon)',
  },
  microsoft_teams: {
    label: 'Microsoft Teams',
    helpText:
      'Connect your Microsoft account to create Teams meetings automatically. (Coming soon)',
  },
  webex: {
    label: 'Cisco Webex',
    helpText:
      'Connect your Webex account to create meetings automatically. (Coming soon)',
  },
};

/**
 * Ensure a return URL is absolute so the browser lands on the
 * frontend after OAuth. Relative paths are prefixed with the current
 * origin; already-absolute URLs are returned unchanged.
 */
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window === 'undefined') return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

export function ConnectVideoModal({
  open,
  onOpenChange,
  platform,
  returnUrl,
  onConnected,
}: ConnectVideoModalProps) {
  const video = useVideoConnection();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const connection = video.getConnection(platform);
  const meta = PLATFORM_META[platform];
  const isUnsupported = platform === 'google_meet';

  const handleConnect = async () => {
    await video.connect(platform, toAbsoluteUrl(returnUrl));
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await video.disconnect(platform);
      onConnected?.();
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Video className="h-4 w-4 text-primary" />
            </div>
            {meta.label} connection
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {meta.helpText}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Unsupported platform */}
          {isUnsupported && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                {meta.label} support is coming soon. Only Zoom is available
                today.
              </p>
            </div>
          )}

          {/* Connected state */}
          {!isUnsupported && connection && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Connected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {connection.external_email}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Connected on{' '}
                    {new Date(connection.connected_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Not connected state */}
          {!isUnsupported && !connection && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Plug className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Not connected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You&apos;ll be redirected to {meta.label} to authorize
                    Nuruvent. Once connected, we&apos;ll create meetings for
                    your virtual sessions automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Link fallback */}
          {!isUnsupported && !connection && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              <span>
                Or paste a Zoom link manually in the schedule. Attendance
                won&apos;t be tracked automatically for those sessions.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto cursor-pointer"
          >
            Close
          </Button>

          {!isUnsupported && connection && (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full sm:w-auto cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting…
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              )}
            </Button>
          )}

          {!isUnsupported && !connection && (
            <Button
              onClick={handleConnect}
              disabled={video.isConnecting}
              className={cn(
                'w-full sm:w-auto cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground',
                video.isConnecting && 'animate-pulse',
              )}
            >
              {video.isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening…
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect {meta.label}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ConnectVideoBanner
// ============================================================

interface ConnectVideoBannerProps {
  /** Not used by the banner itself, but kept for API symmetry with the modal. */
  returnUrl?: string;
  /** Called when the host clicks "Connect". */
  onOpenModal: () => void;
  /** Called when the host dismisses the banner. */
  onDismiss: () => void;
  platform?: VideoPlatform;
}

export function ConnectVideoBanner({
  onOpenModal,
  onDismiss,
  platform = 'zoom',
}: ConnectVideoBannerProps) {
  const video = useVideoConnection();
  const connection = video.getConnection(platform);
  const meta = PLATFORM_META[platform];

  if (connection) return null; // Connected — no banner needed.

  return (
    <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 sm:p-4 flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
        <Video className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">
            Connect {meta.label} for automatic meeting links
          </p>
          <Badge
            variant="outline"
            className="text-[10px] font-medium border-primary/30 text-primary bg-primary/5"
          >
            Recommended
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          We&apos;ll create a {meta.label} meeting for each virtual session
          and track attendance automatically. Or paste links manually — your
          choice.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            onClick={onOpenModal}
            className="h-8 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
          >
            <Plug className="h-3.5 w-3.5 mr-1.5" />
            Connect {meta.label}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="h-8 cursor-pointer text-xs text-muted-foreground"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
// components/events/video/PlatformPickerModal.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Link2,
  Loader2,
  Plug,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { VideoPlatform } from '@/lib/types/events';

import { useVideoConnection } from './useVideoConnection';

// ============================================================
// TYPES
// ============================================================

export interface PlatformMeta {
  platform: VideoPlatform;
  label: string;
  description: string;
  available: boolean;
  /** Path to the platform logo in /public. */
  logo: string;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    platform: 'zoom',
    label: 'Zoom',
    description:
      'Create meetings automatically for your virtual sessions and track attendance.',
    available: true,
    logo: '/platforms/zoom.png',
  },
  {
    platform: 'google_meet',
    label: 'Google Meet',
    description:
      'Create Google Meet links automatically for your virtual sessions.',
    available: false,
    logo: '/platforms/google-meet.png',
  },
  {
    platform: 'microsoft_teams',
    label: 'Microsoft Teams',
    description:
      'Create Microsoft Teams meetings for your virtual sessions.',
    available: false,
    logo: '/platforms/teams.webp',
  },
  {
    platform: 'webex',
    label: 'Cisco Webex',
    description:
      'Create Webex meetings for your virtual sessions.',
    available: false,
    logo: '/platforms/webex.png',
  },
];

interface PlatformPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the platform should send the user after OAuth. */
  returnUrl: string;
  /** Optional: restrict the list to a subset of platforms. */
  filter?: VideoPlatform[];
  /**
   * When set, the modal opens directly in the detail view for this
   * platform instead of the list view.
   */
  initialPlatform?: VideoPlatform | null;
}

// ============================================================
// HELPERS
// ============================================================

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window === 'undefined') return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

// ============================================================
// MODAL
// ============================================================

export function PlatformPickerModal({
  open,
  onOpenChange,
  returnUrl,
  filter,
  initialPlatform,
}: PlatformPickerModalProps) {
  const video = useVideoConnection();
  const [selected, setSelected] = useState<VideoPlatform | null>(
    initialPlatform ?? null,
  );
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Track whether the user navigated to the detail view from the list,
  // or the modal was opened directly into the detail view.
  // When opened directly, we hide the back button — there's nowhere
  // to go back to.
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(initialPlatform ?? null);
      // If we opened with a specific platform, no back button.
      setCanGoBack(initialPlatform ? false : false);
    }
  }, [open, initialPlatform]);

  const platforms = filter
    ? PLATFORMS.filter((p) => filter.includes(p.platform))
    : PLATFORMS;

  const selectedMeta = selected
    ? PLATFORMS.find((p) => p.platform === selected)
    : null;

  const selectedConnection = selected ? video.getConnection(selected) : null;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTimeout(() => {
        setSelected(null);
        setCanGoBack(false);
      }, 200);
    }
    onOpenChange(next);
  };

  const handleSelectFromList = (platform: VideoPlatform) => {
    setSelected(platform);
    setCanGoBack(true); // user navigated here, so back is meaningful
  };

  const handleBack = () => {
    setSelected(null);
    setCanGoBack(false);
  };

  const handleConnect = async (platform: VideoPlatform) => {
    await video.connect(platform, toAbsoluteUrl(returnUrl));
  };

  const handleDisconnect = async (platform: VideoPlatform) => {
    setIsDisconnecting(true);
    try {
      await video.disconnect(platform);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        {/* ============================================================
            HEADER — list vs detail
            ============================================================ */}
        {!selected ? (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Plug className="h-4 w-4 text-primary" />
              </div>
              Connect a video platform
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a platform. Nuruvent will create meeting links for your
              virtual sessions automatically.
            </DialogDescription>
          </DialogHeader>
        ) : (
          selectedMeta && (
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                {canGoBack && (
                  <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Back to platform list"
                    className={cn(
                      'p-1 -ml-1 rounded-md transition-colors cursor-pointer shrink-0',
                      'text-muted-foreground hover:text-foreground hover:bg-accent',
                    )}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center p-1 shrink-0">
                  <Image
                    src={selectedMeta.logo}
                    alt={`${selectedMeta.label} logo`}
                    width={28}
                    height={28}
                    className="h-full w-full object-contain"
                  />
                </div>
                {selectedMeta.label}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedMeta.description}
              </DialogDescription>
            </DialogHeader>
          )
        )}

        {/* ============================================================
            BODY
            ============================================================ */}
        <div className="py-2">
          {/* ---------- List view ---------- */}
          {!selected && (
            <div className="space-y-2">
              {platforms.map((meta) => {
                const connection = video.getConnection(meta.platform);
                const isConnected = !!connection;

                return (
                  <button
                    key={meta.platform}
                    type="button"
                    disabled={!meta.available}
                    onClick={() =>
                      meta.available && handleSelectFromList(meta.platform)
                    }
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                      isConnected
                        ? 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 cursor-pointer group'
                        : meta.available
                          ? 'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer group'
                          : 'border-border opacity-60 cursor-not-allowed',
                    )}
                  >
                    <div
                      className={cn(
                        'shrink-0 h-10 w-10 rounded-lg flex items-center justify-center',
                        'bg-background border border-border overflow-hidden p-1.5',
                        meta.available && 'group-hover:border-primary/30',
                      )}
                    >
                      <Image
                        src={meta.logo}
                        alt={`${meta.label} logo`}
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {meta.label}
                        </p>
                        {isConnected && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-primary/30 text-primary bg-primary/5"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {!meta.available && !isConnected && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-border text-muted-foreground bg-muted"
                          >
                            Coming soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {meta.description}
                      </p>
                      {isConnected && connection && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                          {connection.external_email}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isConnected ? (
                        <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                          Manage
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      ) : meta.available ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ---------- Detail view ---------- */}
          {selected && selectedMeta && (
            <div className="space-y-4 py-2">
              {!selectedMeta.available && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {selectedMeta.label} support is coming soon. Only Zoom is
                    available today.
                  </p>
                </div>
              )}

              {selectedMeta.available && selectedConnection && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Connected
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {selectedConnection.external_email}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Connected on{' '}
                        {new Date(
                          selectedConnection.connected_at,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMeta.available && !selectedConnection && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Plug className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Not connected
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You&apos;ll be redirected to {selectedMeta.label} to
                        authorize Nuruvent. Once connected, we&apos;ll create
                        meetings for your virtual sessions automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMeta.available && !selectedConnection && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" />
                  <span>
                    Or paste a {selectedMeta.label} link manually in the
                    schedule. Attendance won&apos;t be tracked automatically
                    for those sessions.
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                {canGoBack && (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="w-full sm:w-auto cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}

                {selectedMeta.available && selectedConnection && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDisconnect(selectedMeta.platform)}
                    disabled={isDisconnecting}
                    className={cn(
                      'w-full sm:w-auto cursor-pointer font-semibold',
                      canGoBack ? 'sm:ml-auto' : 'sm:ml-auto',
                      'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
                    )}
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

                {selectedMeta.available && !selectedConnection && (
                  <Button
                    onClick={() => handleConnect(selectedMeta.platform)}
                    disabled={video.isConnecting}
                    className={cn(
                      'w-full sm:w-auto cursor-pointer',
                      canGoBack ? 'sm:ml-auto' : 'sm:ml-auto',
                      'bg-primary hover:bg-primary/90 text-primary-foreground font-semibold',
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
                        Connect {selectedMeta.label}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
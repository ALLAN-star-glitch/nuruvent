/* eslint-disable react-hooks/exhaustive-deps */
// components/events/video/useVideoConnection.ts

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  useDisconnectMutation,
  useLazyBeginConnectQuery,
  useListConnectionsQuery,
} from '@/lib/store/api/videoApi';
import type { VideoConnection, VideoPlatform } from '@/lib/types/events';

// ============================================================
// useVideoConnection
// ============================================================
//
// Wraps the video connection RTK Query endpoints and adds the OAuth
// popup flow. Components use this instead of the raw RTK hooks.
//
// Usage:
//   const video = useVideoConnection();
//   video.connections           // VideoConnection[] | undefined
//   video.isLoading             // boolean
//   video.getConnection('zoom') // VideoConnection | null
//   video.isConnected('zoom')   // boolean
//   video.connect('zoom', '/dashboard/events/new')  // opens popup
//   video.disconnect('zoom')    // mutation

const POPUP_NAME = 'nuruvent-video-oauth';
const POPUP_W = 600;
const POPUP_H = 720;
const POLL_MS = 2000;
const POLL_MAX_MS = 5 * 60 * 1000; // 5 minutes max

export interface UseVideoConnectionResult {
  connections: VideoConnection[];
  isLoading: boolean;
  error: unknown;

  /** The active connection for the given platform, or null. */
  getConnection: (platform: VideoPlatform) => VideoConnection | null;

  /** Shorthand: whether an active connection exists for the platform. */
  isConnected: (platform: VideoPlatform) => boolean;

  /** Opens the OAuth flow in a popup. Falls back to same-tab. */
  connect: (platform: VideoPlatform, returnUrl: string) => Promise<void>;

  /** Whether connect() is currently in flight. */
  isConnecting: boolean;

  /** Disconnect the host's active connection for the platform. */
  disconnect: (platform: VideoPlatform) => Promise<void>;

  /** Force a refetch of the connection list. */
  refetch: () => void;
}

export function useVideoConnection(): UseVideoConnectionResult {
  const { data, isLoading, error, refetch } = useListConnectionsQuery(undefined, {
    // Refetch when the component remounts — e.g. after returning
    // from the OAuth popup, or navigating back into the wizard.
    refetchOnMountOrArgChange: true,
  });

  const [triggerConnect, { isFetching: isConnecting }] =
    useLazyBeginConnectQuery();
  const [disconnectMutation] = useDisconnectMutation();

  // Tracks the popup and polling interval so we can clean up on
  // unmount or when the connection appears.
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  const [connectInFlight, setConnectInFlight] = useState(false);

  const connections = data?.data?.connections ?? [];

  const getConnection = useCallback(
    (platform: VideoPlatform): VideoConnection | null => {
      const found = connections.find(
        (c) => c.platform === platform && c.is_active,
      );
      return found ?? null;
    },
    [connections],
  );

  const isConnected = useCallback(
    (platform: VideoPlatform) => getConnection(platform) !== null,
    [getConnection],
  );

  // ---- Polling cleanup ----

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollStartRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [stopPolling]);

  // ---- Start polling after popup opens ----

  const startPolling = useCallback(
    (platform: VideoPlatform) => {
      stopPolling();
      pollStartRef.current = Date.now();

      pollRef.current = setInterval(() => {
        // Hard stop after POLL_MAX_MS
        if (Date.now() - pollStartRef.current > POLL_MAX_MS) {
          stopPolling();
          return;
        }

        // Stop if the popup closed and no connection appeared.
        if (popupRef.current?.closed) {
          stopPolling();
          refetch();
          return;
        }

        // Refetch and check.
        refetch();
      }, POLL_MS);
    },
    [refetch, stopPolling],
  );

  // ---- Connect ----

  const connect = useCallback(
    async (platform: VideoPlatform, returnUrl: string) => {
      setConnectInFlight(true);
      try {
        const response = await triggerConnect({
          platform,
          returnUrl,
        }).unwrap();

        const authorizeUrl = response?.data?.authorize_url;
        if (!authorizeUrl) {
          toast.error('Could not start the connection flow.');
          return;
        }

        // Try popup first.
        const popup = window.open(
          authorizeUrl,
          POPUP_NAME,
          `width=${POPUP_W},height=${POPUP_H},menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes`,
        );

        if (popup) {
          popupRef.current = popup;
          popup.focus();
          startPolling(platform);
          toast.info('Complete the authorization in the popup.', {
            duration: 6000,
          });
        } else {
          // Popup blocked. Fall back to same-tab.
          // The wizard autosaves the draft, so state survives.
          toast.info('Redirecting to complete the connection…');
          window.location.href = authorizeUrl;
        }
      } catch (err) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          'Failed to start the connection flow.';
        toast.error(message);
      } finally {
        setConnectInFlight(false);
      }
    },
    [startPolling, triggerConnect],
  );

  // ---- Auto-stop polling when the connection appears ----

  useEffect(() => {
    // If we're polling and a connection just landed, stop.
    if (pollRef.current && connections.some((c) => c.is_active)) {
      stopPolling();
      toast.success('Video account connected.');
    }
  }, [connections, stopPolling]);

  // ---- Disconnect ----

  const disconnect = useCallback(
    async (platform: VideoPlatform) => {
      try {
        await disconnectMutation({ platform }).unwrap();
        toast.success('Connection removed.');
      } catch (err) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ??
          'Failed to disconnect.';
        toast.error(message);
      }
    },
    [disconnectMutation],
  );

  return {
    connections,
    isLoading,
    error,
    getConnection,
    isConnected,
    connect,
    isConnecting: isConnecting || connectInFlight,
    disconnect,
    refetch,
  };
}
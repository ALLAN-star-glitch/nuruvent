// app/(meeting)/meeting/[id]/ZoomMeetingClient.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { useLazyGetMeetingJoinInfoQuery } from '@/lib/store/api/eventsApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';

interface ZoomMeetingClientProps {
  meetingId: string;
  returnHref: string;
}

type ZoomMtgGlobal = {
  setZoomJSLib: (path: string, dir: string) => void;
  preLoadWasm: () => void;
  prepareWebSDK: () => void;
  i18n: {
    load: (lang: string) => void;
    reload: (lang: string) => void;
  };
  init: (opts: {
    leaveUrl: string;
    patchJsMedia?: boolean;
    success: () => void;
    error: (err: unknown) => void;
  }) => void;
  join: (opts: {
    signature: string;
    meetingNumber: string;
    passWord: string;
    userName: string;
    userEmail?: string;
    zak?: string;
    tk?: string;
    success: () => void;
    error: (err: unknown) => void;
  }) => void;
};

export function ZoomMeetingClient({
  meetingId,
  returnHref,
}: ZoomMeetingClientProps) {
  const user = useAppSelector(selectUser);
  const startedRef = useRef(false);
  const didInitRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Preparing meeting…');

  const [fetchJoinInfo] = useLazyGetMeetingJoinInfoQuery();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!didInitRef.current) {
        didInitRef.current = true;
        return;
      }
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const ZoomMtg = (window as unknown as { ZoomMtg?: ZoomMtgGlobal }).ZoomMtg;
    if (!ZoomMtg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Zoom SDK did not load.');
      return;
    }

    let cancelled = false;

    // Per the docs, leaveUrl must be an absolute URL.
    const leaveUrl =
      typeof window !== 'undefined'
        ? new URL(returnHref, window.location.origin).toString()
        : returnHref;

    (async () => {
      try {
        setStatus('Fetching meeting credentials…');
        const res = await fetchJoinInfo({ meetingId, platform: 'zoom' }).unwrap();
        if (cancelled) return;

        const payload = res?.data ?? res;
        if (!payload) throw new Error('Invalid response received from backend.');

        const { meeting_number, signature, password, zak } = payload as Record<
          string,
          unknown
        >;

        if (!signature || !meeting_number) {
          throw new Error('Backend did not return meeting credentials.');
        }

        const displayName =
          (user as { name?: string } | null)?.name ||
          (user as { display_name?: string } | null)?.display_name ||
          (user as { full_name?: string } | null)?.full_name ||
          (user as { email?: string } | null)?.email?.split('@')[0] ||
          'Guest';

        // Required setup, in order (per docs):
        ZoomMtg.setZoomJSLib('https://source.zoom.us/6.2.0/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        ZoomMtg.i18n.load('en-US');
        ZoomMtg.i18n.reload('en-US');

        setStatus('Connecting to Zoom…');

        ZoomMtg.init({
          leaveUrl,
          patchJsMedia: true,
          success: () => {
            if (cancelled) return;

            ZoomMtg.join({
              signature: String(signature),
              meetingNumber: String(meeting_number),
              passWord: String(password ?? ''),   // ← capital W per docs
              userName: displayName,
              ...(zak && typeof zak === 'string' ? { zak } : {}),
              success: () => {
                if (!cancelled) setStatus('Joined');
              },
              error: (err: unknown) => {
                console.error('[zoom] join failed', err);
                setError('Could not join the meeting.');
              },
            });
          },
          error: (err: unknown) => {
            console.error('[zoom] init failed', err);
            setError('Could not initialize the meeting.');
          },
        });
      } catch (err) {
        if (cancelled) return;
        console.error('[zoom] failed', err);
        setError(err instanceof Error ? err.message : 'Could not load meeting.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meetingId, fetchJoinInfo, user, returnHref]);

  if (error) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0d12',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          Could not join the meeting
        </h2>
        <p style={{ color: '#9aa0a6', marginTop: 8 }}>{error}</p>
        <a
          href={returnHref}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            background: '#1A73E8',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Return to event
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {status}
    </div>
  );
}
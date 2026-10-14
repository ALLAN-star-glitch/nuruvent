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
    // Client View parameter name — capital W.
    passWord: string;
    userName: string;
    userEmail?: string;
    // Zoom echoes this back in the join webhook as
    // participant.customer_key. The attendance module matches it
    // against attendee.Username or attendee.Email to record the join.
    // Omitting the key entirely on empty prevents the SDK's
    // undefined.toString() crash.
    customerKey?: string;
    // Always present. Empty string for attendees.
    zak: string;
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
  const [joined, setJoined] = useState(false);

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

        const {
          meeting_number,
          signature,
          password,
          zak,
          display_name,
          email: backendEmail,
        } = payload as Record<string, unknown>;

        if (!signature || !meeting_number) {
          throw new Error('Backend did not return meeting credentials.');
        }

        // Prefer the display name resolved by the backend — the only
        // source that works for guests, whose browser session has no
        // auth slice. Fall back to the logged-in user's identity for
        // backward compatibility, then to a generic label.
        const displayName =
          (typeof display_name === 'string' && display_name.trim() !== ''
            ? display_name
            : '') ||
          (user as { displayName?: string } | null)?.displayName ||
          (user as { name?: string } | null)?.name ||
          'Attendee';

        // Prefer the backend's email — again, the only source for
        // guests. Falls back to the auth slice for logged-in users.
        const userEmail =
          (typeof backendEmail === 'string' && backendEmail.trim() !== ''
            ? backendEmail
            : '') ||
          (user as { email?: string } | null)?.email ||
          '';

        // Always a string — empty for attendees.
        const zakToken = typeof zak === 'string' ? zak : '';

        // The customer key is what Zoom echoes back in the join
        // webhook as participant.customer_key. The attendance module
        // uses it (and the participant email) to match the Zoom
        // participant to a Nuruvent attendee.
        const customerKey = userEmail;

        // Debug log — remove once the join flow is verified.
        console.log('[zoom] join payload', {
          signature_len: String(signature).length,
          meetingNumber: String(meeting_number),
          passWord: String(password ?? ''),
          role: (payload as Record<string, unknown>).role,
          displayName,
          backendDisplayName: display_name,
          userEmail,
          backendEmail,
          customerKey,
          hasZak: zakToken.length > 0,
        });

        // Required setup, in order (per Client View docs):
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
              passWord: String(password ?? ''),
              userName: displayName,
              userEmail,
              ...(customerKey ? { customerKey } : {}),
              zak: zakToken,
              success: () => {
                if (cancelled) return;
                setStatus('Joined');
                setJoined(true);
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
    <>
      {/* Nuruvent brand overlay — appears once the SDK has joined.
          Top-center, above Zoom's DOM, clickable to nuruvent.com.
          Shrinks to a compact pill on mobile so it doesn't cover
          Zoom's controls. */}
      {joined && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2147483647,
            pointerEvents: 'none',
          }}
        >
          <style>{`
            .nuruvent-badge {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              padding: 10px 18px;
              background: rgba(11, 13, 18, 0.55);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 9999px;
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              color: #fff;
              font-size: 14px;
              font-weight: 600;
              font-family: system-ui, -apple-system, sans-serif;
              letter-spacing: 0.2px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
              white-space: nowrap;
              text-decoration: none;
              pointer-events: auto;
              cursor: pointer;
              transition: background 0.2s ease, transform 0.2s ease;
            }
            .nuruvent-badge:hover {
              background: rgba(11, 13, 18, 0.75);
              transform: scale(1.03);
            }
            .nuruvent-badge img {
              height: 28px;
              width: auto;
              display: block;
            }
            /* Compact on small screens */
            @media (max-width: 640px) {
              .nuruvent-badge {
                gap: 8px;
                padding: 6px 12px;
                font-size: 11px;
                letter-spacing: 0.1px;
              }
              .nuruvent-badge img {
                height: 18px;
              }
            }
          `}</style>

          <a
            href="https://nuruvent.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nuruvent-badge"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dark-theme-logo.png" alt="Nuruvent" />
            <span>Powered by Nuruvent</span>
          </a>
        </div>
      )}

      {/* Loading / status overlay — visible until joined. */}
      {!joined && (
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
      )}
    </>
  );
}
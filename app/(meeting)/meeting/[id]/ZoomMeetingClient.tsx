/* eslint-disable react-hooks/set-state-in-effect */
// app/(meeting)/meeting/[id]/ZoomMeetingClient.tsx

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyGetMeetingJoinInfoQuery } from '@/lib/store/api/eventsApi';

interface ZoomMeetingClientProps {
  meetingId: string;
}

export function ZoomMeetingClient({ meetingId }: ZoomMeetingClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<ReturnType<
    typeof window.ZoomMtgEmbedded.createClient
  > | null>(null);
  const startedRef = useRef(false);

  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<string>('Preparing the meeting…');

  const [fetchJoinInfo] = useLazyGetMeetingJoinInfoQuery();

  const start = useCallback(async () => {
    if (startedRef.current) return;
    if (!containerRef.current) return;
    startedRef.current = true;

    const ZoomMtgEmbedded = window.ZoomMtgEmbedded;
    if (!ZoomMtgEmbedded) {
      setError(
        'Zoom SDK did not load. The script tags in the meeting layout may be blocked or missing.',
      );
      return;
    }

    try {
      setStatus('Fetching meeting credentials…');

      const res = await fetchJoinInfo({ meetingId, platform: 'zoom' }).unwrap();
      const { meeting_number, signature, sdk_key, zak, password , web_endpoint} = res.data;

      // Temporary diagnostic — remove once the meeting joins cleanly.
      console.log('[zoom] join params:', {
        meetingNumber: meeting_number,
        hasSignature: !!signature,
        hasSdkKey: !!sdk_key,
        hasZak: !!zak,
        password,
      });

      setStatus('Connecting to Zoom…');

      const client = ZoomMtgEmbedded.createClient();
      clientRef.current = client;

      await client.init({
        zoomAppRoot: containerRef.current!,
        language: 'en-US',
        patchJsMedia: true,
        leaveOnPageUnload: true,
        ...(web_endpoint ? { webEndpoint: web_endpoint } : {}),
      });

      // NOTE: `sdkKey` was removed from JoinOptions in SDK v4.0.0.
      // The app key is derived from the `appKey` claim inside the
      // signature JWT, which the backend already sets. Passing it
      // causes a console warning and is otherwise ignored, so we
      // omit it here.
      await client.join({
        signature,
        meetingNumber: meeting_number,
        userName: 'Host',
        password,                    // ← the passcode (mkLZh1)
        ...(zak ? { zak } : {}),
      });

      setJoined(true);
    } catch (err) {
      const message = extractErrorMessage(err);
      console.error('Zoom join failed:', err);
      setError(message);
    }
  }, [meetingId, fetchJoinInfo]);

  // Kick off the flow once the container is mounted.
  useEffect(() => {
    void start();

    return () => {
      if (clientRef.current) {
        clientRef.current.leaveMeeting().catch(() => {
          // Best effort — the page is unmounting.
        });
        clientRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="meeting-error">
        <h2>Could not join the meeting</h2>
        <p>{error}</p>
        <button type="button" onClick={() => window.close()}>
          Close tab
        </button>
      </div>
    );
  }

  return (
    <>
      {!joined && <div className="meeting-loading">{status}</div>}
      <div
        id="meetingSDKElement"
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </>
  );
}

// Pull a readable message out of whatever RTK Query threw. The
// shape is either a FetchBaseQueryError (status + data.message) or
// a SerializedError (message). Fall back to a generic string.
function extractErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;

  if (err && typeof err === 'object') {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
    }
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }

  return 'Could not join the meeting.';
}
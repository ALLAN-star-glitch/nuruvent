// app/(meeting)/meeting/[id]/GoogleMeetRedirect.tsx

'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMeetRedirectProps {
  meetingId: string;
  meetingName?: string;
  hostName?: string;
  returnHref: string;
}

// Pexels video — swap for a self-hosted URL if you prefer.
const BG_VIDEO_SRC =
  'https://videos.pexels.com/video-files/6985526/6985526-hd_1920_1080_25fps.mp4';

const MEET_BLUE = '#1A73E8';

export function GoogleMeetRedirect({
  meetingId,
  meetingName,
  hostName,
  returnHref,
}: GoogleMeetRedirectProps) {
  const meetUrl = `https://meet.google.com/${meetingId}`;
  const openedRef = useRef(false);
  const [opened, setOpened] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Auto-open after a 3-second countdown so the user sees the branded
  // page (and the ad video) before Meet takes over the browser.
  useEffect(() => {
    if (openedRef.current) return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }

    openedRef.current = true;
    const win = window.open(meetUrl, '_blank', 'noopener,noreferrer');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (win) setOpened(true);
  }, [countdown, meetUrl]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#0b0d12',
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#fff',
      }}
    >
      {/* ─── Background video ─────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.55) saturate(1.05)',
        }}
      >
        <source src={BG_VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Cinematic overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(11,13,18,0.45) 0%, rgba(11,13,18,0.92) 100%)',
        }}
      />

      {/* Subtle top-to-bottom vignette for the header text */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(11,13,18,0.75) 0%, rgba(11,13,18,0) 22%, rgba(11,13,18,0) 78%, rgba(11,13,18,0.85) 100%)',
        }}
      />

      {/* ─── Top brand bar ────────────────────────────────── */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: '20px 24px',
        }}
      >
       {/* Nuruvent logo */}
<div
  style={{
    display: 'inline-flex',
    alignItems: 'center',
  }}
>
  <img
    src="/dark-theme-logo.png"
    alt="Nuruvent"
    style={{
      height:80,
      width: 'auto',
      display: 'block',
    }}
  />
</div>

        {/* Transition indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 500,
          }}
        >
          <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
            <path
              d="M0 4h18M15 1l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Google Meet logo */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <GoogleMeetLogo size={40} />
          <span
            style={{
              fontWeight: 500,
              fontSize: 16,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.01em',
            }}
          >
            Google Meet
          </span>
        </div>
      </header>

      {/* ─── Main content ─────────────────────────────────── */}
      <main
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 60px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'rgba(20, 22, 28, 0.55)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '32px 28px 28px',
            boxShadow:
              '0 24px 64px rgba(0, 0, 0, 0.55), 0 2px 0 rgba(255,255,255,0.05) inset',
            textAlign: 'center',
          }}
        >
          {/* Small header above the meeting name */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'rgba(52, 168, 83, 0.12)',
              border: '1px solid rgba(52, 168, 83, 0.28)',
              color: '#4ADE80',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4ADE80',
                boxShadow: '0 0 0 3px rgba(74, 222, 128, 0.25)',
              }}
            />
            Ready to join
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              color: '#fff',
            }}
          >
            {meetingName || 'Your meeting is ready'}
          </h1>

          {hostName && (
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.62)',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Hosted by{' '}
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {hostName}
              </span>
            </p>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)',
              margin: '24px 0',
            }}
          />

          {/* Countdown or opened status */}
          {!opened ? (
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.55)',
                margin: 0,
                marginBottom: 18,
              }}
            >
              Opening Google Meet in{' '}
              <span style={{ color: '#fff', fontWeight: 600 }}>
                {countdown}
              </span>{' '}
              {countdown === 1 ? 'second' : 'seconds'}…
            </p>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.55)',
                margin: 0,
                marginBottom: 18,
              }}
            >
              Google Meet opened in a new tab.
            </p>
          )}

          {/* Primary CTA */}
          <a
            href={meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '14px 22px',
              background: MEET_BLUE,
              color: '#fff',
              borderRadius: 12,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
              boxShadow:
                '0 12px 28px rgba(26, 115, 232, 0.4), 0 1px 0 rgba(255,255,255,0.15) inset',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 16px 34px rgba(26, 115, 232, 0.5), 0 1px 0 rgba(255,255,255,0.2) inset';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 12px 28px rgba(26, 115, 232, 0.4), 0 1px 0 rgba(255,255,255,0.15) inset';
            }}
          >
            <GoogleMeetLogo size={18} />
            Join with Google Meet
          </a>

          {/* Secondary actions */}
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              fontSize: 13,
            }}
          >
            <a
              href={returnHref}
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,0.95)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')
              }
            >
              ← Return to event
            </a>
          </div>
        </div>
      </main>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.02em',
        }}
      >
        Powered by Nuruvent · Google Meet handles the call
      </footer>
    </div>
  );
}

// ─── Google Meet icon (inline SVG, brand-accurate colors) ───

function GoogleMeetLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 87.5 72"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left "camera body" strip — green */}
      <path
        d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"
        fill="#00832d"
      />
      <path
        d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"
        fill="#0066da"
      />
      <path
        d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"
        fill="#e94235"
      />
      <path d="M20.5 20.5H0v31h20.5z" fill="#2684fc" />
      <path
        d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"
        fill="#00ac47"
      />
      <path
        d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"
        fill="#ffba00"
      />
    </svg>
  );
}
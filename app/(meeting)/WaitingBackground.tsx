// components/meeting/WaitingBackground.tsx

'use client';

import { useEffect, useRef, useState } from 'react';

interface WaitingBackgroundProps {
  children?: React.ReactNode;
  videoSrc?: string;
  posterSrc?: string;
  scrimOpacity?: number;
}

export function WaitingBackground({
  children,
  videoSrc,
  posterSrc,
  scrimOpacity = 0.55,
}: WaitingBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setVideoFailed(true));
  }, [videoSrc]);

  const showPoster = !videoSrc || videoFailed || !videoReady;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#0b0d12',
      }}
    >
      {posterSrc && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: showPoster ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
        />
      )}

      {videoSrc && !videoFailed && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 600ms ease',
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(0, 0, 0, ${scrimOpacity})`,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
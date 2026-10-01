'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function JoinRedirectPage() {
  const params = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params?.token;
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Missing token');
      return;
    }

    
    // Hand off to the backend's /join/:token endpoint. The backend
    // looks up the token, records the redemption, and responds with
    // a 303 to the platform meeting URL.
    window.location.replace(`${API_URL}/join/${encodeURIComponent(token)}`);
  }, [params?.token]);

  if (error) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '4rem auto',
          padding: '0 1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
          We couldn&apos;t process this link
        </h1>
        <p style={{ color: '#5F6368' }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '4rem auto',
        padding: '0 1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
      }}
    >
      <p style={{ color: '#5F6368' }}>Redirecting to your session…</p>
    </div>
  );
}
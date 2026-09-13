// components/events/new/SaveStatusIndicator.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved';
}

export function SaveStatusIndicator(props: SaveStatusIndicatorProps) {
  const status = props.status;
  const [dots, setDots] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === 'saving') {
      intervalRef.current = setInterval(() => {
        setDots(function (prev) {
          return prev.length >= 3 ? '' : prev + '.';
        });
      }, 400);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDots('');
    }

    return function cleanup() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm min-w-[120px] transition-all duration-300">
      {status === 'saving' ? (
        <span className="font-medium text-primary">
          Saving draft
          <span className="inline-block w-[24px] text-left">{dots}</span>
        </span>
      ) : null}
      {status === 'saved' ? (
        <div className="flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-4 w-4 text-tertiary-500" />
          <span className="font-medium text-tertiary-600">Draft saved</span>
        </div>
      ) : null}
    </div>
  );
}
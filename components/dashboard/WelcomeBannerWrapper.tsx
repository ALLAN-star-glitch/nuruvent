// components/dashboard/WelcomeBannerWrapper.tsx

'use client';

import { useState, useEffect } from 'react';
import { WelcomeBanner } from './WelcomeBanner';
import { useAppSelector } from '@/lib/store/hooks';

export function WelcomeBannerWrapper() {
  const { isAuthenticated, user, account } = useAppSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenBanner = localStorage.getItem(`welcome_banner_${user.id}`);
      if (hasSeenBanner === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVisible(false);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (user) {
      localStorage.setItem(`welcome_banner_${user.id}`, 'true');
    }
  };

  if (!isAuthenticated || isLoading || !isVisible) return null;

  const userName = account?.display_name || account?.name || user?.name || 'there';

  return <WelcomeBanner userName={userName} onDismiss={handleDismiss} />;
}
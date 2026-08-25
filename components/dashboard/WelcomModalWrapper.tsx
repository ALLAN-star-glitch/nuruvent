// components/dashboard/WelcomeModalWrapper.tsx

'use client';

import { useState, useEffect } from 'react';
import { WelcomeModal } from './WelcomeModal';
import { useAppSelector } from '@/lib/store/hooks';

export function WelcomeModalWrapper() {
  const { isAuthenticated, user, account } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenModal = localStorage.getItem(`welcome_modal_${user.id}`);
      
      // Check if this is a fresh login/signup
      const isNewSession = sessionStorage.getItem('new_session') === 'true';
      
      if (!hasSeenModal && isNewSession) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(true);
        // Clear the session flag after showing the modal
        sessionStorage.removeItem('new_session');
      }
      
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleClose = () => {
    setIsOpen(false);
    if (user) {
      localStorage.setItem(`welcome_modal_${user.id}`, 'true');
    }
  };

  if (!isAuthenticated || isLoading) return null;

  const userName = account?.display_name || account?.name || user?.name || 'there';

  return <WelcomeModal isOpen={isOpen} onClose={handleClose} userName={userName} />;
}
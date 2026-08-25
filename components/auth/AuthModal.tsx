// components/auth/AuthModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalSignInForm } from './ModalSignInForm';
import { ModalSignUpForm } from './ModalSignUpForm';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/store/hooks';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'signin' | 'signup';
  prefillData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  defaultMode = 'signin',
  prefillData
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Close modal and call onSuccess when authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isAuthenticated, isOpen, onClose, onSuccess]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(defaultMode);
  }, [defaultMode]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Mode Toggle */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setMode('signin')}
                className={cn(
                  "flex-1 py-3.5 text-sm font-medium transition-colors cursor-pointer",
                  mode === 'signin'
                    ? "text-[#1A73E8] border-b-2 border-[#1A73E8]"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={cn(
                  "flex-1 py-3.5 text-sm font-medium transition-colors cursor-pointer",
                  mode === 'signup'
                    ? "text-[#1A73E8] border-b-2 border-[#1A73E8]"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Create Account
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {mode === 'signin' ? (
                <ModalSignInForm 
                  onSuccess={onSuccess}
                  onSwitchToSignUp={() => setMode('signup')}
                />
              ) : (
                <ModalSignUpForm 
                  onSuccess={onSuccess}
                  onSwitchToSignIn={() => setMode('signin')}
                  prefillData={prefillData}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
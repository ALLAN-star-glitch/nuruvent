// components/dashboard/WelcomeBanner.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Sparkles, ArrowRight, Calendar, ChevronRight, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/lib/store/hooks';
import { cn } from '@/lib/utils';

interface WelcomeBannerProps {
  userName?: string;
  onDismiss?: () => void;
}

export function WelcomeBanner({ userName: propUserName, onDismiss }: WelcomeBannerProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { user, account, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Check if user has seen the welcome banner before
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenWelcome = localStorage.getItem(`welcome_banner_${user.id}`);
      if (hasSeenWelcome === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVisible(false);
      }
    }
  }, [isAuthenticated, user]);

  const dismissBanner = () => {
    setIsVisible(false);
    if (user) {
      localStorage.setItem(`welcome_banner_${user.id}`, 'true');
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleDismiss = () => {
    dismissBanner();
  };

  const handleAction = (callback: () => void) => {
    dismissBanner();
    callback();
  };

  if (!isVisible || !isAuthenticated) return null;

  const userName = propUserName || account?.display_name || account?.name || user?.name || 'there';

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Nuruvent Brand Gradient - Primary to Secondary */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 animate-gradient-x" />
      
      {/* Animated Shimmer Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      </div>

      {/* Decorative Blobs - Brand Colors */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      {/* Floating Particles */}
      <div className="absolute top-4 right-12 hidden sm:block">
        <Sparkles className="h-4 w-4 text-white/40 animate-pulse" />
      </div>
      <div className="absolute bottom-6 left-20 hidden sm:block">
        <Star className="h-3 w-3 text-white/30 animate-spin-slow" />
      </div>
      <div className="absolute top-1/2 right-8 hidden md:block">
        <Zap className="h-5 w-5 text-white/30 animate-pulse" />
      </div>

      {/* Content */}
      <Card className="relative border-0 bg-transparent shadow-none">
        <CardContent className="p-4 sm:p-5 md:p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Left Content */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Icon with Nuruvent Brand Colors */}
              <div className="hidden xs:flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 backdrop-blur-sm flex-shrink-0 shadow-lg shadow-black/10 transition-transform duration-300 hover:scale-110 border border-white/20">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Title - High Contrast White */}
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white drop-shadow-sm">
                    Welcome to Nuruvent, {userName}!
                  </h3>
                  <span className="text-base sm:text-lg">🎉</span>
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 bg-white/25 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-white font-medium shadow-sm border border-white/20">
                    <Sparkles className="h-2.5 w-2.5" />
                    New
                  </span>
                </div>
                
                {/* Description - High Contrast White/80 */}
                <p className="text-xs sm:text-sm text-white/90 mt-0.5 sm:mt-1 max-w-2xl leading-relaxed drop-shadow-sm">
                  You&apos;re all set! Start by creating your first training event and sharing it with the world.
                </p>
                
                {/* Actions - Brand Colors */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                  <Button 
                    asChild 
                    size="sm" 
                    className={cn(
                      "bg-white text-primary-700 hover:bg-white/95 hover:text-primary-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium cursor-pointer",
                      isHovered && "scale-105"
                    )}
                    onClick={() => handleAction(() => router.push('/dashboard/events/new'))}
                  >
                    <Link href="/dashboard/events/new" className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Create Your First Event</span>
                      <span className="xs:hidden">Create Event</span>
                      <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm" 
                    className="text-white/95 hover:text-white hover:bg-white/15 transition-all duration-300 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-white/20 hover:border-white/40 cursor-pointer"
                    onClick={() => handleAction(() => router.push('/how-it-works'))}
                  >
                    <Link href="/how-it-works" className="flex items-center gap-1">
                      <span className="hidden xs:inline">Learn How It Works</span>
                      <span className="xs:hidden">Learn</span>
                      <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Close Button - High Contrast with cursor-pointer */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white/60 hover:text-white hover:bg-white/15 transition-all duration-300 rounded-full p-1.5 sm:p-2 group border border-white/10 hover:border-white/30 cursor-pointer"
              aria-label="Dismiss welcome banner"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar - Brand Colors */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <div className="h-full w-0 bg-white/50 rounded-full animate-progress" />
      </div>
    </div>
  );
}
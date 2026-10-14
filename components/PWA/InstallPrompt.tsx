// components/PWA/InstallPrompt.tsx

/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// ============================================================
// BROWSER DETECTION
// ============================================================
//
// The install prompt is shown only where installation reliably
// works. Excluded:
//
//   - Firefox (all platforms) — does not support PWA installation.
//   - Safari on macOS — no install prompt API.
//   - Chrome / Firefox / Edge / Opera on iOS — WebKit shells that
//     don't expose the Add to Home Screen flow the same way Safari
//     does.
//   - Brave — has its own install flow and the beforeinstallprompt
//     event behaves inconsistently.
//
// Included:
//
//   - Chrome on desktop and Android.
//   - Edge on desktop and Android.
//   - Opera on desktop and Android.
//   - Safari on iOS — manual instructions (no install event).

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !('MSStream' in window)
  );
}

/**
 * Firefox on any platform. Firefox does not support PWA
 * installation and does not fire `beforeinstallprompt`.
 */
function isFirefox(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Firefox|FxiOS/i.test(navigator.userAgent);
}

/**
 * Brave exposes `navigator.brave` and has a different install flow.
 * The `beforeinstallprompt` event fires inconsistently, so we skip it
 * to avoid showing a button that leads to a confusing path.
 */
function isBrave(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    typeof (navigator as unknown as { brave?: unknown }).brave !== 'undefined'
  );
}

/**
 * Safari on macOS. Safari does not fire `beforeinstallprompt` and
 * offers no programmatic install. macOS users install via the
 * "Add to Dock" menu instead — not surfaced here.
 */
function isMacSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMac = /Macintosh|Mac OS X/.test(ua);
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg\//.test(ua);
  return isMac && isSafari;
}

/**
 * Chromium-based browser that supports PWA install: Chrome, Edge,
 * Opera, on desktop or Android.
 *
 * Excludes Brave (own flow), legacy Edge (EdgeHTML), Firefox,
 * Safari.
 */
function isSupportedChromium(): boolean {
  if (typeof navigator === 'undefined') return false;

  if (isFirefox()) return false;
  if (isBrave()) return false;

  const ua = navigator.userAgent;

  // Legacy Edge (EdgeHTML, pre-2020) — no PWA install support.
  if (/Edge\//.test(ua)) return false;

  // Real Chromium signals.
  const hasChromiumSignals =
    typeof (window as unknown as { chrome?: unknown }).chrome !== 'undefined' ||
    typeof (navigator as unknown as { userAgentData?: unknown })
      .userAgentData !== 'undefined';

  if (!hasChromiumSignals) return false;

  // Match Chrome / Chromium / Edge (Chromium) / Opera.
  return /Chrome|Chromium|Edg\//.test(ua);
}

/**
 * Safari on iOS — the only iOS browser that supports Add to Home
 * Screen. Chrome, Firefox, Edge, Opera on iOS are WebKit shells and
 * are excluded.
 */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua)) return false;
  return /Safari/i.test(ua);
}

// ============================================================
// COMPONENT
// ============================================================

export function InstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPromptCapable, setIsPromptCapable] = useState(false);
  const [isSafariIOS, setIsSafariIOS] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    setIsDesktop(window.innerWidth >= 1024);

    const standalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    setIsStandalone(standalone);

    // Browser capability. Computed once on mount.
    const chromium = isSupportedChromium();
    const safariIOS = isIOSSafari();
    setIsPromptCapable(chromium);
    setIsSafariIOS(safariIOS);

    // ---- Persist dismissal ----

    const dismissed = localStorage.getItem(
      'nuruvent-install-prompt-dismissed',
    );
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    if (standalone) {
      return;
    }

    // Not a supported browser. Includes Firefox, Brave, macOS Safari,
    // iOS Chrome / Firefox / Edge / Opera.
    if (!chromium && !safariIOS) {
      return;
    }

    // ---- Listen for the install prompt (supported Chromium only) ----

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setIsVisible(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Safari iOS doesn't fire `beforeinstallprompt`. Show the manual
    // instructions prompt after the same delay.
    let safariTimer: ReturnType<typeof setTimeout> | null = null;
    if (safariIOS) {
      safariTimer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
    }

    const installedHandler = () => {
      setIsVisible(false);
      setIsDismissed(true);
      localStorage.setItem('nuruvent-install-prompt-dismissed', 'true');
    };

    window.addEventListener('appinstalled', installedHandler);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      window.removeEventListener('resize', handleResize);
      if (safariTimer) clearTimeout(safariTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('nuruvent-install-prompt-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsVisible(false);

      if (result.outcome === 'accepted') {
        setIsDismissed(true);
        localStorage.setItem('nuruvent-install-prompt-dismissed', 'true');
      }
    } else if (isSafariIOS) {
      alert(
        'To install this app on iOS:\n\n1. Tap the Share button (⎋)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"',
      );
    }
  };

  if (!isMounted) {
    return null;
  }

  if (
    isStandalone ||
    isDismissed ||
    !isVisible ||
    (!isPromptCapable && !isSafariIOS)
  ) {
    return null;
  }

  // ------------------------------------------------------------
  // Desktop: bottom-left card
  // ------------------------------------------------------------
  if (isDesktop) {
    return (
      <div className="fixed bottom-24 left-4 z-50 bg-white rounded-2xl shadow-2xl p-5 border border-gray-200 max-w-xs w-full animate-in slide-in-from-left-4 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="bg-gradient-to-br from-[#1A73E8]/10 to-[#FBBC04]/10 p-4 rounded-2xl flex-shrink-0 mb-4">
            <svg
              className="w-12 h-12 text-[#1A73E8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">
              Install Nuruvent App
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Get the best experience with our native app
            </p>
            <button
              onClick={handleInstall}
              className="mt-4 w-full bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-[#1A73E8]/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // iOS Safari: top banner with instructions
  // ------------------------------------------------------------
  if (isSafariIOS) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 p-4 animate-in slide-in-from-top-4 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Dismiss install prompt"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 pr-8">
          <div className="bg-gradient-to-br from-[#1A73E8]/10 to-[#FBBC04]/10 p-2.5 rounded-xl flex-shrink-0">
            <svg
              className="w-7 h-7 text-[#1A73E8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">
              Install Nuruvent App
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Tap Share ⎋ then &quot;Add to Home Screen&quot; ➕
            </p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-4 py-2 rounded-lg text-sm transition cursor-pointer whitespace-nowrap"
          >
            Learn How
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Android (supported Chromium): top banner with install button
  // ------------------------------------------------------------
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 p-4 animate-in slide-in-from-top-4 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Dismiss install prompt"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-3 pr-8">
        <div className="bg-gradient-to-br from-[#1A73E8]/10 to-[#FBBC04]/10 p-2.5 rounded-xl flex-shrink-0">
          <svg
            className="w-7 h-7 text-[#1A73E8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">
            Install Nuruvent App
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Get the best experience with our native app
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition hover:shadow-lg hover:shadow-[#1A73E8]/30 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Check if desktop
    setIsDesktop(window.innerWidth >= 1024)

    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('nuruvent-install-prompt-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Check if already installed (standalone mode)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // Check if iOS
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 5 seconds delay
      setTimeout(() => {
        setIsVisible(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // If no beforeinstallprompt event, still show after 5 seconds
    const timer = setTimeout(() => {
      if (!isStandalone && !isDismissed) {
        setIsVisible(true)
      }
    }, 5000)

    // Listen for successful installation
    const installedHandler = () => {
      setIsVisible(false)
      setIsDismissed(true)
      localStorage.setItem('nuruvent-install-prompt-dismissed', 'true')
    }

    window.addEventListener('appinstalled', installedHandler)

    // Handle resize
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem('nuruvent-install-prompt-dismissed', 'true')
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      
      const result = await deferredPrompt.userChoice
      
      console.log(`User ${result.outcome} the install prompt`)
      
      setDeferredPrompt(null)
      setIsVisible(false)
      
      if (result.outcome === 'accepted') {
        setIsDismissed(true)
        localStorage.setItem('nuruvent-install-prompt-dismissed', 'true')
      }
    } else {
      if (isIOS) {
        alert('To install this app on iOS:\n\n1. Tap the Share button (⎋)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"')
      } else {
        alert('To install this app:\n\n1. Look for the install icon in your browser address bar\n2. Click "Install" or "Add to Home Screen"')
      }
    }
  }

  // Don't show if already installed or dismissed
  if (isStandalone || isDismissed || !isVisible) {
    return null
  }

  // Desktop: Left side, lower position
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
            <svg className="w-12 h-12 text-[#1A73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">Install Nuruvent App</h4>
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
    )
  }

  // iOS: Top banner
  if (isIOS) {
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
            <svg className="w-7 h-7 text-[#1A73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">Install Nuruvent App</h4>
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
    )
  }

  // Mobile: Top banner with button
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
          <svg className="w-7 h-7 text-[#1A73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">Install Nuruvent App</h4>
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
  )
}
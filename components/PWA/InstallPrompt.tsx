/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('nuruvent-install-prompt-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }

    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('nuruvent-install-prompt-dismissed', 'true')
  }

  if (isStandalone || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-xl p-4 border border-gray-200 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="bg-[#1A73E8]/10 p-2 rounded-lg flex-shrink-0">
          <svg className="w-6 h-6 text-[#1A73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Install Nuruvent App</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {isIOS 
              ? 'Tap Share ⎋ then "Add to Home Screen" ➕' 
              : 'Add to home screen for faster access'}
          </p>
        </div>
      </div>
    </div>
  )
}
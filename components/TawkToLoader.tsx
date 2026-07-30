/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Tawk_API: {
      isLoaded?: boolean
      [key: string]: any
    }
    Tawk_LoadStart: Date
  }
}

export function TawkToLoader() {
  useEffect(() => {
    // Function to load Tawk.to
    const loadTawkTo = () => {
      // Check if already loaded and visible
      if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API?.isLoaded) {
        const widget = document.querySelector('iframe[src*="tawk.to"]')
        if (widget) {
          return // Already loaded and visible
        }
      }

      // Reset Tawk_API
      window.Tawk_API = window.Tawk_API || {}
      window.Tawk_LoadStart = new Date()

      // Remove old script if exists
      const oldScript = document.getElementById('tawk-to-script')
      if (oldScript) {
        oldScript.remove()
      }

      // Remove old iframe if exists
      const oldIframe = document.querySelector('iframe[src*="tawk.to"]')
      if (oldIframe) {
        oldIframe.remove()
      }

      // Create new script
      const s1 = document.createElement('script')
      const s0 = document.getElementsByTagName('script')[0]
      
      // ✅ Check if s0 exists before using parentNode
      if (s0 && s0.parentNode) {
        s1.id = 'tawk-to-script'
        s1.async = true
        s1.src = 'https://embed.tawk.to/6a6afad8d285f11d460611a5/1juou7nou'
        s1.charset = 'UTF-8'
        s1.setAttribute('crossorigin', '*')
        s0.parentNode.insertBefore(s1, s0)
      } else {
        // Fallback: append to head if no script tag exists
        document.head.appendChild(s1)
      }
    }

    // Load immediately
    loadTawkTo()

    // Re-load on route changes
    const handleRouteChange = () => {
      setTimeout(loadTawkTo, 300)
    }

    // Listen for popstate (back/forward)
    window.addEventListener('popstate', handleRouteChange)

    // Listen for visibility change (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(loadTawkTo, 300)
      }
    })

    // Intercept history pushState and replaceState
    const originalPushState = history.pushState
    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      setTimeout(loadTawkTo, 300)
    }

    const originalReplaceState = history.replaceState
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      setTimeout(loadTawkTo, 300)
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      // Restore original history methods
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  return null
}
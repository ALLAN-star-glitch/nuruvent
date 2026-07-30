/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { X, Bell, BellOff } from 'lucide-react'
import { subscribeUser, unsubscribeUser } from '@/app/actions'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Check if desktop
    setIsDesktop(window.innerWidth >= 1024)

    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('nuruvent-notification-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      // eslint-disable-next-line react-hooks/immutability
      registerServiceWorker()
    }

    // Handle resize
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('nuruvent-notification-dismissed', 'true')
  }

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    try {
      setLoading(true)
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    } catch (error) {
      console.error('Failed to subscribe to push:', error)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setLoading(true)
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported || isDismissed) {
    return null
  }

  // Desktop: Bottom-left
  if (isDesktop) {
    return (
      <div className="fixed bottom-4 left-4 z-40 bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 max-w-xs w-full animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Dismiss notifications prompt"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="pr-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-[#1A73E8]" />
            <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
          </div>
          {subscription ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">You are subscribed to push notifications.</p>
              <button
                onClick={unsubscribeFromPush}
                disabled={loading}
                className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5"
              >
                <BellOff className="h-3.5 w-3.5" />
                {loading ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            </div>
          ) : (
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white font-medium px-4 py-2.5 rounded-xl text-sm transition hover:shadow-lg hover:shadow-[#1A73E8]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {loading ? 'Loading...' : 'Enable Notifications'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Mobile: Bottom-left (below install prompt)
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Dismiss notifications prompt"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="pr-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-[#1A73E8]" />
          <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
        </div>
        {subscription ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">You are subscribed to push notifications.</p>
            <button
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5"
            >
              <BellOff className="h-3.5 w-3.5" />
              {loading ? 'Unsubscribing...' : 'Unsubscribe'}
            </button>
          </div>
        ) : (
          <button
            onClick={subscribeToPush}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white font-medium px-4 py-2.5 rounded-xl text-sm transition hover:shadow-lg hover:shadow-[#1A73E8]/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Bell className="h-4 w-4" />
            {loading ? 'Loading...' : 'Enable Notifications'}
          </button>
        )}
      </div>
    </div>
  )
}
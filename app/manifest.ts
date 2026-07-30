import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nuruvent',
    short_name: 'Nuruvent',
    description: 'Light Your Training Events. Illuminate Your Growth.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1A73E8',
    orientation: 'portrait',
    scope: '/',
    categories: ['education', 'training', 'events', 'professional-development'],
    lang: 'en',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    prefer_related_applications: false,
    related_applications: [],
  }
}
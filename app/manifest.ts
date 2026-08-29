import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nuruvent — Where Professionals Grow',
    short_name: 'Nuruvent',
    description: 'The global platform where training providers and learners connect. Illuminate your training, empower your future.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563EB',
    orientation: 'portrait',
    scope: '/',
    categories: ['education', 'training', 'events', 'professional-development', 'career', 'learning'],
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
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'monochrome',
      },
    ],
    prefer_related_applications: false,
    related_applications: [],
    shortcuts: [
      {
        name: 'Browse Events',
        short_name: 'Events',
        description: 'Find professional training events',
        url: '/events',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'How It Works',
        short_name: 'How It Works',
        description: 'Learn how Nuruvent works',
        url: '/how-it-works',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Pricing',
        short_name: 'Pricing',
        description: 'Transparent pricing for global event hosts',
        url: '/pricing',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/screenshot-home.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'Nuruvent Homepage',
      },
      {
        src: '/screenshot-events.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'Browse Training Events',
      },
    ],
  }
}
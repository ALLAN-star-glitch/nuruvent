import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nuruvent.com'

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/signin',
          '/signup',
          '/forgot-password',
          '/dashboard/',
          '/profile/',
          '/admin/',
          '/settings/',
          '/*?*', // Block query parameters to avoid duplicate content
        ],
        crawlDelay: isProduction ? 2 : 10, // Be nice to crawlers
      },
      // Googlebot specific rules
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/admin/',
          '/signin',
          '/signup',
          '/forgot-password',
        ],
        crawlDelay: 1, // Googlebot can crawl faster
      },
      // Bingbot specific rules
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/admin/',
          '/signin',
          '/signup',
        ],
        crawlDelay: 2,
      },
      // AI scrapers / bots (block them from training data)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'anthropic-ai',
          'Claude-Web',
          'cohere-ai',
          'PerplexityBot',
          'Diffbot',
          'ImagesiftBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-events.xml`, // If you have separate event sitemap
    ],
    host: baseUrl.replace('https://', ''),
  }
}
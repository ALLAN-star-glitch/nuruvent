/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'nuruvent.com' },
      { protocol: 'https', hostname: 'api.nuruvent.com' },
      { protocol: 'https', hostname: '**.nuruvent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'embed.tawk.to' },
      { protocol: 'https', hostname: '*.tawk.to' },
      { protocol: 'https', hostname: 'www.googletagmanager.com' },
      { protocol: 'https', hostname: '*.google-analytics.com' },
      { protocol: 'https', hostname: '*.googleapis.com' },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  poweredByHeader: false,

  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/manifest.json',
        destination: '/manifest.webmanifest',
      },
    ];
  },

async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    {
      source: '/meeting/:id',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=*, microphone=*, display-capture=*, fullscreen=*',
        },
      ],
    },
    {
      source: '/sw.js',
      headers: [
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      ],
    },
  ];
},
};

export default nextConfig;
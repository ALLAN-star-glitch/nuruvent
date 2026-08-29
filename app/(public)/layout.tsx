// app/(public)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Nuruvent — Where Professionals Grow',
    template: '%s | Nuruvent',
  },
  description: 'The global platform where training providers and learners connect. Illuminate your training, empower your future.',
  keywords: [
    'professional training',
    'workshops',
    'webinars',
    'bootcamps',
    'certified courses',
    'CPD',
    'career development',
    'professional growth',
    'training platform',
    'global training',
    'Nuruvent',
    'online learning',
    'professional development',
  ],
  authors: [{ name: 'Nuruvent' }],
  creator: 'Nuruvent',
  publisher: 'Nuruvent',
  openGraph: {
    title: 'Nuruvent — Where Professionals Grow',
    description: 'The global platform where training providers and learners connect. Illuminate your training, empower your future.',
    url: 'https://nuruvent.com',
    siteName: 'Nuruvent',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nuruvent — Where Professionals Grow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuruvent — Where Professionals Grow',
    description: 'The global platform where training providers and learners connect. Illuminate your training, empower your future.',
    images: ['/twitter-image.jpg'],
    site: '@nuruvent',
    creator: '@nuruvent',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://nuruvent.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'education',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Header reads auth state from Redux automatically */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <Header />
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <Footer />

      {/* Tawk.to Chat Widget */}
      <Script
        id="tawk-to"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            
            if (typeof window !== 'undefined' && window.Tawk_API && window.Tawk_API.showWidget) {
              window.Tawk_API.showWidget();
            }

            (function() {
              if (document.getElementById('tawk-script-loader')) return;
              var s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
              s1.id = 'tawk-script-loader';
              s1.async = true;
              s1.src = 'https://embed.tawk.to/6a6afad8d285f11d460611a5/1juou7nou';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();

            if (typeof window !== 'undefined') {
              var hideTawkOnDashboard = function() {
                if (window.location.pathname.startsWith('/dashboard')) {
                  if (window.Tawk_API && window.Tawk_API.hideWidget) {
                    window.Tawk_API.hideWidget();
                  }
                } else {
                  if (window.Tawk_API && window.Tawk_API.showWidget) {
                    window.Tawk_API.showWidget();
                  }
                }
              };

              var originalPushState = history.pushState;
              history.pushState = function() {
                originalPushState.apply(this, arguments);
                setTimeout(hideTawkOnDashboard, 100);
              };

              var originalReplaceState = history.replaceState;
              history.replaceState = function() {
                originalReplaceState.apply(this, arguments);
                setTimeout(hideTawkOnDashboard, 100);
              };

              window.addEventListener('popstate', hideTawkOnDashboard);
            }
          `,
        }}
      />

      {/* JSON-LD Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Nuruvent',
            description: 'The global platform where training providers and learners connect. Illuminate your training, empower your future.',
            url: 'https://nuruvent.com',
            logo: 'https://nuruvent.com/logo.png',
            sameAs: [
              'https://twitter.com/nuruvent',
              'https://linkedin.com/company/nuruvent',
              'https://facebook.com/nuruvent',
              'https://instagram.com/nuruvent',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'info@nuruvent.com',
              contactType: 'customer support',
              availableLanguage: ['English'],
            },
          }),
        }}
      />
    </div>
  );
}
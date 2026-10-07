// app/(public)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Nuruvent — Training Events & Online Courses Platform',
    template: '%s | Nuruvent',
  },
  description: 'The global platform connecting training providers and learners. Discover live training events, workshops, webinars, self-paced online courses, and earn certified qualifications.',
  keywords: [
    'training events and courses',
    'online courses platform',
    'professional training',
    'workshops',
    'webinars',
    'bootcamps',
    'certified courses',
    'CPD certificates',
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
    title: 'Nuruvent — Training Events & Online Courses Platform',
    description: 'The global platform connecting training providers and learners. Discover live training events, workshops, webinars, self-paced online courses, and earn certified qualifications.',
    url: 'https://nuruvent.com',
    siteName: 'Nuruvent',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/hero-image.png',
        width: 1200,
        height: 630,
        alt: 'Nuruvent — Training Events & Online Courses Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuruvent — Training Events & Online Courses Platform',
    description: 'The global platform connecting training providers and learners. Discover live training events, workshops, webinars, self-paced online courses, and earn certified qualifications.',
    images: ['/hero-image.png'],
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
        // Paths where the chat widget should stay hidden.
        var HIDDEN_PATHS = ['/dashboard', '/events/', '/meeting/', '/checkout/'];

        var syncTawkVisibility = function() {
          var path = window.location.pathname;
          var shouldHide = HIDDEN_PATHS.some(function(p) {
            return path === p || path.indexOf(p) === 0;
          });

          if (!window.Tawk_API) return;

          if (shouldHide) {
            if (window.Tawk_API.hideWidget) window.Tawk_API.hideWidget();
          } else {
            if (window.Tawk_API.showWidget) window.Tawk_API.showWidget();
          }
        };

        // Run once on load (Tawk may still be initializing — retry briefly)
        syncTawkVisibility();
        var retries = 0;
        var retryTimer = setInterval(function() {
          syncTawkVisibility();
          retries += 1;
          if (retries >= 20 || (window.Tawk_API && window.Tawk_API.hideWidget)) {
            clearInterval(retryTimer);
          }
        }, 250);

        // Hook into client-side navigations
        var originalPushState = history.pushState;
        history.pushState = function() {
          originalPushState.apply(this, arguments);
          setTimeout(syncTawkVisibility, 100);
        };

        var originalReplaceState = history.replaceState;
        history.replaceState = function() {
          originalReplaceState.apply(this, arguments);
          setTimeout(syncTawkVisibility, 100);
        };

        window.addEventListener('popstate', syncTawkVisibility);
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
            '@type': 'EducationalOrganization',
            name: 'Nuruvent',
            description: 'The global platform connecting training providers and learners for live events, workshops, and self-paced online courses.',
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
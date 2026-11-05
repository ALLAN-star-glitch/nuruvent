// app/(public)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script';

const SITE_URL = 'https://nuruvent.com';
const LEGAL_NAME = 'Nuruvent Solutions';
const BRAND_NAME = 'Nuruvent';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nuruvent Solutions — Training, Academic Events & Online Courses Platform',
    template: `%s | ${LEGAL_NAME}`,
  },
  description:
    'Nuruvent Solutions is the global platform connecting training providers, institutions, and learners. Manage CPD workshops, academic milestones, campus events, and online courses with M-Pesa payments, QR-verified certificates, and automated attendance.',
  keywords: [
    'Nuruvent',
    'Nuruvent Solutions',
    'training events and courses',
    'online courses platform',
    'professional training',
    'workshops',
    'webinars',
    'bootcamps',
    'certified courses',
    'CPD certificates',
    'QR verified certificates',
    'event management platform',
    'ticketing platform',
    'academic events',
    'graduation ticketing',
    'campus events',
    'student union events',
    'career development',
    'professional growth',
    'events Kenya',
    'M-Pesa event payments',
    'Airtel Money payments',
    'training Kenya',
    'global training',
    'online learning',
    'professional development',
    'LMS integration',
    'Moodle integration',
  ],
  authors: [{ name: LEGAL_NAME, url: SITE_URL }],
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  category: 'education',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: LEGAL_NAME,
    title: 'Nuruvent Solutions — Training, Academic Events & Online Courses Platform',
    description:
      'Connect with training providers and learners worldwide. Discover professional workshops, bootcamps, webinars, academic events, and online courses. Illuminate your training, empower your future.',
    // Images removed
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nuruvent',
    creator: '@nuruvent',
    title: 'Nuruvent Solutions — Training, Academic Events & Online Courses Platform',
    description:
      'Connect with training providers and learners worldwide. Discover professional workshops, bootcamps, webinars, and online courses.',
    // Images removed
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
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-32x32.png',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured data for Google Knowledge Panel
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: LEGAL_NAME,
    alternateName: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'Nuruvent Solutions is a training and educational event management and discovery platform. It empowers universities, training institutions, individual trainers, and student organizers to create, manage, and monetize training and academic events with M-Pesa payments, QR-verified certificates, automated attendance tracking, and CPD credits.',
    foundingDate: '2025',
    areaServed: [
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Country', name: 'Tanzania' },
      { '@type': 'Country', name: 'Uganda' },
      { '@type': 'Country', name: 'Rwanda' },
    ],
    sameAs: [
      'https://twitter.com/nuruvent',
      'https://linkedin.com/company/nuruvent',
      'https://facebook.com/nuruvent',
      'https://instagram.com/nuruvent',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'support@nuruvent.com',
        contactType: 'customer support',
        availableLanguage: ['English', 'Swahili'],
      },
      {
        '@type': 'ContactPoint',
        email: 'sales@nuruvent.com',
        contactType: 'sales',
        availableLanguage: ['English'],
      },
    ],
    knowsAbout: [
      'Event Management',
      'Professional Training',
      'CPD Certification',
      'Academic Events',
      'Mobile Money Payments',
      'M-Pesa Integration',
      'QR Code Verification',
      'Learning Management Systems',
      'Moodle Integration',
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
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
              var HIDDEN_PATHS = ['/dashboard', '/events/', '/meeting/', '/checkout/', '/profile', '/accounts'];

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

              syncTawkVisibility();
              var retries = 0;
              var retryTimer = setInterval(function() {
                syncTawkVisibility();
                retries += 1;
                if (retries >= 20 || (window.Tawk_API && window.Tawk_API.hideWidget)) {
                  clearInterval(retryTimer);
                }
              }, 250);

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

      {/* Organization Structured Data (Knowledge Panel) */}
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </div>
  );
}
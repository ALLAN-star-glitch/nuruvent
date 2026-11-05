// app/page.tsx

import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Award,
  Users,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeEventGrid } from '@/components/home/HomeEventGrid';
import { Button } from '@/components/ui/button';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { PushNotificationManager } from '@/components/PWA/PushNotificationManager';
import { EventCategories } from '@/components/home/EventsCategories';
import { MobileAuthRedirect } from '../_components/MobileAuthRedirect';

const HOME_TITLE = 'Nuruvent Solutions — Training, Academic Events & Certification Platform';
const HOME_DESCRIPTION =
  'Nuruvent Solutions is the global platform connecting training providers, institutions, and learners. Manage CPD workshops, academic milestones, campus events, and online courses with M-Pesa payments, QR certificates, and automated attendance.';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Nuruvent Solutions',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/hero-image.png',
        width: 1200,
        height: 630,
        alt: 'Nuruvent Solutions — Training Events, Academic Events & Online Courses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ['/hero-image.png'],
    creator: '@Nuruvent',
  },
  keywords: [
    'training events and courses',
    'online courses platform',
    'professional training Kenya',
    'academic events',
    'graduation ticketing',
    'CPD certificates',
    'M-Pesa event payments',
    'bootcamps',
    'workshops',
    'webinars',
    'student union events',
    'campus events',
    'QR verified certificates',
    'event management platform',
    'ticketing platform Kenya',
    'Nuruvent Solutions',
  ],
};

export const revalidate = 3600;

export default function HomePage() {
  // JSON-LD Structured Data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Nuruvent Solutions',
    alternateName: 'Nuruvent',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      'https://twitter.com/Nuruvent',
      'https://www.linkedin.com/company/nuruvent',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@nuruvent.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MobileAuthRedirect />
      <InstallPrompt />
      <PushNotificationManager />

      <HeroSection />

      <section className="bg-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Browse by Category
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Find the perfect event or course for your career
            </p>
          </div>
          <EventCategories />
        </div>
      </section>

      <section className="bg-muted/30 py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <HomeEventGrid
            limit={8}
            title="Explore Training Events & Courses"
            subtitle="Discover professional workshops, live bootcamps, certified online courses, and academic events from training providers worldwide"
          />
        </div>
      </section>

      {/* ... rest of the page JSX is unchanged ... */}
    </>
  );
}
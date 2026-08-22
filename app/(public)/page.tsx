// app/page.tsx

import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, Award, Users, Globe } from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { EventGrid } from '@/components/home/EventGrid';
import { Button } from '@/components/ui/button';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { PushNotificationManager } from '@/components/PWA/PushNotificationManager';

export const metadata: Metadata = {
  title: `${SITE_NAME} | Global Training Event Platform`,
  description: SITE_DESCRIPTION + ' The all-in-one platform for training institutes, coaches, and professional bodies to manage workshops, webinars, bootcamps, and meetups worldwide.',
  // ... rest of your metadata
};

export default function HomePage() {
  return (
    <>
      <InstallPrompt />
      <PushNotificationManager />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Events Section */}
      <section className="bg-gray-50/50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Programs
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Upcoming Training Events
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Explore handpicked professional development sessions led by industry experts.
              </p>
            </div>
            
            <Link href="/events" className="cursor-pointer">
              <Button variant="outline" className="gap-2 group border-gray-300 hover:border-primary cursor-pointer rounded-full">
                Explore All Events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <EventGrid limit={6} />

          <div className="mt-12 text-center">
            <Link href="/events" className="cursor-pointer">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium px-8 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer">
                View Full Event Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
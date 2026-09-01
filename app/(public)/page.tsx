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
  ChevronRight
} from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeEventGrid } from '@/components/home/HomeEventGrid';
import { Button } from '@/components/ui/button';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { PushNotificationManager } from '@/components/PWA/PushNotificationManager';
import { EventCategories } from '@/components/home/EventsCategories';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Professional Events & Online Courses Platform`,
  description: 'Nuruvent is the global platform connecting training providers and learners. Discover professional workshops, live bootcamps, self-paced online courses, and certified programs worldwide.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} — Professional Events & Online Courses Platform`,
    description: 'Connect with training providers and learners worldwide. Discover professional workshops, bootcamps, webinars, and online courses. Illuminate your training, empower your future.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
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
    title: `${SITE_NAME} — Professional Events & Online Courses Platform`,
    description: 'Connect with training providers and learners worldwide. Discover professional workshops, bootcamps, webinars, and online courses.',
    images: ['/hero-image.png'],
  },
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
    'Nuruvent',
    'online learning',
  ],
};

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <InstallPrompt />
      <PushNotificationManager />

      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section - Compact Circles */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
              Browse by Category
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Find the perfect event or course for your career
            </p>
          </div>
          
          <EventCategories />
        </div>
      </section>

      {/* Training Events & Courses Section */}
      <section className="bg-gray-50/30 py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <HomeEventGrid 
            limit={8}
            title="Explore Training Events & Courses"
            subtitle="Discover professional workshops, live bootcamps, and certified online courses from training providers worldwide"
          />
        </div>
      </section>

      {/* Why Choose Nuruvent Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-secondary/10 text-secondary rounded-full mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Why Nuruvent
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Built for Professional Growth
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              Everything you need to discover, enroll in, and excel across professional training events and online courses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow cursor-default">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Events & Courses</h3>
              <p className="text-sm text-gray-600 mt-1">Handpicked training sessions and self-paced courses from verified professionals worldwide</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow cursor-default">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-secondary-100 text-secondary-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Expert Instructors</h3>
              <p className="text-sm text-gray-600 mt-1">Learn from industry experts with real-world experience across the globe</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow cursor-default">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-tertiary-100 text-tertiary-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Certified Learning</h3>
              <p className="text-sm text-gray-600 mt-1">Earn recognized QR-verified CPD certificates to boost your career</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow cursor-default">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Flexible Formats</h3>
              <p className="text-sm text-gray-600 mt-1">In-person workshops, virtual webinars, and self-paced online courses to fit your schedule</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional CTA Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Get Started Today
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Ready to Grow Your Career?
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of professionals and training providers who are advancing their careers 
              and growing their businesses through Nuruvent. Discover your next event or course today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/events" className="cursor-pointer">
                <Button 
                  size="lg" 
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  Explore Events & Courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link href="/how-it-works" className="cursor-pointer">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-gray-300 hover:border-primary-400 text-gray-700 hover:text-primary-600 font-semibold px-8 py-6 rounded-full transition-all duration-300 cursor-pointer"
                >
                  Learn More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                Free to browse
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                Global reach
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
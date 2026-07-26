'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Award, CheckCircle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[65vh] lg:min-h-[70vh] flex items-center overflow-hidden bg-white">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-image.png"
          alt="Training Event"
          fill
          className="object-cover object-right"
          priority
        />
        
        {/* Desktop: Smooth left-to-right gradient overlay - image visible on right */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        {/* Mobile & Tablet Fallback Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/60 lg:hidden" />
      </div>

      {/* Pattern Overlay on Left Side */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
        <svg
          className="absolute left-8 top-8 h-64 w-64 lg:h-80 lg:w-80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="dotPattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="2" fill="#2563eb" opacity="0.15" />
          </pattern>
          <rect x="0" y="0" width="200" height="200" fill="url(#dotPattern)" />
        </svg>
      </div>

      {/* Subtle Background Glow behind content */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-6 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 xl:col-span-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-3 cursor-default border border-primary/15 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Kenya&apos;s Training Event Platform
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-3">
              Light Your{' '}
              <span className="text-primary bg-clip-text">Training Events</span>,
              <br className="hidden sm:block" />
              Illuminate Your{' '}
              <span className="text-secondary">Growth</span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-700 max-w-xl mx-auto lg:mx-0 mb-5 leading-relaxed">
              The all-in-one platform for training institutes, coaches, and professional bodies 
              to manage workshops, webinars, bootcamps, and meetups in Kenya.
            </p>

            {/* Feature Chips */}
            <div className="flex flex-wrap gap-2.5 md:gap-3 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs md:text-sm font-medium text-gray-700">M-Pesa Payments</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs md:text-sm font-medium text-gray-700">QR Certificates</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs md:text-sm font-medium text-gray-700">10% Commission</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 justify-center lg:justify-start">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-5 text-sm md:text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                  Start Hosting
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="#events">
                <Button size="lg" variant="outline" className="border-gray-200 bg-white hover:bg-gray-50 px-6 py-5 text-sm md:text-base rounded-xl font-medium shadow-sm transition-all">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Glass Badges */}
          <div className="lg:col-span-5 xl:col-span-6 hidden lg:block relative min-h-[320px]">
            {/* Floating Badge 1 */}
            <div className="absolute top-6 left-0 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float z-20">
              <div className="bg-tertiary/15 p-2 rounded-xl">
                <Award className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">QR Verified</p>
                <p className="text-[11px] text-gray-600">Digital Certificates</p>
              </div>
            </div>

            {/* Floating Badge 2 */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-6 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float z-20" style={{ animationDelay: '1s' }}>
              <div className="bg-primary/15 p-2 rounded-xl">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">M-Pesa Express</p>
                <p className="text-[11px] text-gray-600">Instant Ticketing</p>
              </div>
            </div>

            {/* Floating Badge 3 */}
            <div className="absolute bottom-8 left-2 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float-delayed z-20">
              <div className="bg-secondary/15 p-2 rounded-xl">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">5,000+</p>
                <p className="text-[11px] text-gray-600">Active Learners</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
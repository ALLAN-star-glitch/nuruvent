'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Users,
  Award,
  CheckCircle,
  Globe,
  Sparkles,
  School,
  Briefcase,
  UserCircle,
  Building2,
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[65vh] lg:min-h-[70vh] flex items-center overflow-hidden bg-background">
      {/* Background Video Container */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-right"
        >
          <source
            src="https://www.pexels.com/download/video/5486220/"
            type="video/mp4"
          />
        </video>

        {/* Desktop overlay */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        {/* Tablet overlay */}
        <div className="hidden md:block lg:hidden absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/50" />
        </div>
      </div>

      {/* Mobile background image */}
      <div className="absolute inset-0 z-0 md:hidden">
        <Image
          src="/hero-image.png"
          alt="Training Events and Online Courses"
          fill
          className="object-cover object-right"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      </div>

      {/* Dot pattern */}
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

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-6 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left column */}
          <div className="lg:col-span-7 xl:col-span-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-3 cursor-default border border-primary/15 shadow-sm">
              <Sparkles className="h-3 w-3" />
              <span>For Everyone Who Hosts & Attends Events or Courses</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15] mb-3">
              <span className="text-primary bg-clip-text">Nuruvent</span> - Where
              <br className="hidden sm:block" />
              <span className="text-secondary"> Professionals</span> Grow
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-5 leading-relaxed">
              Whether you&apos;re hosting live events, offering self-paced online courses, or advancing your career —
              Nuruvent brings together training providers and learners from
              universities, professional bodies, corporate teams, and independent coaches.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2.5 md:gap-3 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-muted border border-border px-3.5 py-1.5 rounded-full shadow-sm cursor-default">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  M-Pesa + Cards
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted border border-border px-3.5 py-1.5 rounded-full shadow-sm cursor-default">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  QR Certificates
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted border border-border px-3.5 py-1.5 rounded-full shadow-sm cursor-default">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  Events & Courses
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted border border-border px-3.5 py-1.5 rounded-full shadow-sm cursor-default">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  Global Reach
                </span>
              </div>
            </div>

            {/* Audience segments */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <School className="h-3.5 w-3.5" />
                <span>Universities</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>Institutes</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Corporate HR</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <UserCircle className="h-3.5 w-3.5" />
                <span>Coaches</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>Learners</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 justify-center lg:justify-start">
              <Link href="/signup" className="cursor-pointer">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 text-sm md:text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="/events" className="cursor-pointer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border bg-card hover:bg-accent px-6 py-5 text-sm md:text-base rounded-xl font-medium shadow-sm transition-all text-foreground cursor-pointer"
                >
                  Find Training & Courses
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full ring-2 ring-background overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  <Image
                    src="/avatars/avatar1.jpeg"
                    alt="ICPAK"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full ring-2 ring-background overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  <Image
                    src="/avatars/avatar2.jpeg"
                    alt="attendee"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full ring-2 ring-background overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  <Image
                    src="/avatars/avatar3.jpeg"
                    alt="Trainer"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full ring-2 ring-background overflow-hidden bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  <Image
                    src="/avatars/avatar4.jpeg"
                    alt="Strathmore"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                <span className="font-semibold text-foreground">2,000+</span>{' '}
                training providers and{' '}
                <span className="font-semibold text-foreground">10,000+</span>{' '}
                annual events & courses
              </div>
            </div>
          </div>

          {/* Right column: floating glass badges */}
          <div className="lg:col-span-5 xl:col-span-6 hidden lg:block relative min-h-[320px]">
            <div className="absolute top-6 left-0 bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float z-20 cursor-default">
              <div className="bg-tertiary/15 p-2 rounded-xl">
                <Award className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">QR Verified</p>
                <p className="text-[11px] text-muted-foreground">
                  Digital Certificates
                </p>
              </div>
            </div>

            <div
              className="absolute top-1/2 -translate-y-1/2 -left-6 bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float z-20 cursor-default"
              style={{ animationDelay: '1s' }}
            >
              <div className="bg-primary/15 p-2 rounded-xl">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  M-Pesa + Cards
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Instant Payments
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 left-2 bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-float-delayed z-20 cursor-default">
              <div className="bg-secondary/15 p-2 rounded-xl">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">10,000+</p>
                <p className="text-[11px] text-muted-foreground">
                  Annual Events & Courses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
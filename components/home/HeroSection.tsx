'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Users,
  Award,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative flex items-center overflow-hidden bg-background">
      {/* Background image — desktop & tablet */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          src="/hero-image-desktop.png"
          alt="Training events and online courses"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />

        {/* Desktop overlay — lighter, so the right side stays crisp */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/25 to-transparent" />
        </div>

        {/* Tablet overlay */}
        <div className="hidden md:block lg:hidden absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/50" />
        </div>
      </div>

      {/* Mobile background image */}
      <div className="absolute inset-0 z-0 md:hidden">
        <Image
          src="/hero-image-desktop.png"
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
        <div className="absolute top-1/3 left-12 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-12 left-1/4 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Left column — narrower so the image gets more space */}
          <div className="mx-auto max-w-xl text-center lg:col-span-5 lg:mx-0 lg:max-w-none lg:text-left">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm sm:text-sm">
              <Sparkles className="h-3 w-3" />
              <span>Host & Attend Events, Courses & Workshops</span>
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl">
              <span className="text-primary">Nuruvent</span>
              <span className="text-foreground"> — Where </span>
              <span className="text-secondary">Professionals</span>
              <span className="text-foreground"> Grow</span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mb-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              Live events, self-paced courses, and certified training — for
              universities, institutes, corporate teams, and coaches.
            </p>

            {/* Feature chips */}
            <div className="mb-8 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 shadow-sm">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  M-Pesa + Cards
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 shadow-sm">
                <CheckCircle className="h-4 w-4 text-tertiary" />
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  QR-Verified Certificates
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/signup" className="cursor-pointer">
                <Button
                  size="lg"
                  className="cursor-pointer rounded-xl bg-primary px-6 py-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/40 sm:text-base"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/events" className="cursor-pointer">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer rounded-xl border-border bg-card px-6 py-5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent sm:text-base"
                >
                  Browse Events
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <div className="flex -space-x-2">
                {['avatar1', 'avatar2', 'avatar3', 'avatar4'].map((name, i) => (
                  <div
                    key={name}
                    className="h-8 w-8 overflow-hidden rounded-full bg-muted ring-2 ring-background"
                  >
                    <Image
                      src={`/avatars/${name}.jpeg`}
                      alt={`Avatar ${i + 1}`}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-muted-foreground sm:text-left">
                <span className="font-semibold text-foreground">2,000+</span>{' '}
                training providers ·{' '}
                <span className="font-semibold text-foreground">10,000+</span>{' '}
                annual events
              </div>
            </div>
          </div>

          {/* Right column — wider, image-first */}
          <div className="relative hidden min-h-[420px] lg:col-span-7 lg:block">
            {/* Floating badges sit on the LEFT edge of this column,
                over the bokeh area, not over the image subject. */}
            <div className="animate-float absolute left-4 top-8 z-20 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/85 p-3 shadow-xl backdrop-blur-md">
              <div className="rounded-xl bg-tertiary/15 p-2">
                <Award className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  QR-Verified
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Digital Certificates
                </p>
              </div>
            </div>

            <div
              className="animate-float absolute left-0 top-1/2 z-20 -translate-y-1/2 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/85 p-3 shadow-xl backdrop-blur-md"
              style={{ animationDelay: '1s' }}
            >
              <div className="rounded-xl bg-primary/15 p-2">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Instant Payments
                </p>
                <p className="text-[11px] text-muted-foreground">
                  M-Pesa + Cards
                </p>
              </div>
            </div>

            <div className="animate-float-delayed absolute bottom-10 left-6 z-20 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/85 p-3 shadow-xl backdrop-blur-md">
              <div className="rounded-xl bg-secondary/15 p-2">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  For Every Role
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Hosts · Teams · Learners
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
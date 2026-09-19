/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS, SOCIAL_LINKS } from '@/lib/constants';
import {
  MdEmail,
  MdPhone,
  MdArrowForward,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md';
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaWhatsapp,
} from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const socialIcons: Record<string, any> = {
  LinkedIn: FaLinkedin,
  Twitter: FaTwitter,
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  Youtube: FaYoutube,
  WhatsApp: FaWhatsapp,
};

/**
 * Ad data.
 *
 * `bgGradient`, `textColor`, `textSecondary`, `accentColor`, `borderColor`
 * only apply in light mode. In dark mode the bar collapses to a single
 * dark surface (see the wrapper) and the ad image + text carry the
 * color, so these values are intentionally light-only.
 */
const advertisements = [
  {
    id: 1,
    type: 'image' as const,
    imageUrl: '/ad-banner-1.jpeg',
    imageAlt: 'Summer Webinar Series - Register Now',
    link: '/events/webinars',
    bgGradient: 'from-purple-50 via-pink-50 to-purple-50',
    textColor: 'text-purple-900',
    textSecondary: 'text-purple-700',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-200/50',
    overlayMessage: 'Summer Webinar Series',
    overlayHighlight: 'Register for Free',
    overlayLinkText: 'Secure Your Spot',
  },
  {
    id: 2,
    type: 'image' as const,
    imageUrl: '/ad-banner-2.jpeg',
    imageAlt: 'Leadership Masterclass - Limited Seats',
    link: '/events/masterclass',
    bgGradient: 'from-amber-50 via-orange-50 to-amber-50',
    textColor: 'text-amber-900',
    textSecondary: 'text-amber-700',
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-200/50',
    overlayMessage: 'Leadership Masterclass',
    overlayHighlight: 'Limited Seats Available',
    overlayLinkText: 'Reserve Now',
  },
  {
    id: 3,
    type: 'image' as const,
    imageUrl: '/ad-banner-3.jpeg',
    imageAlt: 'AI Workshop for Business Leaders',
    link: '/events/ai-workshop',
    bgGradient: 'from-indigo-50 via-blue-50 to-indigo-50',
    textColor: 'text-indigo-900',
    textSecondary: 'text-indigo-700',
    accentColor: 'text-indigo-600',
    borderColor: 'border-indigo-200/50',
    overlayMessage: 'AI Workshop',
    overlayHighlight: 'For Business Leaders',
    overlayLinkText: 'Learn More',
  },
  {
    id: 4,
    type: 'image' as const,
    imageUrl: '/ad-banner-4.jpeg',
    imageAlt: 'Early Bird Registration - Save 30%',
    link: '/events',
    bgGradient: 'from-rose-50 via-red-50 to-rose-50',
    textColor: 'text-rose-900',
    textSecondary: 'text-rose-700',
    accentColor: 'text-rose-600',
    borderColor: 'border-rose-200/50',
    overlayMessage: 'Early Bird Special',
    overlayHighlight: 'Save 30% Today',
    overlayLinkText: 'Register Now',
  },
  {
    id: 5,
    type: 'image' as const,
    imageUrl: '/ad-banner-5.jpeg',
    imageAlt: 'Community Membership - Join Free',
    link: '/signup',
    bgGradient: 'from-emerald-50 via-teal-50 to-emerald-50',
    textColor: 'text-emerald-900',
    textSecondary: 'text-emerald-700',
    accentColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/50',
    overlayMessage: 'Join 10,000+',
    overlayHighlight: 'Free Membership',
    overlayLinkText: 'Get Started',
  },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
        setIsTransitioning(false);
      }, 400);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const currentAd = advertisements[currentAdIndex];

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    router.push(href);
  };

  const renderAdContent = (isMobile: boolean = false) => {
    return (
      <Link
        href={currentAd.link}
        onClick={(e) => handleNavigation(e, currentAd.link)}
        className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity group"
        prefetch={true}
      >
        <div className="relative h-7 sm:h-8 w-auto flex-shrink-0">
          <Image
            src={currentAd.imageUrl!}
            alt={currentAd.imageAlt || 'Advertisement'}
            width={isMobile ? 100 : 200}
            height={28}
            className="h-full w-auto object-contain rounded-md"
            priority={currentAdIndex === 0}
          />
        </div>

        {!isMobile && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-current/80">
              {currentAd.overlayMessage}
              <span
                className={cn('font-semibold ml-1.5', currentAd.accentColor)}
              >
                {currentAd.overlayHighlight}
              </span>
            </span>
            <span
              className={cn(
                'group flex items-center gap-0.5 font-medium transition-all duration-300 whitespace-nowrap',
                currentAd.accentColor,
                'hover:brightness-110',
              )}
            >
              {currentAd.overlayLinkText}
              <MdOutlineKeyboardArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}

        {isMobile && (
          <div className="flex flex-col items-start gap-0 text-xs flex-1 min-w-0">
            <span className="font-medium text-current/80 truncate w-full text-[11px]">
              {currentAd.overlayMessage}
              <span className={cn('font-semibold ml-1', currentAd.accentColor)}>
                {currentAd.overlayHighlight}
              </span>
            </span>
            <span
              className={cn(
                'flex items-center gap-0.5 font-medium transition-all duration-300 whitespace-nowrap',
                currentAd.accentColor,
                'hover:brightness-110 text-[10px]',
              )}
            >
              {currentAd.overlayLinkText}
              <MdArrowForward className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        'border-b transition-all duration-700 ease-in-out',
        // Light mode: the ad palette drives everything.
        currentAd.borderColor,
        'bg-gradient-to-r',
        currentAd.bgGradient,
        // Dark mode: override with a single neutral surface. Higher
        // specificity via later classes wins in Tailwind's cascade.
        'dark:bg-none dark:bg-card dark:border-border',
      )}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div
          className={cn(
            'flex items-center justify-between min-h-11 sm:min-h-12 py-1 transition-colors duration-700',
            // Light mode: ad text color. Dark mode: neutral foreground.
            currentAd.textColor,
            'dark:text-foreground',
          )}
        >
          {/* Left cluster */}
          <div className="hidden md:flex items-center gap-4 text-xs flex-1 min-w-0">
            {/* Nav */}
            <nav className="hidden xl:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                const isExternal =
                  item.href.startsWith('http') || item.href.startsWith('//');

                if (isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer bg-background/60 backdrop-blur-sm border border-border hover:border-primary/40 hover:bg-background/80 hover:shadow-md hover:scale-[1.02] text-foreground/80"
                    >
                      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative">{item.label}</span>
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full bg-primary transition-all duration-300 group-hover:w-6" />
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      'group relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer',
                      !isActive &&
                        'bg-background/60 backdrop-blur-sm border border-border hover:border-primary/40 hover:bg-background/80 hover:shadow-md hover:scale-[1.02] text-foreground/80',
                      isActive && 'text-primary',
                    )}
                  >
                    {isActive && (
                      <span className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary opacity-80" />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
                        isActive && 'scale-110',
                      )}
                    />
                    <span className={cn('relative', isActive && 'font-semibold')}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary opacity-80" />
                    )}
                    {!isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full bg-primary transition-all duration-300 group-hover:w-6" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Contact info */}
            <div className="flex items-center gap-3">
              <a
                href="mailto:info@nuruvent.com"
                className={cn(
                  'flex items-center gap-1.5 transition-all duration-300 group',
                  currentAd.textSecondary,
                  'hover:text-current dark:text-muted-foreground dark:hover:text-foreground',
                )}
              >
                <MdEmail className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">info@nuruvent.com</span>
              </a>
              <span className="text-current/30 dark:text-border">|</span>
              <a
                href="tel:+254740955111"
                className={cn(
                  'flex items-center gap-1.5 transition-all duration-300 group',
                  currentAd.textSecondary,
                  'hover:text-current dark:text-muted-foreground dark:hover:text-foreground',
                )}
              >
                <MdPhone className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">+254 740 955 111</span>
              </a>
            </div>

            {/* Divider */}
            <div className="hidden xl:flex items-center gap-3">
              <span className="w-px h-5 bg-gradient-to-b from-transparent via-current/20 to-transparent dark:via-border" />
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span className="w-px h-5 bg-gradient-to-b from-transparent via-current/20 to-transparent dark:via-border" />
            </div>

            {/* Ad banner */}
            <div className="hidden xl:flex items-center gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  'flex items-center gap-2 transition-all duration-400 overflow-hidden',
                  isTransitioning
                    ? 'opacity-0 translate-y-1'
                    : 'opacity-100 translate-y-0',
                )}
              >
                {renderAdContent(false)}
              </div>
            </div>
          </div>

          {/* Mobile ad */}
          <div className="flex md:hidden items-center justify-center flex-1 min-w-0 px-0">
            <div
              className={cn(
                'flex items-center gap-1.5 transition-all duration-400 overflow-hidden text-xs w-full max-w-[280px]',
                isTransitioning
                  ? 'opacity-0 translate-y-1'
                  : 'opacity-100 translate-y-0',
              )}
            >
              {renderAdContent(true)}
            </div>
          </div>

          {/* Tablet ad */}
          <div className="hidden md:flex xl:hidden items-center gap-2 flex-1 min-w-0 px-1">
            <div
              className={cn(
                'flex items-center gap-1.5 transition-all duration-400 overflow-hidden text-xs',
                isTransitioning
                  ? 'opacity-0 translate-y-1'
                  : 'opacity-100 translate-y-0',
              )}
            >
              {renderAdContent(true)}
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-0.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = socialIcons[social.label] || FiGlobe;
                const href =
                  social.href === '#'
                    ? `https://${social.label.toLowerCase()}.com/nuruvent`
                    : social.href;

                return (
                  <a
                    key={social.label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'group p-1.5 rounded-md transition-all duration-300 cursor-pointer',
                      currentAd.textSecondary,
                      'hover:text-current hover:bg-current/10',
                      'dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent',
                    )}
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <Icon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>

            <div className="flex md:hidden items-center gap-0.5">
              <a
                href="mailto:info@nuruvent.com"
                className="p-1.5 rounded-md transition-all duration-300 text-current/60 hover:text-current hover:bg-current/10 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
                aria-label="Email us"
              >
                <MdEmail className="h-3.5 w-3.5" />
              </a>
              <a
                href="tel:+254740955111"
                className="p-1.5 rounded-md transition-all duration-300 text-current/60 hover:text-current hover:bg-current/10 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
                aria-label="Call us"
              >
                <MdPhone className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
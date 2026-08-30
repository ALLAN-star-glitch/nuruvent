/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SOCIAL_LINKS } from '@/lib/constants';
import { 
  MdEmail, 
  MdPhone,
  MdArrowForward,
  MdOutlineKeyboardArrowRight
} from 'react-icons/md';
import { 
  FaLinkedin, 
  FaTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaYoutube, 
  FaWhatsapp 
} from 'react-icons/fa';
import { 
  FiGlobe 
} from 'react-icons/fi';
import { cn } from '@/lib/utils';

// Map social platform names to their icons
const socialIcons: Record<string, any> = {
  LinkedIn: FaLinkedin,
  Twitter: FaTwitter,
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  Youtube: FaYoutube,
  WhatsApp: FaWhatsapp,
};

// Advertisement data with dynamic background colors and image support
const advertisements = [
  {
    id: 1,
    type: 'image' as const,
    imageUrl: "/ad-banner-1.jpeg",
    imageAlt: "Summer Webinar Series - Register Now",
    link: "/events/webinars",
    bgGradient: "from-purple-50 via-pink-50 to-purple-50",
    textColor: "text-purple-900",
    textSecondary: "text-purple-700",
    accentColor: "text-purple-600",
    borderColor: "border-purple-200/50",
    hoverBg: "hover:bg-purple-100/50",
    overlayMessage: "Summer Webinar Series",
    overlayHighlight: "Register for Free",
    overlayLinkText: "Secure Your Spot"
  },
  {
    id: 2,
    type: 'image' as const,
    imageUrl: "/ad-banner-2.jpeg",
    imageAlt: "Leadership Masterclass - Limited Seats",
    link: "/events/masterclass",
    bgGradient: "from-amber-50 via-orange-50 to-amber-50",
    textColor: "text-amber-900",
    textSecondary: "text-amber-700",
    accentColor: "text-amber-600",
    borderColor: "border-amber-200/50",
    hoverBg: "hover:bg-amber-100/50",
    overlayMessage: "Leadership Masterclass",
    overlayHighlight: "Limited Seats Available",
    overlayLinkText: "Reserve Now"
  },
  {
    id: 3,
    type: 'image' as const,
    imageUrl: "/ad-banner-3.jpeg",
    imageAlt: "AI Workshop for Business Leaders",
    link: "/events/ai-workshop",
    bgGradient: "from-indigo-50 via-blue-50 to-indigo-50",
    textColor: "text-indigo-900",
    textSecondary: "text-indigo-700",
    accentColor: "text-indigo-600",
    borderColor: "border-indigo-200/50",
    hoverBg: "hover:bg-indigo-100/50",
    overlayMessage: "AI Workshop",
    overlayHighlight: "For Business Leaders",
    overlayLinkText: "Learn More"
  },
  {
    id: 4,
    type: 'image' as const,
    imageUrl: "/ad-banner-4.jpeg",
    imageAlt: "Early Bird Registration - Save 30%",
    link: "/events",
    bgGradient: "from-rose-50 via-red-50 to-rose-50",
    textColor: "text-rose-900",
    textSecondary: "text-rose-700",
    accentColor: "text-rose-600",
    borderColor: "border-rose-200/50",
    hoverBg: "hover:bg-rose-100/50",
    overlayMessage: "Early Bird Special",
    overlayHighlight: "Save 30% Today",
    overlayLinkText: "Register Now"
  },
  {
    id: 5,
    type: 'image' as const,
    imageUrl: "/ad-banner-5.jpeg",
    imageAlt: "Community Membership - Join Free",
    link: "/signup",
    bgGradient: "from-emerald-50 via-teal-50 to-emerald-50",
    textColor: "text-emerald-900",
    textSecondary: "text-emerald-700",
    accentColor: "text-emerald-600",
    borderColor: "border-emerald-200/50",
    hoverBg: "hover:bg-emerald-100/50",
    overlayMessage: "Join 10,000+",
    overlayHighlight: "Free Membership",
    overlayLinkText: "Get Started"
  }
];

export function TopBar() {
  const pathname = usePathname();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Rotate ads every 6 seconds
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

  // Render ad content (only image type now)
  const renderAdContent = (isMobile: boolean = false) => {
    return (
      <Link
        href={currentAd.link}
        className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity group"
      >
        <div className="relative h-7 sm:h-8 w-auto flex-shrink-0">
          <Image
            src={currentAd.imageUrl!}
            alt={currentAd.imageAlt || "Advertisement"}
            width={isMobile ? 100 : 200}
            height={28}
            className="h-full w-auto object-contain rounded-md"
            priority={currentAdIndex === 0}
          />
        </div>
        {/* Text overlay for image ads - visible on desktop */}
        {!isMobile && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-current/80">
              {currentAd.overlayMessage}
              <span className={cn("font-semibold ml-1.5", currentAd.accentColor)}>
                {currentAd.overlayHighlight}
              </span>
            </span>
            <span className={cn(
              "group flex items-center gap-0.5 font-medium transition-all duration-300 whitespace-nowrap",
              currentAd.accentColor,
              "hover:brightness-110"
            )}>
              {currentAd.overlayLinkText}
              <MdOutlineKeyboardArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}
        {/* Text overlay for image ads - visible on mobile */}
        {isMobile && (
          <div className="flex flex-col items-start gap-0 text-xs flex-1 min-w-0">
            <span className="font-medium text-current/80 truncate w-full text-[11px]">
              {currentAd.overlayMessage}
              <span className={cn("font-semibold ml-1", currentAd.accentColor)}>
                {currentAd.overlayHighlight}
              </span>
            </span>
            <span className={cn(
              "flex items-center gap-0.5 font-medium transition-all duration-300 whitespace-nowrap",
              currentAd.accentColor,
              "hover:brightness-110 text-[10px]"
            )}>
              {currentAd.overlayLinkText}
              <MdArrowForward className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className={cn(
      "border-b transition-all duration-700 ease-in-out",
      currentAd.borderColor,
      "bg-gradient-to-r",
      currentAd.bgGradient
    )}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className={cn(
          "flex items-center justify-between min-h-11 sm:min-h-12 py-1 transition-colors duration-700",
          currentAd.textColor
        )}>
          {/* Left: Contact Info - visible on md+ */}
          <div className="hidden md:flex items-center gap-4 text-xs flex-1 min-w-0">
            {/* Contact Info with subtle hover */}
            <div className="flex items-center gap-3">
              <a 
                href="mailto:info@nuruvent.com" 
                className={cn(
                  "flex items-center gap-1.5 transition-all duration-300 group",
                  currentAd.textSecondary,
                  "hover:text-current"
                )}
              >
                <MdEmail className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-current transition-colors whitespace-nowrap">info@nuruvent.com</span>
              </a>
              <span className="text-current/30">|</span>
              <a 
                href="tel:+254740955111" 
                className={cn(
                  "flex items-center gap-1.5 transition-all duration-300 group",
                  currentAd.textSecondary,
                  "hover:text-current"
                )}
              >
                <MdPhone className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-current transition-colors whitespace-nowrap">+254 740 955 111</span>
              </a>
            </div>

            {/* Elegant Divider with dot - visible on xl+ */}
            <div className="hidden xl:flex items-center gap-3">
              <span className="w-px h-5 bg-gradient-to-b from-transparent via-current/20 to-transparent"></span>
              <span className={cn("w-1 h-1 rounded-full", currentAd.accentColor.replace('text-', 'bg-'))}></span>
              <span className="w-px h-5 bg-gradient-to-b from-transparent via-current/20 to-transparent"></span>
            </div>

            {/* Desktop Ad Banner - visible on xl+ */}
            <div className="hidden xl:flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "flex items-center gap-2 transition-all duration-400 overflow-hidden",
                isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
              )}>
                {renderAdContent(false)}
              </div>
            </div>
          </div>

          {/* Center: Mobile Ad - visible on all screens (centered on mobile) */}
          <div className="flex md:hidden items-center justify-center flex-1 min-w-0 px-0">
            <div className={cn(
              "flex items-center gap-1.5 transition-all duration-400 overflow-hidden text-xs w-full max-w-[280px]",
              isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            )}>
              {renderAdContent(true)}
            </div>
          </div>

          {/* Tablet Ad - visible on md to xl */}
          <div className="hidden md:flex xl:hidden items-center gap-2 flex-1 min-w-0 px-1">
            <div className={cn(
              "flex items-center gap-1.5 transition-all duration-400 overflow-hidden text-xs",
              isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            )}>
              {renderAdContent(true)}
            </div>
          </div>

          {/* Right: Desktop Navigation + Social Links */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Navigation - visible on xl+ only */}
            <nav className="hidden xl:flex items-center gap-1 mr-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
                      isActive
                        ? "bg-current/10 text-current"
                        : "text-current/70 hover:text-current hover:bg-current/5"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Social Links - visible on lg+ */}
            <div className="hidden lg:flex items-center gap-0.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = socialIcons[social.label] || FiGlobe;
                const href = social.href === '#' 
                  ? `https://${social.label.toLowerCase()}.com/nuruvent` 
                  : social.href;
                
                return (
                  <a
                    key={social.label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group p-1.5 rounded-md transition-all duration-300 cursor-pointer",
                      currentAd.textSecondary,
                      "hover:text-current",
                      "hover:bg-current/10"
                    )}
                    aria-label={`Follow us on ${social.label}`}
                  >
                    <Icon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>

            {/* Mobile Contact Icons - visible on md and below */}
            <div className="flex md:hidden items-center gap-0.5">
              <a
                href="mailto:info@nuruvent.com"
                className={cn(
                  "p-1.5 rounded-md transition-all duration-300",
                  "text-current/60 hover:text-current",
                  "hover:bg-current/10"
                )}
                aria-label="Email us"
              >
                <MdEmail className="h-3.5 w-3.5" />
              </a>
              <a
                href="tel:+254740955111"
                className={cn(
                  "p-1.5 rounded-md transition-all duration-300",
                  "text-current/60 hover:text-current",
                  "hover:bg-current/10"
                )}
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
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/constants';
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

// Advertisement data with dynamic background colors
const advertisements = [
  {
    id: 1,
    message: "✨ Early bird registration ends soon",
    highlight: "Save 30% on all events",
    link: "/events",
    linkText: "Secure Your Spot",
    bgGradient: "from-blue-50 via-indigo-50 to-blue-50",
    textColor: "text-blue-900",
    textSecondary: "text-blue-700",
    accentColor: "text-blue-600",
    borderColor: "border-blue-200/50",
    hoverBg: "hover:bg-blue-100/50"
  },
  {
    id: 2,
    message: "🚀 New workshop: AI for Business Leaders",
    highlight: "Limited spots available",
    link: "/events/ai-workshop",
    linkText: "Reserve Now",
    bgGradient: "from-purple-50 via-pink-50 to-purple-50",
    textColor: "text-purple-900",
    textSecondary: "text-purple-700",
    accentColor: "text-purple-600",
    borderColor: "border-purple-200/50",
    hoverBg: "hover:bg-purple-100/50"
  },
  {
    id: 3,
    message: "🌟 Join 10,000+ professionals",
    highlight: "Membership is free",
    link: "/signup",
    linkText: "Get Started",
    bgGradient: "from-emerald-50 via-teal-50 to-emerald-50",
    textColor: "text-emerald-900",
    textSecondary: "text-emerald-700",
    accentColor: "text-emerald-600",
    borderColor: "border-emerald-200/50",
    hoverBg: "hover:bg-emerald-100/50"
  },
  {
    id: 4,
    message: "🔥 Summer special: Webinar series",
    highlight: "Register for free",
    link: "/events/webinars",
    linkText: "Explore Now",
    bgGradient: "from-amber-50 via-orange-50 to-amber-50",
    textColor: "text-amber-900",
    textSecondary: "text-amber-700",
    accentColor: "text-amber-600",
    borderColor: "border-amber-200/50",
    hoverBg: "hover:bg-amber-100/50"
  },
  {
    id: 5,
    message: "🎯 Masterclass: Leadership Skills",
    highlight: "Limited seats remaining",
    link: "/events/masterclass",
    linkText: "Join Now",
    bgGradient: "from-rose-50 via-red-50 to-rose-50",
    textColor: "text-rose-900",
    textSecondary: "text-rose-700",
    accentColor: "text-rose-600",
    borderColor: "border-rose-200/50",
    hoverBg: "hover:bg-rose-100/50"
  }
];

export function TopBar() {
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

  return (
    <div className={cn(
      "border-b transition-all duration-700 ease-in-out",
      currentAd.borderColor,
      "bg-gradient-to-r",
      currentAd.bgGradient
    )}>
      <div className="container mx-auto px-4">
        <div className={cn(
          "flex items-center justify-between h-11 transition-colors duration-700",
          currentAd.textColor
        )}>
          {/* Left: Contact Info + Elegant Divider + Ad */}
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
                <span className="group-hover:text-current transition-colors">info@nuruvent.com</span>
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
                <span className="group-hover:text-current transition-colors">+254 740 955 111</span>
              </a>
            </div>

            {/* Elegant Divider with dot */}
            <div className="hidden xl:flex items-center gap-3">
              <span className="w-px h-5 bg-gradient-to-b from-transparent via-current/20 to-transparent"></span>
              <span className={cn("w-1 h-1 rounded-full", currentAd.accentColor.replace('text-', 'bg-'))}></span>
              <span className="w-px h-5 bg-gradient-to-b from-transparent via-current/20 to-transparent"></span>
            </div>

            {/* Ad Banner - integrated elegantly (non-dismissible) */}
            <div className="hidden xl:flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "flex items-center gap-2 transition-all duration-400 overflow-hidden",
                isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
              )}>
                <span className="truncate text-current/80">
                  {currentAd.message}
                  <span className={cn("font-medium ml-1.5", currentAd.accentColor)}>
                    {currentAd.highlight}
                  </span>
                </span>
                
                <Link
                  href={currentAd.link}
                  className={cn(
                    "group flex items-center gap-0.5 font-medium transition-all duration-300 whitespace-nowrap",
                    currentAd.accentColor,
                    "hover:brightness-110"
                  )}
                >
                  <span>{currentAd.linkText}</span>
                  <MdOutlineKeyboardArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Center: Mobile Ad (visible on small screens) - non-dismissible */}
          <div className="flex md:hidden items-center gap-2 flex-1 min-w-0 px-1">
            <div className={cn(
              "flex items-center gap-1.5 transition-all duration-400 overflow-hidden text-xs",
              isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            )}>
              <span className="truncate text-current/80">
                {currentAd.message}
                <span className={cn("font-medium ml-1", currentAd.accentColor)}>
                  {currentAd.highlight}
                </span>
              </span>
              <Link
                href={currentAd.link}
                className={cn(
                  "font-medium transition-colors whitespace-nowrap flex items-center gap-0.5 text-xs",
                  currentAd.accentColor,
                  "hover:brightness-110"
                )}
              >
                {currentAd.linkText}
                <MdArrowForward className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right: Social Links + Mobile Contact */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Social Links with elegant hover */}
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

            {/* Mobile Contact Icons with elegant styling */}
            <div className="flex md:hidden items-center gap-0.5">
              <a
                href="mailto:info@nuruvent.com"
                className={cn(
                  "p-1.5 rounded-md transition-all duration-300",
                  currentAd.textSecondary,
                  "hover:text-current",
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
                  currentAd.textSecondary,
                  "hover:text-current",
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
// lib/constants.ts

import {
  Calendar,
  BookOpen,
  Zap,
  CreditCard,
} from "lucide-react";

export const SITE_NAME = "Nuruvent";
export const SITE_DESCRIPTION = "Light Your Training Events. Illuminate Your Growth.";
export const SITE_URL = "https://nuruvent.com";

export const NAV_ITEMS = [
  { label: "Events", href: "/events", icon: Calendar },
  { label: "How It Works", href: "/how-it-works", icon: BookOpen },
  { label: "Features", href: "/features", icon: Zap },
  { label: "Pricing", href: "/pricing", icon: CreditCard },
];

export const FOOTER_LINKS = {
  platform: [
    { label: "Events", href: "/events" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Hosts", href: "/for-hosts" },
  ],
  resources: [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
};

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "WhatsApp", href: "#" },
];

export const EVENT_TYPES = [
  { label: "All Events", value: "all" },
  { label: "Workshops", value: "workshop" },
  { label: "Webinars", value: "webinar" },
  { label: "Bootcamps", value: "bootcamp" },
  { label: "Meetups", value: "meetup" },
];
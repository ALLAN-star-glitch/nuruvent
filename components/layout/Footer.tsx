// components/layout/Footer.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, HelpCircle, BookOpen } from 'lucide-react';
import {
  FaLinkedinIn,
  FaXTwitter,
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa6';

const platformLinks = [
  { label: 'Events', href: '/events' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'For Hosts', href: '/for-hosts' },
];

const resourceLinks = [
  { label: 'Help Center', href: '/support' },
  { label: 'Support', href: '/support' },
  { label: 'Zoom Integration Guide', href: '/docs/zoom' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
];

const socialLinks = [
  { label: 'LinkedIn', href: '#', icon: FaLinkedinIn },
  { label: 'Twitter', href: '#', icon: FaXTwitter },
  { label: 'Instagram', href: '#', icon: FaInstagram },
  { label: 'WhatsApp', href: '#', icon: FaWhatsapp },
];

export function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Nuruvent"
                width={120}
                height={40}
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Light Your Training Events. Illuminate Your Growth.
            </p>
            <p className="text-sm text-muted-foreground">
              The all-in-one platform for training events — built in Kenya,
              for the world.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    {link.href === '/support' &&
                      link.label === 'Support' && (
                        <HelpCircle className="h-3.5 w-3.5" />
                      )}
                    {link.href === '/docs/zoom' && (
                      <BookOpen className="h-3.5 w-3.5" />
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Connect
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:hello@nuruvent.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                hello@nuruvent.com
              </a>
              <a
                href="tel:+254700000000"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +254 700 000 000
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                Nairobi, Kenya
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nuruvent. All rights reserved.
            </p>
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                href="/support"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
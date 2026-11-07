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

// Facebook post permalink — embedded as an iframe.
const FACEBOOK_POST_URL =
  'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0LsvYbZbuGese73GW35q1BjgVP6TBp8ehDNST6XubGpzzyzemxYgG6zdn2yJfiBmql%26id%3D61596450773652&show_text=true&width=500';

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
        <div className="py-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Nuruvent Solutions"
                width={140}
                height={48}
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The all-in-one platform for educational, academic, and training
              events. AI event generation, automated attendance, and secure
              M-Pesa payments.
            </p>
            <p className="text-sm text-muted-foreground">
              Built in Kenya, for the world.
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
                href="mailto:info@nuruvent.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                info@nuruvent.com
              </a>
              <a
                href="tel:+254740955111"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                0740 955 111
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

          {/* Facebook Post Column */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Latest on Facebook
            </h3>
            <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
              <iframe
                src={FACEBOOK_POST_URL}
                width="100%"
                height="392"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Nuruvent Solutions Facebook post"
                className="w-full h-[392px]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Nuruvent Solutions. All rights
              reserved.
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
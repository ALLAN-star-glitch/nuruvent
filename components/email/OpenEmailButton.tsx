// components/email/OpenEmailButton.tsx

'use client';

import { Mail, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpenEmailButtonProps {
  email: string;
  /** Rendered as the button's label. Defaults to "Open email". */
  label?: string;
  className?: string;
}

/**
 * Returns a URL to the webmail inbox for a given email address.
 * Falls back to a `mailto:` link if the provider is unknown.
 */
function resolveInboxUrl(email: string): {
  url: string;
  label: string;
  external: boolean;
} {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';

  switch (domain) {
    case 'gmail.com':
    case 'googlemail.com':
      return {
        url: 'https://mail.google.com/mail/u/0/#inbox',
        label: 'Open Gmail',
        external: true,
      };

    case 'outlook.com':
    case 'hotmail.com':
    case 'live.com':
    case 'msn.com':
      return {
        url: 'https://outlook.live.com/mail/0/inbox',
        label: 'Open Outlook',
        external: true,
      };

    case 'yahoo.com':
    case 'yahoo.co.uk':
    case 'ymail.com':
      return {
        url: 'https://mail.yahoo.com/',
        label: 'Open Yahoo Mail',
        external: true,
      };

    case 'icloud.com':
    case 'me.com':
    case 'mac.com':
      return {
        url: 'https://www.icloud.com/mail',
        label: 'Open iCloud Mail',
        external: true,
      };

    case 'protonmail.com':
    case 'proton.me':
      return {
        url: 'https://mail.proton.me/',
        label: 'Open Proton Mail',
        external: true,
      };

    case 'zoho.com':
      return {
        url: 'https://mail.zoho.com/',
        label: 'Open Zoho Mail',
        external: true,
      };

    default:
      // Fallback: mailto link opens the OS's default mail app on mobile.
      return {
        url: `mailto:${email}`,
        label: 'Open Email App',
        external: false,
      };
  }
}

export function OpenEmailButton({
  email,
  label,
  className,
}: OpenEmailButtonProps) {
  const { url, label: defaultLabel, external } = resolveInboxUrl(email);

  return (
    <Button asChild className={className}>
      <a
        href={url}
        {...(external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        <Mail className="mr-2 h-4 w-4" />
        {label ?? defaultLabel}
        {external ? (
          <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-80" />
        ) : (
          <ArrowRight className="ml-2 h-4 w-4" />
        )}
      </a>
    </Button>
  );
}
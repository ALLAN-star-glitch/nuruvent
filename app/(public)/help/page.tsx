// app/(public)/help/page.tsx

import type { Metadata } from 'next';
import { HelpContent } from './_components/HelpContent';


export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Guides, tutorials, and FAQs for hosting events, managing teams, payments, certificates, and more on Nuruvent.',
  alternates: { canonical: 'https://nuruvent.com/help' },
};

export default function HelpPage() {
  return <HelpContent />;
}
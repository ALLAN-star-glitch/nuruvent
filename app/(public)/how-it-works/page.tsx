// app/(public)/how-it-works/page.tsx

import { HowItWorksContent } from './HowItWorksContent';

export const metadata = {
  title: 'How It Works | Nuruvent',
  description: 'Learn how Nuruvent works for hosts and attendees. From event creation to certificates and payouts.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
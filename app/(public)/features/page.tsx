// app/(public)/features/page.tsx

import { FeaturesContent } from './FeaturesContent';

export const metadata = {
  title: 'Features | Nuruvent',
  description: 'Everything you need to manage professional training events. M-Pesa payments, QR certificates, automated reminders, and more.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function FeaturesPage() {
  return <FeaturesContent />;
}
// app/(public)/pricing/page.tsx

import { PricingContent } from './PricingContent';

export const metadata = {
  title: 'Pricing | Nuruvent',
  description: 'Simple, transparent pricing for training hosts. Pay only when you sell. No hidden fees.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function PricingPage() {
  return <PricingContent />;
}
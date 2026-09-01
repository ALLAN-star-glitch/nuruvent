// app/(public)/how-it-works/page.tsx

import { HowItWorksContent } from './HowItWorksContent';

export const metadata = {
  title: 'How It Works — Create & Discover Training Events & Courses | Nuruvent',
  description: 'Learn how Nuruvent works for training hosts and learners. Create events & courses, build your training team, accept M-Pesa or card payments, issue QR-verified CPD certificates, and get paid in 7 days.',
  openGraph: {
    title: 'How It Works — Create & Discover Training Events & Courses | Nuruvent',
    description: 'Learn how Nuruvent works for training hosts and learners. Create events & courses, build your training team, accept M-Pesa or card payments, issue QR-verified CPD certificates, and get paid in 7 days.',
    url: 'https://nuruvent.com/how-it-works',
    siteName: 'Nuruvent',
    type: 'website',
    images: [
      {
        url: '/how-it-works.png',
        width: 1200,
        height: 630,
        alt: 'How Nuruvent Works — Training Events & Courses Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works — Create & Discover Training Events & Courses | Nuruvent',
    description: 'Learn how Nuruvent works for training hosts and learners. Create events & courses, accept M-Pesa payments, issue QR-verified CPD certificates, and get paid in 7 days.',
    images: ['/how-it-works.png'],
  },
  keywords: [
    'how Nuruvent works',
    'training events platform',
    'online courses platform',
    'create training events',
    'create online courses',
    'M-Pesa training payments',
    'QR-verified certificates',
    'CPD certificates',
    'training team collaboration',
    'professional development platform',
    'Nuruvent',
  ],
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
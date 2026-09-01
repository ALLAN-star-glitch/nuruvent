// app/(public)/signup/page.tsx

import { Metadata } from 'next';
import SignUpForm from "@/components/registration/SignupForm";
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const PAGE_TITLE = `Sign Up — Create Account to Host or Join Events & Courses | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Create your free Nuruvent account. Register as a host to create events, sell online courses, and accept M-Pesa payments, or join as a learner to earn QR-verified CPD certificates.';
const PAGE_URL = `${SITE_URL}/signup`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: '/how-it-works.png',
        width: 1200,
        height: 630,
        alt: 'Sign Up for Nuruvent — Training Events & Online Courses Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ['/twitter-image.jpg'],
  },
  keywords: [
    'Nuruvent sign up',
    'Nuruvent registration',
    'create host account',
    'host training events Kenya',
    'sell online courses M-Pesa',
    'register for CPD courses',
    'Nuruvent account setup',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function SignUpPage() {
  return (
    <>
      {/* JSON-LD Structured Data for Sign Up Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            url: PAGE_URL,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: `${SITE_URL}/`,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Sign Up',
                  item: PAGE_URL,
                },
              ],
            },
          }),
        }}
      />
      <SignUpForm />
    </>
  );
}
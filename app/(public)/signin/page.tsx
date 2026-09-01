// app/(public)/signin/page.tsx

import { Metadata } from 'next';
import { SignInForm } from './SignInForm';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

const PAGE_TITLE = `Sign In — Access Your Dashboard, Events & Courses | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  'Sign in to your Nuruvent account to manage your training events, access enrolled online courses, view attendance history, and download QR-verified CPD certificates.';
const PAGE_URL = `${SITE_URL}/signin`;

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
        alt: 'Sign In to Nuruvent Training Events & Online Courses Platform',
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
    'Nuruvent sign in',
    'Nuruvent login',
    'access training dashboard',
    'download CPD certificates',
    'my courses login',
    'event host dashboard login',
    'Nuruvent portal',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function SignInPage() {
  return (
    <>
      {/* JSON-LD Structured Data for Sign In Page */}
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
                  name: 'Sign In',
                  item: PAGE_URL,
                },
              ],
            },
          }),
        }}
      />
      <SignInForm />
    </>
  );
}
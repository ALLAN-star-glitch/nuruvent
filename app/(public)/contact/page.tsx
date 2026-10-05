// app/(public)/contact/page.tsx

import type { Metadata } from 'next';
import { ContactContent } from './_components/ContactContent.tsx';


export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Nuruvent team — support, sales, partnerships, and general inquiries.',
  alternates: { canonical: 'https://nuruvent.com/contact' },
};

export default function ContactPage() {
  return <ContactContent />;
}
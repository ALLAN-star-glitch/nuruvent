// app/(public)/for-hosts/page.tsx

import { ForHostsContent } from './ForHostsContent';

export const metadata = {
  title: 'For Hosts | Nuruvent',
  description: 'Host professional training events in Kenya with Nuruvent. Automate payments, certificates, and attendance.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function ForHostsPage() {
  return <ForHostsContent />;
}
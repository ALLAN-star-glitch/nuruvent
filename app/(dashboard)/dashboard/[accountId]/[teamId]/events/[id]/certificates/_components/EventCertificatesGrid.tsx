// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/EventCertificatesGrid.tsx

'use client';


import { Certificate } from '@/lib/types/certificates';
import { EventCertificateCard } from './EventCertificateCard';

interface Props {
  certificates: Certificate[];
  onSend: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
  emptyState: React.ReactNode;
}

export function EventCertificatesGrid({
  certificates,
  onSend,
  onRevoke,
  onDownload,
  emptyState,
}: Props) {
  if (certificates.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <EventCertificateCard
          key={cert.id}
          cert={cert}
          onSend={onSend}
          onRevoke={onRevoke}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
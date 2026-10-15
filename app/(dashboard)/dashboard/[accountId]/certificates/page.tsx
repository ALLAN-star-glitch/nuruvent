// app/(dashboard)/dashboard/[accountId]/certificates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileBadge } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { useListAccountCertificatesQuery } from '@/lib/store/api/certificatesApi';


import { AccountCertificatesFilters } from './_components/AccountCertificatesFilters';
import { AccountCertificatesHeader } from './_components/AccountCertificatesHeader';
import { AccountCertificatesSkeleton } from './_components/AccountCertificatesSkeleton';
import { AccountCertificatesStats } from './_components/AccountCertificatesStats';
import { AccountCertificatesTable } from './_components/AccountCertificatesTable';
import { RevokeCertificateDialog } from '../[teamId]/events/[id]/certificates/_components/RevokeCertificateDialog';
import { SendCertificateDialog } from '../[teamId]/events/[id]/certificates/_components/SendCertificateDialog';
import { Certificate } from '@/lib/types/certificates';

export default function AccountCertificatesPage() {
  const params = useParams<{ accountId: string; teamId?: string }>();
  const accountId = params.accountId;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [sendTarget, setSendTarget] = useState<Certificate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useListAccountCertificatesQuery({
    accountId,
    params: { limit: 500 },
  });

  const certificates = data?.data?.certificates ?? [];

  // Unique events in the list, keyed by context_id
  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of certificates) {
      if (c.context_type !== 'event') continue;
      const title = c.metadata?.context_title ?? 'Untitled event';
      if (!map.has(c.context_id)) map.set(c.context_id, title);
    }
    return Array.from(map.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [certificates]);

  const filtered = useMemo(() => {
    let list = certificates;

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (eventFilter !== 'all') {
      list = list.filter((c) => c.context_id === eventFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.recipient_name.toLowerCase().includes(q) ||
          c.recipient_email.toLowerCase().includes(q) ||
          c.verification_code.toLowerCase().includes(q) ||
          (c.metadata?.context_title ?? '').toLowerCase().includes(q),
      );
    }

    // newest first
    return [...list].sort(
      (a, b) =>
        new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime(),
    );
  }, [certificates, statusFilter, eventFilter, search]);

  const stats = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter((c) => c.status === 'active').length;
    const revoked = total - active;
    return { total, active, revoked, events: eventOptions.length };
  }, [certificates, eventOptions]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setEventFilter('all');
  };

  const handleDownload = async (cert: Certificate) => {
    try {
      const token = localStorage.getItem('access_token');
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
      const res = await fetch(
        `${apiBase}/api/v1/certificates/${cert.id}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error(`Download failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.verification_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download certificate');
    }
  };

  const emptyNode = (
    <Card className="border-0 border-b border-border">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <FileBadge className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {certificates.length === 0
              ? 'No certificates yet'
              : 'No certificates match'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {certificates.length === 0
              ? 'Issue certificates from an event to see them here.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-20">
      <AccountCertificatesHeader
        accountId={accountId}
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

      {isLoading ? (
        <AccountCertificatesSkeleton rows={8} />
      ) : (
        <>
          <AccountCertificatesStats
            total={stats.total}
            active={stats.active}
            revoked={stats.revoked}
            events={stats.events}
          />

          {certificates.length > 0 && (
            <AccountCertificatesFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              eventFilter={eventFilter}
              onEventChange={setEventFilter}
              events={eventOptions}
              onReset={resetFilters}
              resultCount={filtered.length}
              totalCount={certificates.length}
            />
          )}

          <AccountCertificatesTable
            certificates={filtered}
            accountId={accountId}
            onSend={(c) => setSendTarget(c)}
            onRevoke={(c) => setRevokeTarget(c)}
            onDownload={handleDownload}
            emptyState={emptyNode}
          />
        </>
      )}

      <SendCertificateDialog
        cert={sendTarget}
        onOpenChange={(v) => !v && setSendTarget(null)}
        onSent={() => refetch()}
      />

      <RevokeCertificateDialog
        cert={revokeTarget}
        onOpenChange={(v) => !v && setRevokeTarget(null)}
        onRevoked={() => refetch()}
      />
    </div>
  );
}
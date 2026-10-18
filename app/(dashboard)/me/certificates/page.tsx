// app/(dashboard)/me/certificates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { FileBadge, Grid3X3, List } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import {
  useDownloadCertificateMutation,
  useGetMyCertificatesQuery,
  useListCertificateTemplatesQuery,
} from '@/lib/store/api/certificatesApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectActiveAccount } from '@/lib/store/slices/authSlice';

import { CertificateSkeleton } from './_components/CertificateSkeleton';

// Reuse organizer components for consistent design
import { AccountCertificatesStats } from '../../dashboard/[accountId]/certificates/_components/AccountCertificatesStats';
import { AccountCertificatesFilters } from '../../dashboard/[accountId]/certificates/_components/AccountCertificatesFilters';
import { AccountCertificatesGrid } from '../../dashboard/[accountId]/certificates/_components/AccountCertificatesGrid';
import { AccountCertificatesTable } from '../../dashboard/[accountId]/certificates/_components/AccountCertificatesTable';

import { Certificate, CertificateTemplate } from '@/lib/types/certificates';

type ViewMode = 'grid' | 'table';

export default function MyCertificatesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Get the active account ID to satisfy the required prop
  const activeAccount = useAppSelector(selectActiveAccount);
  const accountId = activeAccount?.id ?? '';

  const { data, isLoading, isFetching, refetch } = useGetMyCertificatesQuery({
    limit: 500,
  });

  // Fetch templates just to get names/designs if the grid uses them
  const { data: templatesData } = useListCertificateTemplatesQuery(accountId, {
    skip: !accountId,
  });

  const certificates = data?.data?.certificates ?? [];
  const templates = templatesData?.data?.templates ?? [];

  const templatesById = useMemo(() => {
    const map = new Map<string, CertificateTemplate>();
    templates.forEach((t) => map.set(t.id, t));
    return map;
  }, [templates]);

  const filtered = useMemo(() => {
    let list = certificates;

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.recipient_name.toLowerCase().includes(q) ||
          c.verification_code.toLowerCase().includes(q) ||
          (c.metadata?.context_title ?? '').toLowerCase().includes(q) ||
          (c.metadata?.issuer_name ?? '').toLowerCase().includes(q),
      );
    }

    return [...list].sort(
      (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime(),
    );
  }, [certificates, statusFilter, search]);

  const stats = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter((c) => c.status === 'active').length;
    const revoked = total - active;
    return { total, active, revoked, events: 0 };
  }, [certificates]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  const [downloadCertificate] = useDownloadCertificateMutation();

  const handleDownload = async (cert: Certificate) => {
    if (downloadingId) return;
    setDownloadingId(cert.id);
    const toastId = toast.loading('Preparing your certificate…');

    try {
      let finalUrl: string | null = null;
      for (let attempt = 0; attempt < 40; attempt++) {
        const result = await downloadCertificate(cert.id).unwrap();
        if (result.status === 'ready' && result.url) {
          finalUrl = result.url;
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }

      if (!finalUrl) {
        toast.error('Certificate is taking too long. Try again in a moment.', { id: toastId });
        return;
      }

      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${cert.recipient_name.replace(/\s+/g, '_')}_certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

      toast.success('Certificate downloaded', { id: toastId });
    } catch (err) {
      console.error('[download] error', err);
      toast.error('Failed to download certificate', { id: toastId });
    } finally {
      setDownloadingId(null);
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
            {certificates.length === 0 ? 'No certificates yet' : 'No certificates match'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {certificates.length === 0
              ? 'Complete an event to earn certificates.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            My Certificates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificates you have earned and can download.
          </p>
        </div>
      </div>

      {isLoading ? (
        <CertificateSkeleton count={6} />
      ) : (
        <>
          <AccountCertificatesStats
            total={stats.total}
            active={stats.active}
            revoked={stats.revoked}
            events={stats.events}
          />

          {certificates.length > 0 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Table
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <AccountCertificatesFilters
                  search={search}
                  onSearchChange={setSearch}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  eventFilter="all"
                  onEventChange={() => {}}
                  events={[]}
                  onReset={resetFilters}
                  resultCount={filtered.length}
                  totalCount={certificates.length}
                />
              </div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <AccountCertificatesGrid
              certificates={filtered}
              templatesById={templatesById}
              accountId={accountId} // Passed valid string
              downloadingId={downloadingId}
              onSend={() => {}}
              onRevoke={() => {}}
              onDownload={handleDownload}
              emptyState={emptyNode}
            />
          ) : (
            <AccountCertificatesTable
              certificates={filtered}
              accountId={accountId} // Passed valid string
              downloadingId={downloadingId}
              onSend={() => {}}
              onRevoke={() => {}}
              onDownload={handleDownload}
              emptyState={emptyNode}
            />
          )}
        </>
      )}
    </div>
  );
}
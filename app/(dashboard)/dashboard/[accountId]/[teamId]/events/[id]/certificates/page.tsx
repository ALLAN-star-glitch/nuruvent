// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Grid3X3, List, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetEventAttendeesQuery } from '@/lib/store/api/attendanceApi';
import {
  useDownloadCertificateMutation,
  useListAccountCertificatesQuery,
  useListCertificateTemplatesQuery,
} from '@/lib/store/api/certificatesApi';

import { EventCertificatesEmpty } from './_components/EventCertificatesEmpty';
import { EventCertificatesHeader } from './_components/EventCertificatesHeader';
import { EventCertificatesSkeleton } from './_components/EventCertificatesSkeleton';
import { EventCertificatesStats } from './_components/EventCertificatesStats';
import { IssueBatchDialog } from './_components/IssueBatchDialog';
import { RevokeCertificateDialog } from './_components/RevokeCertificateDialog';
import { SendCertificateDialog } from './_components/SendCertificateDialog';

import { Certificate, CertificateTemplate } from '@/lib/types/certificates';
import { SortDirection, SortField, ViewMode } from './_components/types';
import { AccountCertificatesGrid } from '../../../../certificates/_components/AccountCertificatesGrid';
import { AccountCertificatesTable } from '../../../../certificates/_components/AccountCertificatesTable';

export default function EventCertificatesPage() {
  const params = useParams<{
    accountId: string;
    teamId: string;
    id: string;
  }>();
  const accountId = params.accountId;
  const teamId = params.teamId;
  const eventId = params.id;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('issued_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<Certificate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    refetch: refetchList,
  } = useListAccountCertificatesQuery({
    accountId,
    params: { context_id: eventId, limit: 500 },
  });

  const { data: templatesData } = useListCertificateTemplatesQuery(accountId);
  const templates = templatesData?.data?.templates ?? [];

  const templatesById = useMemo(() => {
    const map = new Map<string, CertificateTemplate>();
    templates.forEach((t) => map.set(t.id, t));
    return map;
  }, [templates]);

  const { data: attendeesData } = useGetEventAttendeesQuery({
    eventId,
    params: {
      status: 'confirmed,full,partial,joined',
      page: 1,
      page_size: 100,
    },
  });

  const certificates = listData?.data?.certificates ?? [];
  const attendeeCount = attendeesData?.data?.total ?? 0;
  const canIssue = attendeeCount > 0;

  const stats = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter((c) => c.status === 'active').length;
    const revoked = total - active;
    const verified = 0;
    return { total, active, revoked, verified };
  }, [certificates]);

  const filtered = useMemo(() => {
    let list = [...certificates];

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.recipient_name.toLowerCase().includes(q) ||
          c.recipient_email.toLowerCase().includes(q) ||
          c.verification_code.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'recipient_name':
          cmp = a.recipient_name.localeCompare(b.recipient_name);
          break;
        case 'issued_at':
          cmp =
            new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime();
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'verification_code':
          cmp = a.verification_code.localeCompare(b.verification_code);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [certificates, statusFilter, search, sortField, sortDirection]);

  const hasFilters = search.trim().length > 0 || statusFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

const [downloadCertificate] = useDownloadCertificateMutation();

const handleDownload = async (cert: Certificate) => {
  if (downloadingId) return;

  // Open a blank tab synchronously — this is user-initiated
  const popup = window.open('', '_blank');

  setDownloadingId(cert.id);
  try {
    let finalUrl: string | null = null;

    for (let attempt = 0; attempt < 40; attempt++) {
      const result = await downloadCertificate(cert.id).unwrap();
      console.log('[download] poll', attempt, result);

      if (result.status === 'ready' && result.url) {
        finalUrl = result.url;
        break;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!finalUrl) {
      popup?.close();
      toast.error('Certificate is taking too long. Try again in a moment.');
      return;
    }

    if (popup && !popup.closed) {
      popup.location.href = finalUrl;
    } else {
      // Fallback if popup was blocked or closed
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    console.error('[download] error', err);
    popup?.close();
    toast.error('Failed to download certificate');
  } finally {
    setDownloadingId(null);
  }
};

  const backHref = `/dashboard/${accountId}/${teamId}/events/${eventId}`;

  const emptyNode = (
    <EventCertificatesEmpty
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      onIssue={() => setIssueDialogOpen(true)}
      canIssue={canIssue}
    />
  );

  return (
    <div className="space-y-6 pb-20">
      <EventCertificatesHeader
        eventTitle=""
        eventDate=""
        backHref={backHref}
        isFetching={listFetching}
        canIssue={canIssue}
        onRefresh={() => refetchList()}
        onIssue={() => setIssueDialogOpen(true)}
      />

      {listLoading ? (
        <EventCertificatesSkeleton view={viewMode} rows={6} />
      ) : (
        <>
          <EventCertificatesStats
            total={stats.total}
            active={stats.active}
            revoked={stats.revoked}
            verified={stats.verified}
          />

          {certificates.length > 0 && (
            <Card className="border-border">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 shrink-0">
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

                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search recipients or codes…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as 'all' | 'active' | 'revoked')
                  }
                >
                  <SelectTrigger className="w-full cursor-pointer sm:w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">
                      All statuses
                    </SelectItem>
                    <SelectItem value="active" className="cursor-pointer">
                      Active
                    </SelectItem>
                    <SelectItem value="revoked" className="cursor-pointer">
                      Revoked
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {viewMode === 'table' ? (
            <AccountCertificatesTable
              certificates={filtered}
              accountId={accountId}
              downloadingId={downloadingId}
              onSend={(c) => setSendTarget(c)}
              onRevoke={(c) => setRevokeTarget(c)}
              onDownload={handleDownload}
              emptyState={emptyNode}
            />
          ) : (
            <AccountCertificatesGrid
              certificates={filtered}
              templatesById={templatesById}
              accountId={accountId}
              downloadingId={downloadingId}
              onSend={(c) => setSendTarget(c)}
              onRevoke={(c) => setRevokeTarget(c)}
              onDownload={handleDownload}
              emptyState={emptyNode}
            />
          )}
        </>
      )}

      <IssueBatchDialog
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
        accountId={accountId}
        teamId={teamId}
        eventId={eventId}
        eventTitle=""
        eventDate={new Date().toISOString()}
        onIssued={() => refetchList()}
      />

      <SendCertificateDialog
        cert={sendTarget}
        onOpenChange={(v) => !v && setSendTarget(null)}
        onSent={() => refetchList()}
      />

      <RevokeCertificateDialog
        cert={revokeTarget}
        onOpenChange={(v) => !v && setRevokeTarget(null)}
        onRevoked={() => refetchList()}
      />
    </div>
  );
}
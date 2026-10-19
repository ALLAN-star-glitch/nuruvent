// app/(dashboard)/dashboard/[accountId]/certificates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Download,
  FileBadge,
  FileJson,
  FileSpreadsheet,
  FileText,
  Grid3X3,
  List,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDownloadCertificateMutation,
  useListAccountCertificatesQuery,
  useListCertificateTemplatesQuery,
} from '@/lib/store/api/certificatesApi';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';

import { AccountCertificatesFilters } from './_components/AccountCertificatesFilters';
import { AccountCertificatesHeader } from './_components/AccountCertificatesHeader';
import { AccountCertificatesSkeleton } from './_components/AccountCertificatesSkeleton';
import { AccountCertificatesStats } from './_components/AccountCertificatesStats';
import { AccountCertificatesGrid } from './_components/AccountCertificatesGrid';
import { AccountCertificatesTable } from './_components/AccountCertificatesTable';
import { SelectEventDialog } from './_components/SelectEventDialog';

import { IssueBatchDialog } from '../[teamId]/events/[id]/certificates/_components/IssueBatchDialog';
import { RevokeCertificateDialog } from '../[teamId]/events/[id]/certificates/_components/RevokeCertificateDialog';
import { SendCertificateDialog } from '../[teamId]/events/[id]/certificates/_components/SendCertificateDialog';

import { Certificate, CertificateTemplate } from '@/lib/types/certificates';
import type { Event } from '@/lib/types/events';
import {
  exportCertificatesToCSV,
  exportCertificatesToExcel,
  exportCertificatesToJSON,
  exportCertificatesToPDF,
} from '@/lib/utils/exportCertificates';

type ViewMode = 'grid' | 'table';

export default function AccountCertificatesPage() {
  const params = useParams<{ accountId: string; teamId?: string }>();
  const accountId = params.accountId;

  // Fetch accounts to reliably get the organizer/account name and logo
  const { data: accountsData } = useGetMyAccountsQuery();
  const account = accountsData?.find((a) => a.id === accountId);
  
  const organizerName =
    account?.display_name || account?.display_name || account?.name || 'Organizer';
    
  const organizerLogo = account?.logo_url || account?.logo_url || '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [selectEventOpen, setSelectEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [sendTarget, setSendTarget] = useState<Certificate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);

  const { data, isLoading, isFetching, refetch } = useListAccountCertificatesQuery({
    accountId,
    params: { limit: 500 },
  });

  const { data: templatesData } = useListCertificateTemplatesQuery(accountId);

  const certificates = data?.data?.certificates ?? [];
  const templates = templatesData?.data?.templates ?? [];

  const templatesById = useMemo(() => {
    const map = new Map<string, CertificateTemplate>();
    templates.forEach((t) => map.set(t.id, t));
    return map;
  }, [templates]);

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

    return [...list].sort(
      (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime(),
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
        toast.error('Certificate is taking too long. Try again in a moment.', {
          id: toastId,
        });
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

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    if (filtered.length === 0) {
      toast.error('No certificates to export');
      return;
    }

    setExporting(true);
    try {
      if (format === 'csv') {
        exportCertificatesToCSV(filtered, organizerName);
        toast.success('Exported as CSV');
      } else if (format === 'excel') {
        await exportCertificatesToExcel(filtered, organizerName);
        toast.success('Exported as Excel');
      } else if (format === 'json') {
        exportCertificatesToJSON(filtered, organizerName);
        toast.success('Exported as JSON');
      } else if (format === 'pdf') {
        await exportCertificatesToPDF(filtered, {
          title: 'Issued Certificates',
          hostName: organizerName,
          hostLogoUrl: organizerLogo,
        });
        toast.success('Exported as PDF');
      }
    } catch (err) {
      console.error('[export] error', err);
      toast.error('Failed to generate export');
    } finally {
      setExporting(false);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AccountCertificatesHeader
          accountId={accountId}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer shrink-0">
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Export {filtered.length} records
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExport('csv')}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('excel')}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('json')}
                className="cursor-pointer"
              >
                <FileJson className="mr-2 h-4 w-4" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('pdf')}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setSelectEventOpen(true)}
            className="cursor-pointer shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Issue Certificates
          </Button>
        </div>
      </div>

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
                  eventFilter={eventFilter}
                  onEventChange={setEventFilter}
                  events={eventOptions}
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
              accountId={accountId}
              downloadingId={downloadingId}
              onSend={(c) => setSendTarget(c)}
              onRevoke={(c) => setRevokeTarget(c)}
              onDownload={handleDownload}
              emptyState={emptyNode}
            />
          ) : (
            <AccountCertificatesTable
              certificates={filtered}
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

      <SelectEventDialog
        open={selectEventOpen}
        accountId={accountId}
        onOpenChange={setSelectEventOpen}
        onSelect={(event) => {
          setSelectEventOpen(false);
          setSelectedEvent(event);
        }}
      />

      {selectedEvent && (
        <IssueBatchDialog
          open={!!selectedEvent}
          onOpenChange={(open) => {
            if (!open) setSelectedEvent(null);
          }}
          accountId={accountId}
          teamId={selectedEvent.team_id ?? ''}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.display_name || selectedEvent.name || 'Untitled event'}
          eventDate={selectedEvent.start_date || new Date().toISOString()}
          onIssued={() => {
            setSelectedEvent(null);
            refetch();
          }}
        />
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
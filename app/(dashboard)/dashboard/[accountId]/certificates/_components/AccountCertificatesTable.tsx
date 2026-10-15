// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificatesTable.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';



import { Certificate } from '@/lib/types/certificates';
import { AccountCertificateRow } from './AccountCertificateRow';

interface Props {
  certificates: Certificate[];
  accountId: string;
  teamId?: string;
  onSend: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
  emptyState: React.ReactNode;
}

export function AccountCertificatesTable({
  certificates,
  accountId,
  teamId,
  onSend,
  onRevoke,
  onDownload,
  emptyState,
}: Props) {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">
                  Recipient
                </TableHead>
                <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">
                  Event
                </TableHead>
                <TableHead className="hidden px-4 py-3 text-xs uppercase tracking-wide sm:table-cell">
                  Verification
                </TableHead>
                <TableHead className="px-4 py-3 text-xs uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="hidden px-4 py-3 text-xs uppercase tracking-wide md:table-cell">
                  Issued
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    {emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => (
                  <AccountCertificateRow
                    key={cert.id}
                    cert={cert}
                    accountId={accountId}
                    teamId={teamId}
                    onSend={onSend}
                    onRevoke={onRevoke}
                    onDownload={onDownload}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
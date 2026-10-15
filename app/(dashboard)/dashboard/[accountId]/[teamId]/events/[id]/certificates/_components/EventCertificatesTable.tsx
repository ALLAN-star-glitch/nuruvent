// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/EventCertificatesTable.tsx

'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


import { EventCertificateRow } from './EventCertificateRow';

import { Certificate } from '@/lib/types/certificates';
import { SortDirection, SortField } from '../types';


interface Props {
  certificates: Certificate[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSend: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
  emptyState: React.ReactNode;
}

function SortIcon({
  field,
  active,
  direction,
}: {
  field: SortField;
  active: SortField;
  direction: SortDirection;
}) {
  if (field !== active) {
    return (
      <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-muted-foreground" />
    );
  }
  return direction === 'asc' ? (
    <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-primary" />
  ) : (
    <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-primary" />
  );
}

export function EventCertificatesTable({
  certificates,
  sortField,
  sortDirection,
  onSort,
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
                <TableHead
                  className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wide"
                  onClick={() => onSort('recipient_name')}
                >
                  Recipient
                  <SortIcon
                    field="recipient_name"
                    active={sortField}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wide"
                  onClick={() => onSort('verification_code')}
                >
                  Verification
                  <SortIcon
                    field="verification_code"
                    active={sortField}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wide"
                  onClick={() => onSort('status')}
                >
                  Status
                  <SortIcon
                    field="status"
                    active={sortField}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer px-4 py-3 text-xs uppercase tracking-wide"
                  onClick={() => onSort('issued_at')}
                >
                  Issued
                  <SortIcon
                    field="issued_at"
                    active={sortField}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    {emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => (
                  <EventCertificateRow
                    key={cert.id}
                    cert={cert}
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
// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificateRow.tsx

'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Download,
  MoreVertical,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Certificate } from '@/lib/types/certificates';



interface Props {
  cert: Certificate;
  accountId: string;
  teamId?: string;
  onSend: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
}

function formatDate(value: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

export function AccountCertificateRow({
  cert,
  accountId,
  teamId,
  onSend,
  onRevoke,
  onDownload,
}: Props) {
  const isRevoked = cert.status === 'revoked';
  const contextTitle = cert.metadata?.context_title ?? '—';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cert.verification_code);
      toast.success('Verification code copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Link to the event's certificate page if we have teamId
  const eventHref =
    teamId && cert.context_type === 'event'
      ? `/dashboard/${accountId}/${teamId}/events/${cert.context_id}/certificates`
      : null;

  return (
    <TableRow className="hover:bg-muted/40">
      {/* Recipient */}
      <TableCell className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {cert.recipient_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {cert.recipient_email}
          </p>
        </div>
      </TableCell>

      {/* Event */}
      <TableCell className="px-4 py-3">
        <div className="min-w-0">
          {eventHref ? (
            <Link
              href={eventHref}
              className="truncate text-sm text-foreground transition-colors hover:text-primary"
            >
              {contextTitle}
            </Link>
          ) : (
            <p className="truncate text-sm text-foreground">{contextTitle}</p>
          )}
          <p className="truncate text-xs capitalize text-muted-foreground">
            {cert.context_type}
          </p>
        </div>
      </TableCell>

      {/* Code */}
      <TableCell className="hidden px-4 py-3 sm:table-cell">
        <button
          type="button"
          onClick={copyCode}
          className="group flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          title="Copy code"
        >
          <span className="truncate">{cert.verification_code}</span>
          <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </TableCell>

      {/* Status */}
      <TableCell className="px-4 py-3">
        {isRevoked ? (
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Revoked
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )}
      </TableCell>

      {/* Issued */}
      <TableCell className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
        {formatDate(cert.issued_at)}
      </TableCell>

      {/* Actions */}
      <TableCell className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onDownload(cert)}
              disabled={isRevoked}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onSend(cert)}
            >
              <Send className="mr-2 h-4 w-4" />
              Resend email
            </DropdownMenuItem>
            {eventHref && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={eventHref}>Open event</Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => onRevoke(cert)}
              disabled={isRevoked}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revoke
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
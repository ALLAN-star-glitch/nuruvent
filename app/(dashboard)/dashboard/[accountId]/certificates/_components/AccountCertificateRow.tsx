// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificateRow.tsx

'use client';

import { Download, Loader2, MoreVertical, Send, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Certificate } from '@/lib/types/certificates';

interface Props {
  cert: Certificate;
  accountId: string;
  teamId?: string;
  isDownloading?: boolean;
  onSend: (cert: Certificate) => void;
  onRevoke: (cert: Certificate) => void;
  onDownload: (cert: Certificate) => void;
}

export function AccountCertificateRow({
  cert,
  isDownloading,
  onSend,
  onRevoke,
  onDownload,
}: Props) {
  const isActive = cert.status === 'active';

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      {/* Recipient */}
      <TableCell className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground truncate">
            {cert.recipient_name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {cert.recipient_email}
          </span>
        </div>
      </TableCell>

      {/* Event */}
      <TableCell className="px-4 py-3">
        <span className="text-sm text-foreground truncate">
          {cert.metadata?.context_title || '—'}
        </span>
      </TableCell>

      {/* Verification Code */}
      <TableCell className="hidden px-4 py-3 sm:table-cell">
        <span className="text-xs font-mono text-muted-foreground truncate">
          {cert.verification_code}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {cert.status}
        </span>
      </TableCell>

      {/* Issued */}
      <TableCell className="hidden px-4 py-3 md:table-cell">
        <span className="text-sm text-muted-foreground">
          {new Date(cert.issued_at).toLocaleDateString()}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onDownload(cert)}
            disabled={isDownloading}
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onSend(cert)}
              >
                <Send className="mr-2 h-4 w-4" />
                Resend Email
              </DropdownMenuItem>
              {isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onRevoke(cert)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Revoke
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
// components/team/InvitationRow.tsx
'use client';

import {
  Mail,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatShortDate, formatRelative } from '@/lib/utils/format-date';
import type { Invitation, InvitationStatus } from '@/lib/types/invitation';

function roleLabel(role?: string | null): string {
  if (role === 'account_admin') return 'Admin';
  if (role === 'trainer') return 'Trainer';
  return role || '—';
}

interface InvitationRowProps {
  invitation: Invitation;
  onResend: (invitationId: string) => void;
  busy?: boolean;
}

const STATUS_META: Record<
  InvitationStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className:
      'border-amber-200 text-amber-700 bg-amber-50/60 dark:border-amber-900 dark:text-amber-400 dark:bg-amber-950/30',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    className:
      'border-green-200 text-green-700 bg-green-50/60 dark:border-green-900 dark:text-green-400 dark:bg-green-950/30',
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    className:
      'border-rose-200 text-rose-700 bg-rose-50/60 dark:border-rose-900 dark:text-rose-400 dark:bg-rose-950/30',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    className: 'border-muted text-muted-foreground bg-muted/40',
  },
};

export function InvitationRow({
  invitation,
  onResend,
  busy,
}: InvitationRowProps) {
  const meta = STATUS_META[invitation.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const isPending = invitation.status === 'pending';

  return (
    <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Mail className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {invitation.email}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>Role: {roleLabel(invitation.role)}</span>
            <span className="hidden sm:inline">
              Sent {formatShortDate(invitation.created_at)}
            </span>
            {isPending && (
              <span>Expires {formatRelative(invitation.expires_at)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <Badge
          variant="outline"
          className={cn('gap-1 text-[10px]', meta.className)}
        >
          <StatusIcon className="h-3 w-3" />
          {meta.label}
        </Badge>

        {isPending && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResend(invitation.id)}
            disabled={busy}
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
            Resend
          </Button>
        )}
      </div>
    </div>
  );
}
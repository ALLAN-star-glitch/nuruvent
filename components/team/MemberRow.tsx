// components/team/MemberRow.tsx
'use client';

import {
  MoreHorizontal,
  Shield,
  UserMinus,
  GraduationCap,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatShortDate } from '@/lib/utils/format-date';
import type { TeamMember } from '@/lib/types/team';

// Local — the backend only accepts these two roles
// (see team_handler.go InviteMember).
const ASSIGNABLE_ROLES = [
  {
    value: 'account_admin',
    label: 'Admin',
    hint: 'Full access to teams, members, events, and billing.',
  },
  {
    value: 'trainer',
    label: 'Trainer',
    hint: 'Can create and run events; cannot manage members.',
  },
] as const;

function roleLabel(role?: string | null): string {
  if (role === 'account_admin') return 'Admin';
  if (role === 'trainer') return 'Trainer';
  return role || '—';
}

interface MemberRowProps {
  member: TeamMember;
  /** Role from the account membership, resolved by the page. */
  role?: string | null;
  /** The current user's own user id — used to mark "You". */
  currentUserId?: string | null;
  onChangeRole: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  /** Disables actions while a mutation is in flight. */
  busy?: boolean;
}

export function MemberRow({
  member,
  role,
  currentUserId,
  onChangeRole,
  onRemove,
  busy,
}: MemberRowProps) {
  // The backend does NOT return a `user` object today. If that changes,
  // we light up automatically. Until then, degrade to a monogram.
  const user = member.user;
  const displayName =
    user?.display_name || user?.name || `Member ${member.user_id.slice(0, 8)}`;
  const email = user?.email ?? null;
  const avatarUrl = user?.avatar_url ?? undefined;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isSelf = currentUserId === member.user_id;
  const isAdmin = role === 'account_admin';

  return (
    <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback
          className={cn(
            'text-xs font-semibold',
            isAdmin
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
              : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          {isSelf && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] font-normal"
            >
              You
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {email ? (
            <span className="truncate">{email}</span>
          ) : (
            <span className="truncate font-mono">
              {member.user_id.slice(0, 8)}…
            </span>
          )}
          <span className="hidden sm:inline">
            Joined {formatShortDate(member.joined_at)}
          </span>
        </div>
      </div>

      <Badge
        variant="outline"
        className={cn(
          'hidden shrink-0 gap-1 text-[10px] sm:inline-flex',
          isAdmin
            ? 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30'
            : 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30',
        )}
      >
        {isAdmin ? (
          <Shield className="h-3 w-3" />
        ) : (
          <GraduationCap className="h-3 w-3" />
        )}
        {roleLabel(role)}
      </Badge>

      {/* Actions are always rendered. Backend rejects with 403 if not allowed. */}
      {!isSelf && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
              disabled={busy}
              aria-label="Member actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {displayName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                Change role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                {ASSIGNABLE_ROLES.map((r) => (
                  <DropdownMenuItem
                    key={r.value}
                    disabled={role === r.value}
                    onClick={() => onChangeRole(member.user_id, r.value)}
                    className="cursor-pointer flex-col items-start gap-0.5 py-2"
                  >
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.hint}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
                  Roles apply across the whole account, not just this team.
                </p>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRemove(member.user_id)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
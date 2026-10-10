// components/team/AddExistingMemberDialog.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import {
  useAddTeamMemberMutation,
  useGetTeamMembersQuery,
} from '@/lib/store/api/teamsApi';
import { useGetAccountMembersQuery } from '@/lib/store/api/accountsApi';
import type { AccountMember } from '@/lib/types/account';

interface AddExistingMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  accountId: string;
  onAdded?: () => void;
}

function AddableMemberRow({
  member,
  isPending,
  isBusy,
  onAdd,
}: {
  member: AccountMember;
  isPending: boolean;
  isBusy: boolean;
  onAdd: (userId: string, displayName: string) => void;
}) {
  const displayName = member.display_name || member.name || 'Account member';
  const email = member.email || '';
  const avatarUrl = member.avatar_url || undefined;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isRowBusy = isBusy && !isPending;

  return (
    <button
      type="button"
      onClick={() => onAdd(member.user_id, displayName)}
      disabled={isRowBusy}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors',
        isPending
          ? 'bg-primary/5'
          : 'hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {displayName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {email || member.user_id.slice(0, 8)}
        </p>
      </div>

      {isPending ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
      ) : (
        <Check className="h-4 w-4 shrink-0 text-muted-foreground/40" />
      )}
    </button>
  );
}

export function AddExistingMemberDialog({
  open,
  onOpenChange,
  teamId,
  accountId,
  onAdded,
}: AddExistingMemberDialogProps) {
  const [search, setSearch] = useState('');
  const [pendingAddUserId, setPendingAddUserId] = useState<string | null>(null);

  const [addMember, { isLoading: isAdding }] = useAddTeamMemberMutation();

  const { data: accountMembers, isLoading: accountMembersLoading } =
    useGetAccountMembersQuery(accountId, { skip: !accountId || !open });

  const { data: teamMembersData, isLoading: teamMembersLoading } =
    useGetTeamMembersQuery(
      { teamId, params: { limit: 100, offset: 0 } },
      { skip: !teamId || !open },
    );

  const existingTeamUserIds = useMemo(() => {
    const ids = new Set<string>();
    teamMembersData?.members?.forEach((m) => ids.add(m.user_id));
    return ids;
  }, [teamMembersData]);

  const addableMembers = useMemo(() => {
    if (!accountMembers) return [];
    const q = search.trim().toLowerCase();
    return accountMembers
      .filter((m) => !existingTeamUserIds.has(m.user_id))
      .filter((m) => {
        if (!q) return true;
        const name = (m.display_name || m.name || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
  }, [accountMembers, existingTeamUserIds, search]);

  const isLoading = accountMembersLoading || teamMembersLoading;

  // Reset when the dialog closes.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch('');
      setPendingAddUserId(null);
    }
  }, [open]);

  const handleAdd = async (userId: string, displayName: string) => {
    setPendingAddUserId(userId);
    try {
      await addMember({
        teamId,
        data: { user_id: userId },
      }).unwrap();
      toast.success('Member added', {
        description: `${displayName} has been added to the team.`,
      });
      onAdded?.();
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to add member';
      toast.error(message);
    } finally {
      setPendingAddUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            Add existing member
          </DialogTitle>
          <DialogDescription>
            Pick someone who already belongs to this account and add them
            to this team. Their role is unchanged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search account members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl pl-9"
              disabled={isAdding}
              autoFocus
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto rounded-xl border border-border/60">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : addableMembers.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  {search
                    ? 'No matching members'
                    : 'Everyone in this account is already on the team'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {search
                    ? 'Try a different name or email.'
                    : 'Invite new people by email instead.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {addableMembers.map((m) => (
                  <AddableMemberRow
                    key={m.user_id}
                    member={m}
                    isPending={pendingAddUserId === m.user_id}
                    isBusy={isAdding}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
              className="cursor-pointer"
            >
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
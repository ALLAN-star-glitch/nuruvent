/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/dashboard/[accountId]/[teamId]/settings/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

import {
  useGetTeamQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useLeaveTeamMutation,
  useGetTeamMembersQuery,
  useRemoveTeamMemberMutation,
  useGetTeamInvitationsQuery,
  useResendInvitationMutation,
} from '@/lib/store/api/teamsApi';
import {
  useGetAccountByIdQuery,
  useGetAccountMembersQuery,
  useUpdateAccountMemberRoleMutation,
} from '@/lib/store/api/accountsApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/lib/types/team';
import type { Invitation, InvitationStatus } from '@/lib/types/invitation';

import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { AddExistingMemberDialog } from '@/components/team/AddExistingMemberDialog';

// ============================================================
// TYPES + CONSTANTS
// ============================================================

type SettingsTab = 'general' | 'members' | 'invitations' | 'danger';

const TABS: Array<{
  key: SettingsTab;
  label: string;
  hint: string;
  icon: typeof Settings2;
  danger?: boolean;
}> = [
  { key: 'general', label: 'General', hint: 'Name, display name', icon: Settings2 },
  { key: 'members', label: 'Members', hint: 'People on this team', icon: Users },
  { key: 'invitations', label: 'Invitations', hint: 'Pending & past', icon: Mail },
  {
    key: 'danger',
    label: 'Danger Zone',
    hint: 'Leave or delete',
    icon: Trash2,
    danger: true,
  },
];

const HASH_TO_TAB: Record<string, SettingsTab> = {
  general: 'general',
  members: 'members',
  invitations: 'invitations',
  danger: 'danger',
};

function readTabFromHash(): SettingsTab | null {
  if (typeof window === 'undefined') return null;
  const raw = window.location.hash.replace(/^#/, '');
  return HASH_TO_TAB[raw] ?? null;
}

// Roles assignable via the role-change dropdown in the member row.
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
  {
    value: 'learner',
    label: 'Learner',
    hint: 'Can view events, register, and access their own certificates.',
  },
] as const;

const INVITATION_FILTERS: Array<{
  key: 'all' | InvitationStatus;
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'expired', label: 'Expired' },
];

// ============================================================
// HELPERS
// ============================================================

function roleLabel(role?: string | null): string {
  if (role === 'account_admin') return 'Admin';
  if (role === 'trainer') return 'Trainer';
  if (role === 'learner') return 'Learner';
  return role || '—';
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelative(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diffDays = Math.round(
    (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

// ============================================================
// PAGE
// ============================================================

export default function TeamSettingsPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string; teamId: string }>();
  const accountId = params.accountId;
  const teamId = params.teamId;

  const currentUserId = useAppSelector(selectUser)?.id ?? null;

  const { data: account } = useGetAccountByIdQuery(accountId, {
    skip: !accountId,
  });

  const {
    data: team,
    isLoading,
    isError,
  } = useGetTeamQuery(teamId, { skip: !teamId });

  const [updateTeam, { isLoading: saving }] = useUpdateTeamMutation();
  const [deleteTeam, { isLoading: deleting }] = useDeleteTeamMutation();
  const [leaveTeam, { isLoading: leaving }] = useLeaveTeamMutation();

  // Caller's role in this account — drives the invite dialog's role picker.
  const { data: accountMembers } = useGetAccountMembersQuery(accountId, {
    skip: !accountId,
  });
  const myRoleInAccount = useMemo(
    () =>
      accountMembers?.find((m) => m.user_id === currentUserId)?.role ?? null,
    [accountMembers, currentUserId],
  );

  const [tab, setTab] = useState<SettingsTab>(
    () => readTabFromHash() ?? 'general',
  );
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  useEffect(() => {
    if (!team) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(team.name ?? '');
    setDisplayName(team.display_name ?? '');
  }, [team]);

  useEffect(() => {
    const applyHash = () => {
      const next = readTabFromHash();
      if (next) setTab(next);
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const handleTabChange = (next: SettingsTab) => {
    setTab(next);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}#${next}`,
      );
    }
  };

  const handleSave = async () => {
    try {
      await updateTeam({
        teamId,
        data: { name: name.trim(), display_name: displayName.trim() },
      }).unwrap();
      toast.success('Team updated');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update team';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeam(teamId).unwrap();
      toast.success('Team deleted');
      router.push(`/dashboard/${accountId}`);
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveTeam(teamId).unwrap();
      toast.success('You left the team');
      router.push(`/dashboard/${accountId}`);
    } catch {
      toast.error('Failed to leave team');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="w-full py-16">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Team not found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been deleted or you don&apos;t have access.
          </p>
          <Button
            className="mt-6 cursor-pointer"
            onClick={() => router.push(`/dashboard/${accountId}`)}
          >
            Back to account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex items-start gap-2 sm:gap-3">
        <Link
          href={`/dashboard/${accountId}/${teamId}`}
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
          aria-label="Back to team"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:gap-2 sm:text-[11px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span className="truncate">
              {account?.display_name || account?.name || 'Account'}
            </span>
            <span className="shrink-0 text-muted-foreground/50">/</span>
            <span className="truncate">{team.display_name || team.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              Team settings
            </h1>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px]',
                team.type === 'personal'
                  ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                  : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30',
              )}
            >
              {team.type === 'personal' ? 'Personal' : 'Institution'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage this team&apos;s identity, members, and invitations.
          </p>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:h-fit lg:self-start">
          {/* Mobile: horizontal scrollable pill tabs */}
          <div className="-mx-3 overflow-x-auto px-3 pb-1 lg:hidden scrollbar-none">
            <nav className="flex gap-1.5 w-max">
              {TABS.map((t) => {
                const isActive = tab === t.key;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleTabChange(t.key)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                      isActive
                        ? t.danger
                          ? 'border-destructive/40 bg-destructive/10 text-destructive'
                          : 'border-primary/40 bg-primary/10 text-primary'
                        : t.danger
                          ? 'border-border text-destructive/80 hover:bg-destructive/5'
                          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop: vertical nav */}
          <nav className="hidden lg:flex lg:flex-col lg:gap-0.5">
            {TABS.map((t) => {
              const isActive = tab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTabChange(t.key)}
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                    isActive
                      ? t.danger
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                      : t.danger
                        ? 'text-destructive/80 hover:bg-destructive/10'
                        : 'text-foreground/80 hover:bg-accent',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive && t.danger
                        ? 'text-destructive/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {t.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 space-y-4 sm:space-y-6">
          {tab === 'general' && (
            <Card className="w-full max-w-2xl border-border/70 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <CardTitle className="text-sm font-semibold sm:text-base">
                  General
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  How this team is identified inside your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
                <div className="space-y-2">
                  <Label htmlFor="team-display" className="text-xs sm:text-sm">
                    Name
                  </Label>
                  <Input
                    id="team-display"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. My Technology Team"
                    className="h-10 rounded-xl text-sm sm:h-11"
                  />
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Shown on event pages and in menus.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-name" className="text-xs sm:text-sm">
                    Internal name
                  </Label>
                  <Input
                    id="team-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. my-it-team"
                    className="h-10 rounded-xl text-sm sm:h-11"
                  />
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Used internally to identify this team. Letters, numbers,
                    and dashes.
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground sm:text-sm">
                      Slug
                    </span>
                    <code className="truncate rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:text-xs">
                      {team.slug}
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-muted-foreground sm:text-sm">
                      Team ID
                    </span>
                    <code className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:text-xs">
                      {team.id.slice(0, 8)}…
                    </code>
                  </div>
                </div>

                <div className="flex justify-end pt-1 sm:pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full cursor-pointer gap-2 sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'members' && (
            <MembersPanel
              accountId={accountId}
              teamId={teamId}
              currentUserId={currentUserId}
              currentUserRole={myRoleInAccount}
            />
          )}

          {tab === 'invitations' && (
            <InvitationsPanel
              teamId={teamId}
              accountId={accountId}
              currentUserRole={myRoleInAccount}
            />
          )}

          {tab === 'danger' && (
            <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Leave team
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Remove yourself from this team. You&apos;ll lose access to
                    its events and members.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsLeaveOpen(true)}
                    disabled={leaving}
                    className="w-full cursor-pointer gap-2 sm:w-auto"
                  >
                    <LogOut className="h-4 w-4" />
                    Leave team
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 shadow-sm">
                <CardHeader className="bg-destructive/5 px-4 py-4 sm:px-6 sm:py-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive sm:text-base">
                    <AlertCircle className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-xs text-destructive/80 sm:text-sm">
                    Irreversible actions. Please be certain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Delete this team
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                        Permanently deletes the team and its events, attendees,
                        and payments.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeleteOpen(true)}
                      className="w-full shrink-0 cursor-pointer gap-2 sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* LEAVE CONFIRM */}
      <AlertDialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this team?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll lose access immediately. Your account membership is
              unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={leaving}
              className="cursor-pointer"
            >
              {leaving ? 'Leaving…' : 'Leave team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete team?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes{' '}
              <strong>{team.display_name || team.name}</strong> and everything
              inside it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete team'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// MEMBERS PANEL
// ============================================================

interface SelfProfile {
  name?: string;
  displayName?: string;
  email?: string;
  avatar_url?: string;
}

function MembersPanel({
  accountId,
  teamId,
  currentUserId,
  currentUserRole,
}: {
  accountId: string;
  teamId: string;
  currentUserId: string | null;
  currentUserRole: string | null;
}) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const me = useAppSelector(selectUser);

  const {
    data: membersData,
    isLoading,
    isError,
  } = useGetTeamMembersQuery(
    { teamId, params: { search: search || undefined, limit: 50, offset: 0 } },
    { skip: !teamId },
  );

  const { data: accountMembers } = useGetAccountMembersQuery(accountId, {
    skip: !accountId,
  });

  const [removeMember, { isLoading: removing }] =
    useRemoveTeamMemberMutation();
  const [updateRole, { isLoading: updatingRole }] =
    useUpdateAccountMemberRoleMutation();

  const userByUserId = useMemo(() => {
    const map = new Map<
      string,
      { name?: string; display_name?: string; email?: string; avatar_url?: string }
    >();
    accountMembers?.forEach((m) =>
      map.set(m.user_id, {
        name: m.name,
        display_name: m.display_name,
        email: m.email,
        avatar_url: m.avatar_url,
      }),
    );
    return map;
  }, [accountMembers]);

  const roleByUserId = useMemo(() => {
    const map = new Map<string, string>();
    accountMembers?.forEach((m) => map.set(m.user_id, m.role));
    return map;
  }, [accountMembers]);

  const members = membersData?.members ?? [];
  const total = membersData?.total ?? 0;
  const busy = removing || updatingRole;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      await updateRole({
        accountId,
        userId,
        data: { role: role as 'account_admin' | 'trainer' | 'learner' },
      }).unwrap();
      toast.success('Role updated');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update role';
      toast.error(message);
    }
  };

  const handleConfirmRemove = async () => {
    if (!pendingRemove) return;
    try {
      await removeMember({ teamId, userId: pendingRemove }).unwrap();
      toast.success('Member removed');
      setPendingRemove(null);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to remove member';
      toast.error(message);
    }
  };

  const showSearch = members.length > 1;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showSearch ? (
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full sm:max-w-xs"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search members…"
              className="h-10 rounded-xl pl-9 text-sm"
            />
          </form>
        ) : (
          <div className="hidden sm:block" />
        )}

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            onClick={() => setAddExistingOpen(true)}
            variant="outline"
            className="w-full cursor-pointer gap-2 sm:w-auto shrink-0"
          >
            <UserCheck className="h-4 w-4" />
            Add existing
          </Button>
          <Button
            onClick={() => setInviteOpen(true)}
            className="w-full cursor-pointer gap-2 sm:w-auto shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border/70 bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load members. Please try again.
          </p>
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No members yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invite someone to give them access to this team.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>
                {total} {total === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/70">
            {members.map((m) => (
              <MemberRowWithProfile
                key={m.id}
                member={m}
                me={me}
                role={roleByUserId.get(m.user_id) ?? null}
                enrichedUserFromAccount={userByUserId.get(m.user_id)}
                currentUserId={currentUserId}
                busy={busy}
                onChangeRole={handleChangeRole}
                onRemove={setPendingRemove}
              />
            ))}
          </div>
        </div>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        teamId={teamId}
        currentUserRole={currentUserRole}
      />

      <AddExistingMemberDialog
        open={addExistingOpen}
        onOpenChange={setAddExistingOpen}
        teamId={teamId}
        accountId={accountId}
      />

      <AlertDialog
        open={!!pendingRemove}
        onOpenChange={(o) => !o && setPendingRemove(null)}
      >
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll lose access to this team immediately. Their account
              membership is unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              disabled={removing}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// MEMBER ROW WITH PROFILE
// ============================================================

function MemberRowWithProfile({
  member,
  me,
  role,
  enrichedUserFromAccount,
  currentUserId,
  busy,
  onChangeRole,
  onRemove,
}: {
  member: TeamMember;
  me: SelfProfile | null;
  role: string | null;
  enrichedUserFromAccount?: {
    name?: string;
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
  currentUserId: string | null;
  busy: boolean;
  onChangeRole: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
}) {
  const isSelf = currentUserId === member.user_id;

  const enrichedUser = enrichedUserFromAccount
    ? {
        id: member.user_id,
        name: enrichedUserFromAccount.name ?? '',
        display_name:
          enrichedUserFromAccount.display_name ??
          enrichedUserFromAccount.name ??
          '',
        email: enrichedUserFromAccount.email ?? '',
        avatar_url: enrichedUserFromAccount.avatar_url ?? '',
      }
    : member.user ??
      (isSelf && me
        ? {
            id: member.user_id,
            name: me.name ?? '',
            display_name: me.displayName ?? me.name ?? '',
            email: me.email ?? '',
            avatar_url: me.avatar_url ?? '',
          }
        : undefined);

  return (
    <MemberRow
      member={member}
      me={me}
      role={role}
      currentUserId={currentUserId}
      busy={busy}
      onChangeRole={onChangeRole}
      onRemove={onRemove}
      enrichedUser={enrichedUser}
    />
  );
}

// ============================================================
// MEMBER ROW
// ============================================================

function MemberRow({
  member,
  me,
  role,
  currentUserId,
  busy,
  onChangeRole,
  onRemove,
  enrichedUser,
}: {
  member: TeamMember;
  me: SelfProfile | null;
  role: string | null;
  currentUserId: string | null;
  busy: boolean;
  onChangeRole: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  enrichedUser?: {
    id: string;
    name: string;
    display_name: string;
    email: string;
    avatar_url: string;
  };
}) {
  const isSelf = currentUserId === member.user_id;

  const user =
    enrichedUser ??
    member.user ??
    (isSelf && me
      ? {
          id: member.user_id,
          name: me.name ?? '',
          display_name: me.displayName ?? me.name ?? '',
          email: me.email ?? '',
          avatar_url: me.avatar_url ?? '',
        }
      : undefined);

  const displayName = user?.display_name || user?.name || 'Team member';
  const email = user?.email ?? null;
  const avatarUrl = user?.avatar_url || undefined;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = role === 'account_admin';
  const isTrainer = role === 'trainer';
  const isLearner = role === 'learner';

  const RoleIcon = isAdmin ? Shield : isTrainer ? GraduationCap : BookOpen;

  return (
    <div className="flex min-w-0 items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <Avatar className="h-8 w-8 shrink-0 sm:h-9 sm:w-9">
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          {isSelf && (
            <Badge
              variant="outline"
              className="shrink-0 text-[9px] font-normal sm:text-[10px]"
            >
              You
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground sm:gap-x-3 sm:text-xs">
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

        <div className="mt-1.5 flex items-center gap-1.5 sm:hidden">
          {role && (
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-[10px]',
                isAdmin
                  ? 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30'
                  : isTrainer
                    ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                    : 'border-emerald-200 text-emerald-600 bg-emerald-50/50 dark:border-emerald-900 dark:text-emerald-400 dark:bg-emerald-950/30',
              )}
            >
              <RoleIcon className="h-3 w-3" />
              {roleLabel(role)}
            </Badge>
          )}
        </div>
      </div>

      {role && (
        <Badge
          variant="outline"
          className={cn(
            'hidden shrink-0 gap-1 text-[10px] sm:inline-flex',
            isAdmin
              ? 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30'
              : isTrainer
                ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                : 'border-emerald-200 text-emerald-600 bg-emerald-50/50 dark:border-emerald-900 dark:text-emerald-400 dark:bg-emerald-950/30',
          )}
        >
          <RoleIcon className="h-3 w-3" />
          {roleLabel(role)}
        </Badge>
      )}

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
                {ASSIGNABLE_ROLES.map((r) => {
                  const Icon =
                    r.value === 'account_admin'
                      ? Shield
                      : r.value === 'trainer'
                        ? GraduationCap
                        : BookOpen;
                  return (
                    <DropdownMenuItem
                      key={r.value}
                      disabled={role === r.value}
                      onClick={() => onChangeRole(member.user_id, r.value)}
                      className="cursor-pointer items-start gap-2 py-2"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{r.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.hint}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
                  Roles apply across the whole account.
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

// ============================================================
// INVITATIONS PANEL
// ============================================================

function InvitationsPanel({
  teamId,
  accountId,
  currentUserRole,
}: {
  teamId: string;
  accountId: string;
  currentUserRole: string | null;
}) {
  const [filter, setFilter] = useState<'all' | InvitationStatus>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetTeamInvitationsQuery(
    {
      teamId,
      params: {
        limit: 50,
        offset: 0,
        status: filter === 'all' ? undefined : filter,
      },
    },
    { skip: !teamId },
  );

  const [resend] = useResendInvitationMutation();

  const invitations = data?.invitations ?? [];
  const total = data?.total ?? 0;

  const handleResend = async (invitationId: string) => {
    setBusyId(invitationId);
    try {
      await resend({
        teamId,
        data: { invitation_id: invitationId },
      }).unwrap();
      toast.success('Invitation resent');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to resend invitation';
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {INVITATION_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer sm:px-3 sm:py-1.5 sm:text-xs',
                  active
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            onClick={() => setAddExistingOpen(true)}
            variant="outline"
            className="w-full cursor-pointer gap-2 sm:w-auto shrink-0"
          >
            <UserCheck className="h-4 w-4" />
            Add existing
          </Button>
          <Button
            onClick={() => setInviteOpen(true)}
            className="w-full cursor-pointer gap-2 sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            Invite
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border/70 bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load invitations. Please try again.
          </p>
        </div>
      ) : invitations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No invitations yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invite someone to give them access to this team.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>
                {total} {total === 1 ? 'invitation' : 'invitations'}
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/70">
            {invitations.map((inv) => (
              <InvitationRow
                key={inv.id}
                invitation={inv}
                onResend={handleResend}
                busy={busyId === inv.id}
              />
            ))}
          </div>
        </div>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        teamId={teamId}
        currentUserRole={currentUserRole}
      />

      <AddExistingMemberDialog
        open={addExistingOpen}
        onOpenChange={setAddExistingOpen}
        teamId={teamId}
        accountId={accountId}
      />
    </div>
  );
}

// ============================================================
// INVITATION ROW
// ============================================================

function InvitationRow({
  invitation,
  onResend,
  busy,
}: {
  invitation: Invitation;
  onResend: (id: string) => void;
  busy: boolean;
}) {
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
  const meta = STATUS_META[invitation.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const isPending = invitation.status === 'pending';

  return (
    <div className="flex flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-9 sm:w-9">
          <Mail className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {invitation.email}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground sm:gap-x-3 sm:text-xs">
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
      <div className="flex items-center gap-2 pl-11 sm:shrink-0 sm:pl-0">
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
            className="h-7 cursor-pointer gap-1.5 text-[11px] sm:h-8 sm:text-xs"
          >
            <RefreshCw
              className={cn('h-3 w-3 sm:h-3.5 sm:w-3.5', busy && 'animate-spin')}
            />
            Resend
          </Button>
        )}
      </div>
    </div>
  );
}
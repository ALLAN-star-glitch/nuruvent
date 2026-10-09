'use client';

import { useMemo, useState } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Home,
  Building2,
  Plus,
  LayoutDashboard,
  Check,
  UserPlus,
  Settings,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useGetUserTeamsQuery } from '@/lib/store/api/teamsApi';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';

interface TeamsNavItemProps {
  accountId?: string;
  /** Controlled by the parent if desired. Falls back to internal state. */
  isExpanded?: boolean;
  onToggle?: () => void;
  /** Called to close the drawer before navigating. */
  onNavigate?: (href: string) => void;
}

export function TeamsNavItem({
  accountId,
  isExpanded,
  onToggle,
  onNavigate,
}: TeamsNavItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ accountId?: string; teamId?: string }>();
  const urlTeamId = params?.teamId ?? null;

  const [internalOpen, setInternalOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const open = isExpanded ?? internalOpen;

  const { data } = useGetUserTeamsQuery();
  const teams = useMemo(() => {
    if (!data?.teams) return [];
    if (!accountId) return data.teams;
    return data.teams.filter((t) => t.account_id === accountId);
  }, [data, accountId]);

  const toggle = () => {
    if (onToggle) onToggle();
    else setInternalOpen((v) => !v);
  };

  const go = (href: string) => {
    if (onNavigate) onNavigate(href);
    else router.push(href);
  };

  const isTeamsListActive =
    pathname === `/dashboard/${accountId}/teams` ||
    pathname.startsWith(`/dashboard/${accountId}/teams/`);

  return (
    <div>
      {/* Trigger row */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all cursor-pointer',
          isTeamsListActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20'
            : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white',
        )}
      >
        <LayoutDashboard
          className={cn(
            'h-5 w-5 shrink-0',
            isTeamsListActive
              ? 'text-primary'
              : 'text-gray-400 dark:text-gray-500',
          )}
        />
        <span className="flex-1">Teams</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Expanded list */}
      {open && (
        <div className="mt-0.5 ml-4 space-y-0.5 border-l border-gray-200 pl-2 dark:border-[#3C4043]">
          {teams.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
              No teams yet
            </p>
          ) : (
            teams.map((team) => {
              const isActive = team.id === urlTeamId;
              const Icon = team.type === 'personal' ? Home : Building2;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() =>
                    go(`/dashboard/${team.account_id}/${team.id}`)
                  }
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive
                        ? 'text-primary'
                        : 'text-gray-400 dark:text-gray-500',
                    )}
                  />
                  <span className="truncate flex-1">
                    {team.display_name || team.name}
                  </span>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })
          )}

          {/* Actions */}
          {accountId && (
            <div className="mt-1 pt-1 border-t border-gray-200/60 space-y-0.5 dark:border-[#3C4043]/60">
              {/* Team settings — only when inside a team */}
              {urlTeamId && (
                <button
                  type="button"
                  onClick={() =>
                    go(`/dashboard/${accountId}/${urlTeamId}/settings`)
                  }
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <span>Team settings</span>
                </button>
              )}

              {/* Invite member — only when inside a team */}
              {urlTeamId && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      // Parent handles drawer close
                    }
                    setInviteOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <span>Invite member</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => go(`/dashboard/${accountId}/teams/new`)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white"
              >
                <Plus className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <span>New team</span>
              </button>
              <button
                type="button"
                onClick={() => go(`/dashboard/${accountId}/teams`)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <span>Manage teams</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invite dialog — rendered inside the drawer, portals to body */}
      {urlTeamId && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          teamId={urlTeamId}
        />
      )}
    </div>
  );
}
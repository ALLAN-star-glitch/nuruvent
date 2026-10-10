// components/team/InviteMemberDialog.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Loader2,
  Mail,
  Send,
  Shield,
} from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useInviteMemberMutation } from '@/lib/store/api/teamsApi';

// ============================================================
// ASSIGNABLE ROLES
// ============================================================
//
// Roles are account-scoped. Trainers may only invite learners;
// account admins may invite any of the three.

const ALL_ROLES = [
  {
    value: 'account_admin',
    label: 'Admin',
    hint: 'Full access to teams, members, events, and billing.',
    icon: Shield,
    invitableBy: ['account_admin'],
  },
  {
    value: 'trainer',
    label: 'Trainer',
    hint: 'Can create and run events; cannot manage members.',
    icon: GraduationCap,
    invitableBy: ['account_admin'],
  },
  {
    value: 'learner',
    label: 'Learner',
    hint: 'Can view events, register, and access their own certificates.',
    icon: BookOpen,
    invitableBy: ['account_admin', 'trainer'],
  },
] as const;

type AssignableRole = (typeof ALL_ROLES)[number]['value'];

// ============================================================
// PROPS
// ============================================================

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;

  /**
   * The current user's role in the account. When provided, the role
   * picker filters to the roles the caller is allowed to grant.
   */
  currentUserRole?: string | null;

  onInvited?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function InviteMemberDialog({
  open,
  onOpenChange,
  teamId,
  currentUserRole,
  onInvited,
}: InviteMemberDialogProps) {
  // Roles the current user is allowed to grant.
  const assignableRoles = useMemo(() => {
    if (!currentUserRole) return ALL_ROLES;
    return ALL_ROLES.filter((r) =>
      (r.invitableBy as readonly string[]).includes(currentUserRole),
    );
  }, [currentUserRole]);

  // Default selection: prefer trainer, otherwise the first assignable
  // role. For a trainer caller that's learner; for an admin it's trainer.
  const defaultRole: AssignableRole =
    assignableRoles.find((r) => r.value === 'trainer')?.value ??
    assignableRoles[0]?.value ??
    'learner';

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AssignableRole>(defaultRole);

  const [invite, { isLoading }] = useInviteMemberMutation();

  // Reset when the dialog opens/closes, and re-derive the default role
  // in case the caller's role has changed.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail('');
      setRole(defaultRole);
    } else {
      setRole(defaultRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Enter a valid email address');
      return;
    }

    try {
      await invite({
        teamId,
        data: { email: trimmed, role },
      }).unwrap();
      toast.success('Invitation sent', {
        description: `We emailed ${trimmed}.`,
      });
      onInvited?.();
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to send invitation';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            Invite a member
          </DialogTitle>
          <DialogDescription>
            We&apos;ll email them a link. They can accept it with or without
            an existing Nuruvent account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="grid gap-2">
              {assignableRoles.map((r) => {
                const Icon = r.icon;
                const selected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer',
                      selected
                        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:bg-accent',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          selected ? 'text-primary' : 'text-foreground',
                        )}
                      >
                        {r.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Roles apply across the whole account, not just this team.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// app/(dashboard)/dashboard/[accountId]/teams/new/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Home,
  Info,
  Loader2,
  Sparkles,
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
import {
  useCreatePersonalTeamMutation,
  useCreateInstitutionTeamMutation,
} from '@/lib/store/api/teamsApi';
import {
  useGetMyAccountsQuery,
  useGetMyMembershipQuery,
} from '@/lib/store/api/accountsApi';
import { cn } from '@/lib/utils';

// ============================================================
// PAGE
// ============================================================

export default function NewTeamPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  // Caller's role in this account. Self-service endpoint — works for
  // every role.
  const { data: myMembership, isLoading: membershipLoading } =
    useGetMyMembershipQuery(accountId, { skip: !accountId });
  const isAdmin = myMembership?.role === 'account_admin';

  // Account is used only for the breadcrumb. Read it from the caller's
  // own accounts (self-service) rather than fetching account detail,
  // which is admin-only on the backend.
  const { data: myAccounts } = useGetMyAccountsQuery();
  const account = myAccounts?.find((a) => a.id === accountId);

  const [mode, setMode] = useState<'personal' | 'institution'>('personal');

  const [personalName, setPersonalName] = useState('');

  const [instName, setInstName] = useState('');
  const [instDisplayName, setInstDisplayName] = useState('');

  const [createPersonal, { isLoading: creatingPersonal }] =
    useCreatePersonalTeamMutation();
  const [createInstitution, { isLoading: creatingInstitution }] =
    useCreateInstitutionTeamMutation();

  const isSubmitting = creatingPersonal || creatingInstitution;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let created;

      if (mode === 'personal') {
        created = await createPersonal({
          accountId,
          data: { name: personalName.trim() || 'Personal Team' },
        }).unwrap();
      } else {
        if (!instName.trim()) {
          toast.error('Name is required');
          return;
        }
        created = await createInstitution({
          accountId,
          data: {
            name: instName.trim(),
            display_name: instDisplayName.trim() || instName.trim(),
            slug: instName
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
          },
        }).unwrap();
      }

      toast.success('Team created');
      router.push(`/dashboard/${accountId}/${created.id}`);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create team';
      toast.error(message);
    }
  };

  // ---- Loading state ----
  if (membershipLoading || !account) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---- Non-admins cannot create teams ----
  // Only `account_admin` holds `team:create`. Trainers and learners
  // land here only by direct URL (the nav hides the entry), but we
  // render a clear denial rather than letting them hit a 403 on submit.
  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Admin access required
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Only account admins can create teams. Ask an admin of{' '}
            <strong>{account.display_name || account.name}</strong> to create
            one for you.
          </p>
          <Button
            className="cursor-pointer"
            onClick={() => router.push(`/dashboard/${accountId}`)}
          >
            Back to account
          </Button>
        </div>
      </div>
    );
  }

  const accountName = account.display_name || account.name;

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4 px-4 pb-8 sm:space-y-6 sm:px-6">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="flex min-w-0 items-start gap-2 sm:gap-3">
        <Link
          href={`/dashboard/${accountId}`}
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
          aria-label="Back to account"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:gap-2 sm:text-[11px]">
            <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span className="truncate">{accountName}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
            Create a team
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Teams are where you organise events and manage attendees.
          </p>
        </div>
      </div>

      {/* ============================================================
          MODE PICKER (two-card selector, not tabs)
      ============================================================ */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ModeCard
          selected={mode === 'personal'}
          onClick={() => setMode('personal')}
          icon={Home}
          title="Personal"
          description="Just you. Ideal for solo trainers and freelancers."
        />
        <ModeCard
          selected={mode === 'institution'}
          onClick={() => setMode('institution')}
          icon={Building2}
          title="Institution"
          description="Shared with your team. Best for companies, NGOs, and schools."
        />
      </div>

      {/* ============================================================
          FORM
      ============================================================ */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="px-4 pb-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-sm font-semibold sm:text-base">
            {mode === 'personal'
              ? 'Personal team details'
              : 'Institution team details'}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {mode === 'personal'
              ? 'Give your personal team a name. You can change it later.'
              : 'Name your institution team. It will be visible to everyone in the account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {mode === 'personal' ? (
              <div className="space-y-2">
                <Label
                  htmlFor="personal-team-name"
                  className="text-xs font-medium sm:text-sm"
                >
                  Team name
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="personal-team-name"
                  placeholder="e.g. My Personal Team"
                  value={personalName}
                  onChange={(e) => setPersonalName(e.target.value)}
                  className="h-10 w-full rounded-xl text-sm sm:h-11"
                />
                <HelperText icon={Info}>
                  Leave blank and we&apos;ll generate a name for you.
                </HelperText>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="inst-team-name"
                    className="text-xs font-medium sm:text-sm"
                  >
                    Team name
                  </Label>
                  <Input
                    id="inst-team-name"
                    placeholder="e.g. Marketing Events"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    className="h-10 w-full rounded-xl text-sm sm:h-11"
                    required
                  />
                  <HelperText icon={Info}>
                    Used internally to identify this team.
                  </HelperText>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="inst-team-display"
                    className="text-xs font-medium sm:text-sm"
                  >
                    Display name
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="inst-team-display"
                    placeholder="e.g. Acme Events Team"
                    value={instDisplayName}
                    onChange={(e) => setInstDisplayName(e.target.value)}
                    className="h-10 w-full rounded-xl text-sm sm:h-11"
                  />
                  <HelperText icon={Sparkles}>
                    Shown publicly on event pages. Defaults to the team name.
                  </HelperText>
                </div>
              </>
            )}

            {/* Actions: stacked full-width on mobile, right-aligned on desktop */}
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end sm:pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full cursor-pointer rounded-xl sm:h-10 sm:w-auto"
                onClick={() => router.push(`/dashboard/${accountId}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full cursor-pointer gap-2 rounded-xl sm:h-10 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create {mode === 'personal' ? 'personal' : 'institution'}{' '}
                    team
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Helper card */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              What happens next?
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              You&apos;ll land on your new team&apos;s dashboard, where you can
              create events, invite members, and start tracking attendance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ModeCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Home;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex min-w-0 flex-col items-start gap-3 rounded-2xl border p-3.5 text-left transition-all sm:p-4',
        'cursor-pointer',
        selected
          ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30 hover:bg-accent/40',
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
            selected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground/70 group-hover:bg-accent',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            selected
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/30 bg-transparent',
          )}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-semibold',
            selected ? 'text-primary' : 'text-foreground',
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function HelperText({
  icon: Icon,
  children,
}: {
  icon: typeof Info;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
      <Icon className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
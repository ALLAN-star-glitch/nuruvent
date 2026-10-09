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
import { useGetAccountByIdQuery } from '@/lib/store/api/accountsApi';
import { cn } from '@/lib/utils';

// ============================================================
// PAGE
// ============================================================

export default function NewTeamPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const { data: account, isLoading: accountLoading } = useGetAccountByIdQuery(
    accountId,
    { skip: !accountId },
  );

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
  if (accountLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---- Account not found ----
  if (!account) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Account not found
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We couldn&apos;t load this account. It may have been deleted or
            you don&apos;t have access.
          </p>
          <Button
            className="cursor-pointer"
            onClick={() => router.push('/accounts')}
          >
            Go to Accounts
          </Button>
        </div>
      </div>
    );
  }

  const accountName = account.display_name || account.name;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-32 sm:px-6 sm:pb-8">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="flex items-start gap-3">
        <Link
          href={`/dashboard/${accountId}`}
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to account"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span className="truncate">{accountName}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create a team
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            {mode === 'personal' ? 'Personal team details' : 'Institution team details'}
          </CardTitle>
          <CardDescription>
            {mode === 'personal'
              ? 'Give your personal team a name. You can change it later.'
              : 'Name your institution team. It will be visible to everyone in the account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'personal' ? (
              <div className="space-y-2">
                <Label htmlFor="personal-team-name" className="text-sm font-medium">
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
                  className="h-11 rounded-xl"
                />
                <HelperText icon={Info}>
                  Leave blank and we&apos;ll generate a name for you.
                </HelperText>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inst-team-name" className="text-sm font-medium">
                    Team name
                  </Label>
                  <Input
                    id="inst-team-name"
                    placeholder="e.g. Marketing Events"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                  <HelperText icon={Info}>
                    Used internally to identify this team.
                  </HelperText>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inst-team-display" className="text-sm font-medium">
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
                    className="h-11 rounded-xl"
                  />
                  <HelperText icon={Sparkles}>
                    Shown publicly on event pages. Defaults to the team name.
                  </HelperText>
                </div>
              </>
            )}

            {/* Desktop-only inline actions */}
            <div className="hidden items-center justify-end gap-2 pt-2 sm:flex">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => router.push(`/dashboard/${accountId}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create {mode === 'personal' ? 'personal' : 'institution'} team
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Helper card */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              What happens next?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll land on your new team&apos;s dashboard, where you can
              create events, invite members, and start tracking attendance.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          MOBILE STICKY ACTION BAR
      ============================================================ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 cursor-pointer rounded-xl"
            onClick={() => router.push(`/dashboard/${accountId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-11 flex-1 cursor-pointer rounded-xl gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create team
              </>
            )}
          </Button>
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
      className={cn(
        'group relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all',
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
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <Icon className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
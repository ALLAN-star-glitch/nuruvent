// app/(dashboard)/dashboard/[accountId]/settings/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  Plug,
  Settings2,
  Trash2,
  Upload,
  Video,
  X,
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  useDeleteAccountMutation,
  useGetAccountByIdQuery,
  useUpdateAccountMutation,
  useUploadAccountLogoMutation,
  useDeleteAccountLogoMutation,
  useGetMyAccountsQuery,
  useGetMyMembershipQuery,
} from '@/lib/store/api/accountsApi';
import {
  PlatformPickerModal,
  PLATFORMS,
} from '@/components/events/video/PlatformPickerModal';
import { useVideoConnection } from '@/components/events/video/useVideoConnection';
import type { VideoPlatform } from '@/lib/types/events';
import { cn } from '@/lib/utils';

// ============================================================
// NAV SECTIONS
// ============================================================

type SettingsSection = 'general' | 'video-platforms' | 'status' | 'danger';

const SETTINGS_SECTIONS: Array<{
  key: SettingsSection;
  label: string;
  hint: string;
  icon: typeof Settings2;
  danger?: boolean;
}> = [
  {
    key: 'general',
    label: 'General',
    hint: 'Name, logo, contact',
    icon: Settings2,
  },
  {
    key: 'video-platforms',
    label: 'Video Platforms',
    hint: 'Zoom, Google Meet',
    icon: Video,
  },
  {
    key: 'status',
    label: 'Status',
    hint: 'Read-only information',
    icon: Info,
  },
  {
    key: 'danger',
    label: 'Danger Zone',
    hint: 'Irreversible actions',
    icon: Trash2,
    danger: true,
  },
];

// Legacy URL aliases — keeps old bookmarks / links working.
const SECTION_ALIASES: Record<string, SettingsSection> = {
  integrations: 'video-platforms',
};

// ============================================================
// HELPERS
// ============================================================

function getInitials(name: string): string {
  if (!name) return 'A';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isValidSection(value: string | null): value is SettingsSection {
  if (!value) return false;
  return SETTINGS_SECTIONS.some((s) => s.key === value);
}

function normalizeSection(value: string | null): SettingsSection {
  if (!value) return 'general';
  const aliased = SECTION_ALIASES[value];
  if (aliased) return aliased;
  return isValidSection(value) ? value : 'general';
}

// ============================================================
// PAGE
// ============================================================

export default function AccountSettingsPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string }>();
  const searchParams = useSearchParams();
  const accountId = params.accountId;

  // Caller's role in this account. Self-service endpoint — works for
  // every role.
  const { data: myMembership, isLoading: membershipLoading } =
    useGetMyMembershipQuery(accountId, { skip: !accountId });

  const isAdmin = myMembership?.role === 'account_admin';

  // The account detail fetch requires `account:read`, which only admins
  // hold. The whole page is admin-only anyway, so gate the query on the
  // same condition.
  const { data: account, isLoading: accountLoading } = useGetAccountByIdQuery(
    accountId,
    { skip: !accountId || !isAdmin },
  );

  // Fall back to the accounts list (self-service) so we can render the
  // "not allowed" state with the account's name.
  const { data: accounts } = useGetMyAccountsQuery();
  const fallbackAccount = accounts?.find((a) => a.id === accountId);

  const [updateAccount, { isLoading: saving }] = useUpdateAccountMutation();
  const [uploadLogo, { isLoading: uploadingLogo }] =
    useUploadAccountLogoMutation();
  const [deleteLogo] = useDeleteAccountLogoMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  // Read the ?tab query param to allow deep-linking to a specific section.
  const initialSection = useMemo<SettingsSection>(
    () => normalizeSection(searchParams.get('tab')),
    [searchParams],
  );

  const [section, setSection] = useState<SettingsSection>(initialSection);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Sync state when the URL changes (e.g., arriving from the dashboard
  // or from an OAuth return).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSection(initialSection);
  }, [initialSection]);

  const [form, setForm] = useState({
    name: '',
    display_name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    if (!account) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: account.name ?? '',
      display_name: account.display_name ?? '',
      email: account.email ?? '',
      phone: account.phone ?? '',
      website: account.website ?? '',
      description: account.description ?? '',
      address: account.address ?? '',
      city: account.city ?? '',
      country: account.country ?? '',
    });
  }, [account]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (key: SettingsSection) => {
    setSection(key);
    // Update the URL so the state is shareable and survives refresh.
    const url = new URL(window.location.href);
    if (key === 'general') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', key);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleSaveGeneral = async () => {
    try {
      await updateAccount({
        id: accountId,
        data: {
          name: form.name.trim(),
          display_name: form.display_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
        },
      }).unwrap();
      toast.success('Account updated');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update account';
      toast.error(message);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadLogo({ id: accountId, file }).unwrap();
      toast.success('Logo updated');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      e.target.value = '';
    }
  };

  const handleLogoRemove = async () => {
    try {
      await deleteLogo(accountId).unwrap();
      toast.success('Logo removed');
    } catch {
      toast.error('Failed to remove logo');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(accountId).unwrap();
      toast.success('Account deleted');
      router.push('/accounts');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  if (membershipLoading || (accountLoading && isAdmin)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full py-16">
        <div className="mx-auto max-w-sm px-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Admin access required
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only account admins can manage this account&apos;s settings.
            {fallbackAccount
              ? ` You're a member of ${fallbackAccount.display_name || fallbackAccount.name}.`
              : ''}
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

  if (!account) {
    return (
      <div className="w-full py-16">
        <div className="mx-auto max-w-sm px-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Account not found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been deleted or you don&apos;t have access.
          </p>
          <Button
            className="mt-6 cursor-pointer"
            onClick={() => router.push('/accounts')}
          >
            Go to Accounts
          </Button>
        </div>
      </div>
    );
  }

  const personal = account.type.includes('personal');

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      {/* HEADER */}
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
            <span className="truncate">
              {account.display_name || account.name}
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              Account Settings
            </h1>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px]',
                personal
                  ? 'border-blue-200 text-blue-600 bg-blue-50/50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-950/30'
                  : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:border-indigo-900 dark:text-indigo-400 dark:bg-indigo-950/30',
              )}
            >
              {personal ? 'Personal' : 'Institution'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your account&apos;s identity, contact, and preferences.
          </p>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="min-w-0 lg:sticky lg:top-6 lg:h-fit lg:self-start">
          {/* Mobile: horizontal scrollable pill tabs */}
          <div
            className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-1 lg:hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <nav className="flex w-max gap-1.5">
              {SETTINGS_SECTIONS.map((s) => {
                const isActive = section === s.key;
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleSectionChange(s.key)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                      isActive
                        ? s.danger
                          ? 'border-destructive/40 bg-destructive/10 text-destructive'
                          : 'border-primary/40 bg-primary/10 text-primary'
                        : s.danger
                          ? 'border-border text-destructive/80 hover:bg-destructive/5'
                          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop: vertical nav */}
          <nav className="hidden lg:flex lg:flex-col lg:gap-0.5">
            {SETTINGS_SECTIONS.map((s) => {
              const isActive = section === s.key;
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleSectionChange(s.key)}
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                    isActive
                      ? s.danger
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                      : s.danger
                        ? 'text-destructive/80 hover:bg-destructive/10'
                        : 'text-foreground/80 hover:bg-accent',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive && s.danger
                        ? 'text-destructive/70'
                        : 'text-muted-foreground',
                    )}
                  >
                    {s.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right panel */}
        <div className="min-w-0 max-w-full space-y-4 sm:space-y-6">
          {/* GENERAL */}
          {section === 'general' && (
            <Card className="w-full max-w-2xl border-border/70 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <CardTitle className="text-sm font-semibold sm:text-base">
                  General
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  This is how your account appears across Nuruvent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
                {/* Logo */}
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div
                    className={cn(
                      'flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-20 sm:w-20',
                      personal
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
                    )}
                  >
                    {account.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={account.logo_url}
                        alt={account.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold sm:text-2xl">
                        {getInitials(account.display_name || account.name)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Account logo
                    </p>
                    <p className="text-[11px] text-muted-foreground sm:text-xs">
                      PNG or JPG, up to 5MB. Square images look best.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="logo-upload"
                        className={cn(
                          'inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium',
                          'hover:bg-accent',
                          uploadingLogo && 'cursor-wait opacity-70',
                        )}
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {account.logo_url ? 'Replace' : 'Upload'}
                          </>
                        )}
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleLogoChange}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>

                      {account.logo_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleLogoRemove}
                          className="cursor-pointer text-destructive hover:text-destructive"
                        >
                          <X className="mr-1.5 h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="account-name"
                      className="text-xs sm:text-sm"
                    >
                      Name
                    </Label>
                    <Input
                      id="account-name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={personal ? 'Your name' : 'Organisation name'}
                      className="h-10 w-full rounded-xl text-sm sm:h-11"
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="account-display"
                      className="text-xs sm:text-sm"
                    >
                      Display name
                    </Label>
                    <Input
                      id="account-display"
                      value={form.display_name}
                      onChange={(e) =>
                        handleChange('display_name', e.target.value)
                      }
                      placeholder="Shown publicly"
                      className="h-10 w-full rounded-xl text-sm sm:h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="account-email"
                      className="text-xs sm:text-sm"
                    >
                      Contact email
                    </Label>
                    <Input
                      id="account-email"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="h-10 w-full rounded-xl text-sm sm:h-11"
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="account-phone"
                      className="text-xs sm:text-sm"
                    >
                      Contact phone
                    </Label>
                    <Input
                      id="account-phone"
                      type="text"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+254 ..."
                      className="h-10 w-full rounded-xl text-sm sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="account-website"
                    className="text-xs sm:text-sm"
                  >
                    Website
                  </Label>
                  <Input
                    id="account-website"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="h-10 w-full rounded-xl text-sm sm:h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="account-description"
                    className="text-xs sm:text-sm"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="account-description"
                    value={form.description}
                    onChange={(e) =>
                      handleChange('description', e.target.value)
                    }
                    placeholder="A short description of this account."
                    rows={3}
                    className="w-full text-sm"
                  />
                </div>

                <Separator />

                <div className="space-y-2.5 sm:space-y-3">
                  <Label className="text-xs font-medium sm:text-sm">
                    Address
                  </Label>
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Street address"
                    className="h-10 w-full rounded-xl text-sm sm:h-11"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Input
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="City"
                      className="h-10 w-full rounded-xl text-sm sm:h-11"
                    />
                    <Input
                      value={form.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="Country"
                      className="h-10 w-full rounded-xl text-sm sm:h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1 sm:pt-2">
                  <Button
                    onClick={handleSaveGeneral}
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

          {/* VIDEO PLATFORMS */}
          {section === 'video-platforms' && (
            <VideoPlatformsPanel accountId={accountId} />
          )}

          {/* STATUS */}
          {section === 'status' && (
            <Card className="w-full max-w-2xl border-border/70 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <CardTitle className="text-sm font-semibold sm:text-base">
                  Status
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Read-only information about this account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                <StatusRow label="Account status">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      account.status === 'active'
                        ? 'border-green-200 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-950/30'
                        : 'border-amber-200 text-amber-700 bg-amber-50/50 dark:border-amber-900 dark:text-amber-400 dark:bg-amber-950/30',
                    )}
                  >
                    {account.status}
                  </Badge>
                </StatusRow>
                <StatusRow label="Account ID">
                  <code className="block break-all rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:text-xs">
                    {account.id}
                  </code>
                </StatusRow>
                <StatusRow label="Slug">
                  <code className="block break-all rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:text-xs">
                    {account.slug}
                  </code>
                </StatusRow>
                <StatusRow label="Created">
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {new Date(account.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </StatusRow>
              </CardContent>
            </Card>
          )}

          {/* DANGER ZONE */}
          {section === 'danger' && (
            <Card className="w-full max-w-2xl border-destructive/30 shadow-sm">
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
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Delete this account
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                      Permanently deletes the account, its teams, events,
                      attendees, payments, and all associated data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteOpen(true)}
                    className="w-full shrink-0 cursor-pointer gap-2 sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>{account.display_name || account.name}</strong> and
              everything inside it. This action cannot be undone.
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
                'Delete account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatusRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
        {label}
      </span>
      <div className="min-w-0 sm:text-right">{children}</div>
    </div>
  );
}

// ============================================================
// VIDEO PLATFORMS PANEL
// ============================================================

function VideoPlatformsPanel({ accountId }: { accountId: string }) {
  const video = useVideoConnection();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickedPlatform, setPickedPlatform] = useState<VideoPlatform | null>(
    null,
  );

  const openPickerForAll = () => {
    setPickedPlatform(null);
    setIsPickerOpen(true);
  };

  const openPickerForPlatform = (platform: VideoPlatform) => {
    setPickedPlatform(platform);
    setIsPickerOpen(true);
  };

  const anyConnection = PLATFORMS.some(
    (meta) => meta.available && !!video.getConnection(meta.platform),
  );

  return (
    <>
      <Card className="w-full max-w-2xl border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <Video className="h-4 w-4 shrink-0 text-primary" />
              Video Platforms
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Connect Zoom or Google Meet to automatically create meeting
              links and track attendance for your events.
            </CardDescription>
          </div>
          {anyConnection && (
            <Badge
              variant="outline"
              className="w-fit shrink-0 border-primary/30 bg-primary/5 text-primary"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pb-4 sm:space-y-3 sm:px-6 sm:pb-6">
          {PLATFORMS.map((meta) => {
            const connection = video.getConnection(meta.platform);
            const isConnected = !!connection;

            return (
              <button
                key={meta.platform}
                type="button"
                disabled={!meta.available}
                onClick={() =>
                  meta.available && openPickerForPlatform(meta.platform)
                }
                className={cn(
                  'flex w-full min-w-0 items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all sm:gap-3 sm:p-3',
                  isConnected
                    ? 'group cursor-pointer border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10'
                    : meta.available
                      ? 'group cursor-pointer border-border hover:border-primary/40 hover:bg-primary/5'
                      : 'cursor-not-allowed border-border opacity-70',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg p-1.5 sm:h-12 sm:w-12 sm:p-2',
                    'border border-border bg-background',
                    meta.available && 'group-hover:border-primary/30',
                  )}
                >
                  <Image
                    src={meta.logo}
                    alt={`${meta.label} logo`}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {meta.label}
                    </p>
                    {isConnected && (
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 text-[10px] text-primary"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {!meta.available && !isConnected && (
                      <Badge
                        variant="outline"
                        className="border-border bg-muted text-[10px] text-muted-foreground"
                      >
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  {isConnected && connection ? (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                      Connected as{' '}
                      <span className="font-medium text-foreground">
                        {connection.external_email}
                      </span>
                      <span className="hidden sm:inline">
                        {' '}
                        ·{' '}
                        {new Date(connection.connected_at).toLocaleDateString()}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground sm:line-clamp-1 sm:text-xs">
                      {meta.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {isConnected ? (
                    <span className="text-xs font-semibold text-primary">
                      Manage
                    </span>
                  ) : meta.available ? (
                    <span className="text-xs font-semibold text-primary">
                      Connect
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Soon</span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="flex justify-end pt-1 sm:pt-2">
            <Button
              onClick={openPickerForAll}
              variant="outline"
              size="sm"
              className="w-full cursor-pointer sm:w-auto"
            >
              <Plug className="mr-2 h-4 w-4" />
              Manage platforms
            </Button>
          </div>
        </CardContent>
      </Card>

      <PlatformPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        returnUrl={`/dashboard/${accountId}/settings?tab=video-platforms`}
        initialPlatform={pickedPlatform}
      />
    </>
  );
}
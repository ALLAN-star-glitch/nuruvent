// app/(dashboard)/dashboard/[accountId]/settings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Home,
  Loader2,
  Trash2,
  Upload,
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
} from '@/lib/store/api/accountsApi';
import { cn } from '@/lib/utils';

// ============================================================
// NAV SECTIONS
// ============================================================

type SettingsSection = 'general' | 'status' | 'danger';

const SETTINGS_SECTIONS: Array<{
  key: SettingsSection;
  label: string;
  hint: string;
}> = [
  { key: 'general', label: 'General', hint: 'Name, logo, contact' },
  { key: 'status', label: 'Status', hint: 'Read-only information' },
  { key: 'danger', label: 'Danger Zone', hint: 'Irreversible actions' },
];

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

// ============================================================
// PAGE
// ============================================================

export default function AccountSettingsPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const { data: account, isLoading: accountLoading } = useGetAccountByIdQuery(
    accountId,
    { skip: !accountId },
  );

  const [updateAccount, { isLoading: saving }] = useUpdateAccountMutation();
  const [uploadLogo, { isLoading: uploadingLogo }] =
    useUploadAccountLogoMutation();
  const [deleteLogo] = useDeleteAccountLogoMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  const [section, setSection] = useState<SettingsSection>('general');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  if (accountLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="w-full py-16">
        <div className="mx-auto max-w-sm text-center">
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
    <div className="w-full space-y-6">
      {/* HEADER */}
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
            {account.display_name || account.name}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account&apos;s identity, contact, and preferences.
          </p>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="lg:sticky lg:top-6 lg:h-fit lg:self-start">
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {SETTINGS_SECTIONS.map((s) => {
              const isActive = section === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSection(s.key)}
                  className={cn(
                    'flex shrink-0 flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap lg:w-full',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/80 hover:bg-accent',
                  )}
                >
                  <span
                    className={cn('text-sm', isActive ? 'font-medium' : '')}
                  >
                    {s.label}
                  </span>
                  <span className="hidden text-xs text-muted-foreground lg:block">
                    {s.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right panel — cards cap at max-w-2xl */}
        <div className="min-w-0 space-y-6">
          {/* GENERAL */}
          {section === 'general' && (
            <Card className="border-border/70 shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  General
                </CardTitle>
                <CardDescription>
                  This is how your account appears across Nuruvent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div
                    className={cn(
                      'flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
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
                      <span className="text-2xl font-semibold">
                        {getInitials(account.display_name || account.name)}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Account logo
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                          <X className="h-4 w-4 mr-1.5" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Name row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Name</Label>
                    <Input
                      id="account-name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={personal ? 'Your name' : 'Organisation name'}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-display">Display name</Label>
                    <Input
                      id="account-display"
                      value={form.display_name}
                      onChange={(e) =>
                        handleChange('display_name', e.target.value)
                      }
                      placeholder="Shown publicly"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="account-email">Contact email</Label>
                    <Input
                      id="account-email"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-phone">Contact phone</Label>
                    <Input
                      id="account-phone"
                      type="text"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+254 ..."
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-website">Website</Label>
                  <Input
                    id="account-website"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-description">Description</Label>
                  <Textarea
                    id="account-description"
                    value={form.description}
                    onChange={(e) =>
                      handleChange('description', e.target.value)
                    }
                    placeholder="A short description of this account."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Street address"
                    className="h-11 rounded-xl"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="City"
                      className="h-11 rounded-xl"
                    />
                    <Input
                      value={form.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="Country"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveGeneral}
                    disabled={saving}
                    className="cursor-pointer gap-2"
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

          {/* STATUS */}
          {section === 'status' && (
            <Card className="border-border/70 shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Status
                </CardTitle>
                <CardDescription>
                  Read-only information about this account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  <code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {account.id}
                  </code>
                </StatusRow>
                <StatusRow label="Slug">
                  <code className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {account.slug}
                  </code>
                </StatusRow>
                <StatusRow label="Created">
                  <span className="text-sm text-muted-foreground">
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
            <Card className="border-destructive/30 shadow-sm max-w-2xl">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  Irreversible actions. Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Delete this account
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Permanently deletes the account, its teams, events,
                      attendees, payments, and all associated data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteOpen(true)}
                    className="shrink-0 cursor-pointer gap-2"
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
        <AlertDialogContent>
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}
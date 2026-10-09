// app/(dashboard)/profile/page.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  User as UserIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadMyAvatarMutation,
  useDeleteMyAvatarMutation,
} from '@/lib/store/api/profileApi';
import { cn } from '@/lib/utils';

// ============================================================
// NAV SECTIONS
// ============================================================

type ProfileSection = 'identity' | 'contact' | 'links' | 'verification';

const PROFILE_SECTIONS: Array<{
  key: ProfileSection;
  label: string;
  hint: string;
}> = [
  { key: 'identity', label: 'Identity', hint: 'Avatar, name, bio' },
  { key: 'contact', label: 'Contact', hint: 'Email, phone, location' },
  { key: 'links', label: 'Links', hint: 'Website and socials' },
  { key: 'verification', label: 'Verification', hint: 'Account status' },
];

// ============================================================
// HELPERS
// ============================================================

function getInitials(name: string): string {
  if (!name) return 'U';
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

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadMyAvatarMutation();
  const [deleteAvatar, { isLoading: removing }] = useDeleteMyAvatarMutation();

  const [section, setSection] = useState<ProfileSection>('identity');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    display_name: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    social_links: {} as Record<string, string>,
  });

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      display_name: profile.display_name ?? '',
      phone: profile.phone ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      website: profile.website ?? '',
      social_links: profile.social_links ?? {},
    });
  }, [profile]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));
  };

  const handleSocialRemove = (key: string) => {
    setForm((prev) => {
      const next = { ...prev.social_links };
      delete next[key];
      return { ...prev, social_links: next };
    });
  };

  const handleAddSocial = () => {
    // Prompt for the network name; value comes right after.
    const key = window.prompt(
      'Network name (e.g. twitter, linkedin, github)',
    );
    if (!key) return;
    const clean = key.trim().toLowerCase();
    if (!clean || form.social_links[clean] !== undefined) {
      toast.error('That network already exists or is invalid');
      return;
    }
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [clean]: '' },
    }));
  };

  const validateBio = (bio: string): string | null => {
    if (bio.length > 500) return 'Bio must be 500 characters or fewer';
    return null;
  };

  const validateWebsite = (website: string): string | null => {
    if (!website) return null;
    // Very light check — the backend does deeper validation.
    if (!/^https?:\/\//i.test(website)) {
      return 'Website must start with http:// or https://';
    }
    return null;
  };

  const handleSave = async () => {
    const bioError = validateBio(form.bio);
    if (bioError) {
      toast.error(bioError);
      return;
    }
    const websiteError = validateWebsite(form.website);
    if (websiteError) {
      toast.error(websiteError);
      return;
    }

    try {
      await updateProfile({
        display_name: form.display_name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        social_links: form.social_links,
      }).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update profile';
      toast.error(message);
    }
  };

  const handleAvatarSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file).unwrap();
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      e.target.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await deleteAvatar().unwrap();
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    }
  };

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full py-16">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Profile unavailable
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t load your profile. Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.name;
  const avatarBusy = uploading || removing;

  return (
    <div className="w-full space-y-6">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard"
          className="mt-0.5 shrink-0 cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Your account
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and public profile.
          </p>
        </div>
      </div>

      {/* ============================================================
          TWO-COLUMN LAYOUT
      ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:h-fit lg:self-start">
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
            {PROFILE_SECTIONS.map((s) => {
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
                  <span className={cn('text-sm', isActive ? 'font-medium' : '')}>
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

        <div className="min-w-0 space-y-6">
          {/* ============================================================
              IDENTITY
          ============================================================ */}
          {section === 'identity' && (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Identity
                </CardTitle>
                <CardDescription>
                  How you appear across Nuruvent — to yourself and to others.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-24 w-24 shrink-0">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Profile photo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG or JPG, up to 5MB. Square images look best.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarBusy}
                        className="cursor-pointer gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {profile.avatar_url ? 'Replace' : 'Upload'}
                          </>
                        )}
                      </Button>
                      {profile.avatar_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAvatarRemove}
                          disabled={avatarBusy}
                          className="cursor-pointer gap-2 text-destructive hover:text-destructive"
                        >
                          {removing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={profile.name}
                    disabled
                    className="h-11 rounded-xl bg-muted/40"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your account name cannot be changed here. Contact support
                    if you need to update it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    value={form.display_name}
                    onChange={(e) =>
                      handleChange('display_name', e.target.value)
                    }
                    placeholder="Shown publicly on events and certificates"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="A short introduction about yourself"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.bio.length} / 500 characters
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSave}
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

          {/* ============================================================
              CONTACT
          ============================================================ */}
          {section === 'contact' && (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Contact
                </CardTitle>
                <CardDescription>
                  How we reach you and where you&apos;re based.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email — read only */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={profile.email}
                      disabled
                      className="h-11 rounded-xl bg-muted/40"
                    />
                    {profile.email && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 text-[10px]',
                          'border-green-200 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-950/30',
                        )}
                      >
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Registered
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your email is your login identifier and cannot be changed
                    here. Contact support to update it.
                  </p>
                </div>

                <Separator />

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="text"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+254 ..."
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="h-11 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown on your public profile.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSave}
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

          {/* ============================================================
              LINKS
          ============================================================ */}
          {section === 'links' && (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Links</CardTitle>
                <CardDescription>
                  Your website and public profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="h-11 rounded-xl"
                  />
                </div>

                <Separator />

                {/* Social links */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Social links
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Twitter, LinkedIn, GitHub, etc.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSocial}
                      className="cursor-pointer gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add link
                    </Button>
                  </div>

                  {Object.keys(form.social_links).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                      <Globe className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No social links yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(form.social_links).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                          >
                            <div className="flex h-9 min-w-[100px] items-center rounded-md bg-muted px-2 text-xs font-medium capitalize text-muted-foreground">
                              {key}
                            </div>
                            <Input
                              value={value}
                              onChange={(e) =>
                                handleSocialChange(key, e.target.value)
                              }
                              placeholder={`https://${key}.com/yourname`}
                              className="h-9 rounded-md"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSocialRemove(key)}
                              className="h-9 w-9 shrink-0 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${key}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSave}
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

          {/* ============================================================
              VERIFICATION
          ============================================================ */}
          {section === 'verification' && (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Verification
                </CardTitle>
                <CardDescription>
                  Verified accounts build more trust with attendees and
                  partners.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <VerificationRow
                  icon={Mail}
                  label="Email"
                  verified
                  detail={profile.email}
                  badgeText="Registered"
                />
                <VerificationRow
                  icon={Phone}
                  label="Phone"
                  verified={Boolean(form.phone)}
                  detail={form.phone || 'No phone on file'}
                  badgeText={form.phone ? 'On file' : 'Missing'}
                />
                <VerificationRow
                  icon={BadgeCheck}
                  label="Identity (KYC)"
                  verified={false}
                  detail="Not submitted"
                  badgeText="Not started"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function VerificationRow({
  icon: Icon,
  label,
  verified,
  detail,
  badgeText,
}: {
  icon: typeof Mail;
  label: string;
  verified: boolean;
  detail: string;
  badgeText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            verified
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          'shrink-0 text-[10px]',
          verified
            ? 'border-green-200 text-green-700 bg-green-50/50 dark:border-green-900 dark:text-green-400 dark:bg-green-950/30'
            : 'border-border text-muted-foreground bg-muted/40',
        )}
      >
        {badgeText}
      </Badge>
    </div>
  );
}
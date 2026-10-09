// app/(dashboard)/accounts/new/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Home,
  Loader2,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCreateInstitutionAccountMutation,
  useCreatePersonalAccountMutation,
} from '@/lib/store/api/accountsApi';
import { useGetMyAccountsQuery } from '@/lib/store/api/accountsApi';
import { cn } from '@/lib/utils';

// ============================================================
// PAGE
// ============================================================

export default function NewAccountPage() {
  const router = useRouter();
  const { refetch } = useGetMyAccountsQuery();

  const [mode, setMode] = useState<'personal' | 'institution'>('personal');

  // Personal form
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');

  // Institution form
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPhone, setInstPhone] = useState('');
  const [instWebsite, setInstWebsite] = useState('');
  const [instDescription, setInstDescription] = useState('');

  const [createPersonal, { isLoading: creatingPersonal }] =
    useCreatePersonalAccountMutation();
  const [createInstitution, { isLoading: creatingInstitution }] =
    useCreateInstitutionAccountMutation();

  const isSubmitting = creatingPersonal || creatingInstitution;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let created;

      if (mode === 'personal') {
        if (!personalName.trim() || !personalEmail.trim()) {
          toast.error('Name and email are required');
          return;
        }
        created = await createPersonal({
          name: personalName.trim(),
          email: personalEmail.trim(),
          phone: personalPhone.trim() || undefined,
        }).unwrap();
      } else {
        if (!instName.trim() || !instEmail.trim()) {
          toast.error('Name and email are required');
          return;
        }
        created = await createInstitution({
          name: instName.trim(),
          email: instEmail.trim(),
          phone: instPhone.trim() || undefined,
          website: instWebsite.trim() || undefined,
          description: instDescription.trim() || undefined,
        }).unwrap();
      }

      // Refresh the accounts list so the new account shows in the switcher.
      await refetch();

      toast.success('Account created');
      router.push(`/dashboard/${created.id}`);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create account';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/accounts"
          className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up a personal or institution workspace.
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as 'personal' | 'institution')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="cursor-pointer gap-2">
            <Home className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="institution" className="cursor-pointer gap-2">
            <Building2 className="h-4 w-4" />
            Institution
          </TabsTrigger>
        </TabsList>

        {/* Personal form */}
        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Account</CardTitle>
              <CardDescription>
                For individual use. You&apos;ll be the owner and sole admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="personal-name">Name</Label>
                  <Input
                    id="personal-name"
                    placeholder="Your name or display name"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="personal-email">Email</Label>
                  <Input
                    id="personal-email"
                    type="email"
                    placeholder="you@example.com"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="personal-phone">Phone (optional)</Label>
                  <Input
                    id="personal-phone"
                    placeholder="+254 ..."
                    value={personalPhone}
                    onChange={(e) => setPersonalPhone(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'cursor-pointer gap-2',
                      isSubmitting && 'opacity-80',
                    )}
                  >
                    {isSubmitting && mode === 'personal' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Create Personal Account'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Institution form */}
        <TabsContent value="institution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Institution Account</CardTitle>
              <CardDescription>
                For companies, NGOs, institutes, or teams. You&apos;ll be the
                owner and can invite members after creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inst-name">Organisation Name</Label>
                  <Input
                    id="inst-name"
                    placeholder="Acme Events Ltd"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="inst-email">Contact Email</Label>
                    <Input
                      id="inst-email"
                      type="email"
                      placeholder="contact@example.com"
                      value={instEmail}
                      onChange={(e) => setInstEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inst-phone">Phone (optional)</Label>
                    <Input
                      id="inst-phone"
                      placeholder="+254 ..."
                      value={instPhone}
                      onChange={(e) => setInstPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-website">Website (optional)</Label>
                  <Input
                    id="inst-website"
                    type="url"
                    placeholder="https://example.com"
                    value={instWebsite}
                    onChange={(e) => setInstWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-description">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="inst-description"
                    placeholder="Short description of your organisation"
                    rows={3}
                    value={instDescription}
                    onChange={(e) => setInstDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'cursor-pointer gap-2',
                      isSubmitting && 'opacity-80',
                    )}
                  >
                    {isSubmitting && mode === 'institution' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Create Institution Account'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          You can switch between accounts at any time using the account
          switcher in the header. Each account has its own teams, events, and
          members.
        </span>
      </div>
    </div>
  );
}
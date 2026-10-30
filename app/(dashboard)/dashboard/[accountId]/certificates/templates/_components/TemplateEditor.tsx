// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateEditor.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Lock, Palette, PenLine } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateCertificateTemplateMutation,
  useUpdateCertificateTemplateMutation,
  useCreateSystemTemplateMutation,
  useUpdateSystemTemplateMutation,
} from '@/lib/store/api/certificatesApi';

import { useAppSelector } from '@/lib/store/hooks';
import { selectActiveAccount } from '@/lib/store/slices/authSlice';

import { TemplateBasicsForm } from './TemplateBasicsForm';
import { TemplateDesignForm } from './TemplateDesignForm';
import { TemplateEditorHeader } from './TemplateEditorHeader';
import { TemplatePreview } from './TemplatePreview';
import { TemplateTextForm } from './TemplateTextForm';
import { EMPTY_FORM, type TemplateFormState } from './types';
import {
  CertificateTemplate,
  CertificateTemplateDesign,
} from '@/lib/types/certificates';

interface Props {
  accountId: string;
  templateId?: string;
  initial?: CertificateTemplate;
  isAdmin?: boolean;
  forceTier?: {
    tierTemplateId: string;
    tierSlug: string;
    priceMinor: number;
  };
}

const TIER_OPTIONS = [
  { slug: 'default', label: 'Default', priceMinor: 2000 },
  { slug: 'professional', label: 'Professional', priceMinor: 4000 },
  { slug: 'premium', label: 'Premium', priceMinor: 6000 },
] as const;

type TierSlug = (typeof TIER_OPTIONS)[number]['slug'];

function priceForSlug(slug: string): number {
  const found = TIER_OPTIONS.find((t) => t.slug === slug);
  return found?.priceMinor ?? 0;
}

function tierSlugFromPrice(priceMinor: number | null | undefined): string {
  if (priceMinor === 2000) return 'default';
  if (priceMinor === 4000) return 'professional';
  if (priceMinor === 6000) return 'premium';
  return '';
}

function resolveTierSlug(
  forceTier: Props['forceTier'],
  initial: CertificateTemplate | undefined,
  isAdmin: boolean,
): string {
  const forced = (forceTier?.tierSlug ?? '').trim();
  if (forced) return forced;

  const fromInitial = ((initial as unknown as { system_slug?: string })?.system_slug ?? '').trim();
  if (fromInitial) return fromInitial;

  if (isAdmin) return '';

  const fromPrice = tierSlugFromPrice(initial?.price_minor);
  if (fromPrice) return fromPrice;

  return '';
}

export function TemplateEditor({
  accountId,
  templateId,
  initial,
  isAdmin = false,
  forceTier,
}: Props) {
  const router = useRouter();
  const isEditing = !!templateId;

  const activeAccount = useAppSelector(selectActiveAccount);
  const organizerName =
    activeAccount?.displayName || activeAccount?.name || 'Your Organization';

  const [createTemplate, { isLoading: creating }] = useCreateCertificateTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateCertificateTemplateMutation();

  const [createSystemTemplate, { isLoading: creatingSystem }] = useCreateSystemTemplateMutation();
  const [updateSystemTemplate, { isLoading: updatingSystem }] = useUpdateSystemTemplateMutation();

  const isSaving = creating || updating || creatingSystem || updatingSystem;

  const [form, setForm] = useState<TemplateFormState>(() => {
    const initialSlug = resolveTierSlug(forceTier, initial, isAdmin);
    const initialPrice =
      forceTier?.priceMinor ??
      (isAdmin ? priceForSlug(initialSlug) : initial?.price_minor ?? 0);

    return {
      ...EMPTY_FORM,
      templateId: templateId ?? crypto.randomUUID(),
      tierTemplateId: forceTier?.tierTemplateId ?? '',
      tierSlug: initialSlug,
      priceMinor: initialPrice,
    };
  });

  const hydratedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    const key = templateId ?? '__new__';
    if (hydratedForRef.current === key) return;

    const resolvedSlug = resolveTierSlug(forceTier, initial, isAdmin);

    setForm({
      name: initial.name,
      description: initial.description ?? '',
      templateId: templateId ?? crypto.randomUUID(),
      tierTemplateId:
        forceTier?.tierTemplateId ??
        ((initial as unknown as { tier_template_id?: string }).tier_template_id) ??
        '',
      tierSlug: resolvedSlug,
      priceMinor:
        forceTier?.priceMinor ??
        (isAdmin ? priceForSlug(resolvedSlug) : initial.price_minor ?? 0),
      design: { ...initial.design },
    });
    hydratedForRef.current = key;
  }, [initial, templateId, forceTier, isAdmin]);

  const setField = <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setDesignField = <K extends keyof CertificateTemplateDesign>(
    key: K,
    value: CertificateTemplateDesign[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      design: { ...prev.design, [key]: value } as CertificateTemplateDesign,
    }));
  };

  const handleTierChange = (
    tierId: string, 
    priceMinor: number, 
    slug: string,
    design?: CertificateTemplateDesign
  ) => {
    setForm((prev) => {
      if (prev.tierTemplateId === tierId && prev.tierSlug === slug) return prev;
      return {
        ...prev,
        tierTemplateId: tierId,
        tierSlug: slug,
        priceMinor,
        design: design ? { ...design } : prev.design,
      };
    });
  };

  const handleAdminTierChange = (slug: TierSlug) => {
    setForm((prev) => ({
      ...prev,
      tierSlug: slug,
      priceMinor: priceForSlug(slug),
    }));
  };

  const isTierSelected =
    isAdmin || !!forceTier || !!form.tierSlug || !!form.tierTemplateId;

  const canSave =
    form.name.trim().length > 0 &&
    (isAdmin
      ? !!form.tierSlug
      : isEditing || !!forceTier || form.tierTemplateId.length > 0);

  const handleSave = async () => {
    if (!canSave) {
      toast.error(
        form.name.trim().length === 0
          ? 'Template name is required'
          : isAdmin
            ? 'Please select a tier'
            : 'Please select a certificate tier',
      );
      return;
    }

    const adminBody = {
      name: form.name.trim(),
      description: form.description.trim(),
      design: form.design,
      system_slug: form.tierSlug,
      price_minor: form.priceMinor,
      is_system: true,
    };

    const accountBody = {
      name: form.name.trim(),
      description: form.description.trim(),
      design: form.design,
      price_minor: form.priceMinor,
      tier_template_id:
        form.tierTemplateId || forceTier?.tierTemplateId || undefined,
    };

    try {
      if (isAdmin) {
        if (isEditing && templateId) {
          await updateSystemTemplate({ templateId, body: adminBody }).unwrap();
          toast.success('System template updated');
        } else {
          await createSystemTemplate(adminBody).unwrap();
          toast.success('System template created');
        }
        router.push(`/dashboard/${accountId}/certificates/templates`);
      } else {
        if (isEditing && templateId) {
          await updateTemplate({ templateId, body: accountBody }).unwrap();
          toast.success('Template updated');
        } else {
          await createTemplate({ account_id: accountId, ...accountBody }).unwrap();
          toast.success('Template created');
        }
        router.push(`/dashboard/${accountId}/certificates/templates`);
      }
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to save template';
      toast.error(msg);
    }
  };

  const backHref = `/dashboard/${accountId}/certificates/templates`;

  const title = isAdmin
    ? isEditing
      ? 'Edit System Template'
      : 'New System Template'
    : isEditing
      ? 'Edit Template'
      : forceTier
        ? 'Customize Template'
        : 'New Template';

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Sticky header with better mobile spacing and z-index */}
      <div className="sticky top-0 z-50 -mx-4 px-4 py-3 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/40 sm:-mx-6 sm:px-6">
        <TemplateEditorHeader
          backHref={backHref}
          title={title}
          isSaving={isSaving}
          canSave={canSave}
          onSave={handleSave}
        />
      </div>

      <div className="grid gap-4 mt-2 sm:mt-4 sm:gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <h2 className="mb-3 sm:mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <PenLine className="h-4 w-4 text-primary" />
                Basics
              </h2>

              {isAdmin ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-tier-admin">
                      Tier <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.tierSlug}
                      onValueChange={(v) => handleAdminTierChange(v as TierSlug)}
                      disabled={isSaving}
                    >
                      <SelectTrigger id="tpl-tier-admin" className="cursor-pointer h-11">
                        <SelectValue placeholder="Select a tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIER_OPTIONS.map((t) => (
                          <SelectItem
                            key={t.slug}
                            value={t.slug}
                            className="cursor-pointer py-3 sm:py-2"
                          >
                            <span className="capitalize">{t.label}</span>
                            <span className="ml-2 text-muted-foreground">
                              — KES {(t.priceMinor / 100).toFixed(2)}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Price is derived from the tier: default = KES 20.00,
                      professional = KES 40.00, premium = KES 60.00.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-name">
                      Template Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tpl-name"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. Premium Certificate"
                      disabled={isSaving}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-desc">Description</Label>
                    <Textarea
                      id="tpl-desc"
                      value={form.description}
                      onChange={(e) => setField('description', e.target.value)}
                      placeholder="Optional description for organizers"
                      rows={2}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        Price
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        KES {(form.priceMinor / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Derived from the selected tier. Cannot be edited directly.
                    </p>
                  </div>
                </div>
              ) : forceTier ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-4 select-none">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tier (locked)
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-foreground capitalize">
                      {form.tierSlug || forceTier.tierSlug || 'Custom'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Price: KES {(form.priceMinor / 100).toFixed(2)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Inherited from the system template and cannot be changed.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-name">
                      Template Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tpl-name"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. My Premium Template"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-desc">Description</Label>
                    <Textarea
                      id="tpl-desc"
                      value={form.description}
                      onChange={(e) => setField('description', e.target.value)}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <TemplateBasicsForm
                  accountId={accountId}
                  form={form}
                  onChange={setField}
                  onTierChange={handleTierChange}
                  disabled={isSaving}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-border min-h-[300px]">
            <CardContent className="p-4 sm:p-5 h-full">
              {!isTierSelected ? (
                <div className="flex h-full flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Design Locked
                  </h3>
                  <p className="mt-2 max-w-sm px-4 text-sm text-muted-foreground">
                    Select a certificate tier in the Basics section above to
                    unlock the design and text editors.
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="design">
                  <TabsList className="mb-4 grid w-full grid-cols-2 h-12 sm:h-10">
                    <TabsTrigger value="design" className="cursor-pointer text-sm sm:text-xs">
                      <Palette className="mr-2 h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="text" className="cursor-pointer text-sm sm:text-xs">
                      <Eye className="mr-2 h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="design" className="mt-0">
                    <TemplateDesignForm
                      form={form}
                      onChange={setField}
                      onDesignChange={setDesignField}
                      disabled={isSaving}
                    />
                  </TabsContent>

                  <TabsContent value="text" className="mt-0">
                    <TemplateTextForm
                      form={form}
                      onDesignChange={setDesignField}
                      disabled={isSaving}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Area - now visible on mobile and stacked below the form */}
        <div className="block lg:sticky lg:top-24 lg:h-fit space-y-4">
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <h2 className="mb-3 sm:mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Eye className="h-4 w-4 text-primary" />
                Preview
              </h2>

              {!isTierSelected ? (
                <div className="flex aspect-[297/210] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 text-center">
                  <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Preview Locked
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select a tier to preview
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border/50 bg-muted/10 p-2">
                  <TemplatePreview
                    design={form.design}
                    size="md"
                    tier={isAdmin ? form.tierSlug || 'premium' : form.tierSlug}
                    sampleData={{
                      issuer_name: organizerName,
                    }}
                  />
                </div>
              )}

              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Sample data shown. Actual certificates use real event data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
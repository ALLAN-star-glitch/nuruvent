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
  useCreateCertificateTemplateMutation,
  useUpdateCertificateTemplateMutation,
  useCreateSystemTemplateMutation,
  useUpdateSystemTemplateMutation,
} from '@/lib/store/api/certificatesApi';

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
  /**
   * Used when an organizer "customizes" a system template: locks the
   * tier to the parent system template and pre-fills price.
   */
  forceTier?: {
    tierTemplateId: string;
    tierSlug: string;
    priceMinor: number;
  };
}

function tierSlugFromPrice(priceMinor: number | null | undefined): string {
  if (priceMinor === 2000) return 'default';
  if (priceMinor === 4000) return 'professional';
  if (priceMinor === 6000) return 'premium';
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

  // Account hooks
  const [createTemplate, { isLoading: creating }] = useCreateCertificateTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateCertificateTemplateMutation();

  // Admin hooks
  const [createSystemTemplate, { isLoading: creatingSystem }] = useCreateSystemTemplateMutation();
  const [updateSystemTemplate, { isLoading: updatingSystem }] = useUpdateSystemTemplateMutation();

  const isSaving = creating || updating || creatingSystem || updatingSystem;

  const [form, setForm] = useState<TemplateFormState>(() => ({
    ...EMPTY_FORM,
    templateId: templateId ?? crypto.randomUUID(),
    tierTemplateId: forceTier?.tierTemplateId ?? '',
    tierSlug: forceTier?.tierSlug ?? '',
    priceMinor: forceTier?.priceMinor ?? 0,
  }));

  const hydratedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    const key = templateId ?? '__new__';
    if (hydratedForRef.current === key) return;

    setForm({
      name: initial.name,
      description: initial.description ?? '',
      templateId: templateId ?? crypto.randomUUID(),
      tierTemplateId:
        forceTier?.tierTemplateId ??
        ((initial as unknown as { tier_template_id?: string }).tier_template_id) ??
        '',
      tierSlug: forceTier?.tierSlug ?? tierSlugFromPrice(initial.price_minor),
      priceMinor: forceTier?.priceMinor ?? initial.price_minor ?? 0,
      design: { ...initial.design },
    });
    hydratedForRef.current = key;
  }, [initial, templateId, forceTier]);

  const setField = <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setDesignField = (
    key: keyof CertificateTemplateDesign,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      design: { ...prev.design, [key]: value } as CertificateTemplateDesign,
    }));
  };

  const handleTierChange = (tierId: string, priceMinor: number, slug: string) => {
    setForm((prev) => {
      if (prev.tierTemplateId === tierId && prev.tierSlug === slug) return prev;
      
      return {
        ...prev,
        tierTemplateId: tierId,
        tierSlug: slug,
        priceMinor,
      };
    });
  };

  // Tier is selected via the dropdown, forced from the parent system
  // template (customize flow), or auto-selected for admins.
  const isTierSelected =
    isAdmin || !!forceTier || !!form.tierSlug || !!form.tierTemplateId;

  const canSave =
    form.name.trim().length > 0 &&
    (isAdmin || isEditing || !!forceTier || form.tierTemplateId.length > 0);

  const handleSave = async () => {
    if (!canSave) {
      toast.error(
        form.name.trim().length === 0
          ? 'Template name is required'
          : 'Please select a certificate tier',
      );
      return;
    }

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      design: form.design,
      price_minor: form.priceMinor,
      // Admin templates don't have a parent tier.
      // Account templates use their tier_template_id, or the forced tier
      // from the customize flow.
      tier_template_id: isAdmin
        ? undefined
        : form.tierTemplateId || forceTier?.tierTemplateId || undefined,
    };

    try {
      if (isAdmin) {
        if (isEditing && templateId) {
          await updateSystemTemplate({ templateId, body }).unwrap();
          toast.success('System template updated');
        } else {
          await createSystemTemplate(body).unwrap();
          toast.success('System template created');
        }
        router.push(`/dashboard/${accountId}/certificates/templates`);
      } else {
        if (isEditing && templateId) {
          await updateTemplate({ templateId, body }).unwrap();
          toast.success('Template updated');
        } else {
          await createTemplate({ account_id: accountId, ...body }).unwrap();
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
    <div className="space-y-6 pb-20">
      <div className="sticky top-30 z-30 -mx-4 px-4 py-3 bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/20 border-b border-border/40">
        <TemplateEditorHeader
          backHref={backHref}
          title={title}
          isSaving={isSaving}
          canSave={canSave}
          onSave={handleSave}
        />
      </div>

      <div className="grid gap-6 mt-2 sm:mt-4 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)]">
        <div className="min-w-0 space-y-6">
          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <PenLine className="h-4 w-4 text-primary" />
                Basics
              </h2>

              {isAdmin ? (
                /* Admin: custom name + price, no tier selector */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-name">
                      Template Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tpl-name"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="e.g. Premium Tier"
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
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-price">
                      Price (KES) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tpl-price"
                      type="number"
                      min="0"
                      step="1"
                      value={form.priceMinor / 100}
                      onChange={(e) =>
                        setField('priceMinor', Number(e.target.value) * 100)
                      }
                    />
                  </div>
                </div>
            ) : forceTier ? (
              <div className="space-y-4">
                {/* Locked tier — greyed out */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 select-none">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tier (locked)
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {forceTier.tierSlug || 'Custom'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Price: KES {(forceTier.priceMinor / 100).toFixed(2)}
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
                /* Normal account template: full tier picker */
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
            <CardContent className="p-5 h-full">
              {!isTierSelected ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Design Locked
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Select a certificate tier in the Basics section above to
                    unlock the design and text editors.
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="design">
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="design" className="cursor-pointer">
                      <Palette className="mr-2 h-3.5 w-3.5" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="text" className="cursor-pointer">
                      <Eye className="mr-2 h-3.5 w-3.5" />
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

        <div className="hidden lg:block">
          <div className="sticky top-60 h-fit space-y-4">
            <Card className="border-border">
              <CardContent className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Eye className="h-4 w-4 text-primary" />
                  Preview
                </h2>

                {!isTierSelected ? (
                  <div className="flex aspect-[297/210] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                    <Lock className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Preview Locked
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select a tier to preview
                    </p>
                  </div>
                ) : (
                  <TemplatePreview
                    design={form.design}
                    size="md"
                    tier={isAdmin ? 'premium' : form.tierSlug}
                  />
                )}

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Sample data shown. Actual certificates use real event data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateEditor.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Palette, PenLine } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCreateCertificateTemplateMutation,
  useListCertificateTemplatesQuery,
  useUpdateCertificateTemplateMutation,
} from '@/lib/store/api/certificatesApi';


import { TemplateBasicsForm } from './TemplateBasicsForm';
import { TemplateDesignForm } from './TemplateDesignForm';
import { TemplateEditorHeader } from './TemplateEditorHeader';
import { TemplatePreview } from './TemplatePreview';
import { TemplateTextForm } from './TemplateTextForm';
import { EMPTY_FORM, type TemplateFormState } from './types';
import { CertificateTemplate, CertificateTemplateDesign } from '@/lib/types/certificates';

interface Props {
  accountId: string;
  templateId?: string; // undefined for "new"
  initial?: CertificateTemplate; // provided by the [templateId] wrapper
}

export function TemplateEditor({ accountId, templateId, initial }: Props) {
  const router = useRouter();
  const isEditing = !!templateId;

  const [createTemplate, { isLoading: creating }] =
    useCreateCertificateTemplateMutation();
  const [updateTemplate, { isLoading: updating }] =
    useUpdateCertificateTemplateMutation();

  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM);

  // Hydrate form when editing
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description ?? '',
        priceKes:
          initial.price_minor !== null && initial.price_minor !== undefined
            ? (initial.price_minor / 100).toString()
            : '0',
        design: { ...initial.design },
      });
    }
  }, [initial]);

  const setField = <K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setDesignField = (
    key: keyof CertificateTemplateDesign,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      design: { ...prev.design, [key]: value },
    }));
  };

  const priceMinor = (() => {
    const n = Number(form.priceKes);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n * 100);
  })();

  const canSave = form.name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Template name is required');
      return;
    }

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      design: form.design,
      price_minor: priceMinor,
    };

    try {
      if (isEditing && templateId) {
        await updateTemplate({ templateId, body }).unwrap();
        toast.success('Template updated');
      } else {
        await createTemplate({ account_id: accountId, ...body }).unwrap();
        toast.success('Template created');
      }
      router.push(`/dashboard/${accountId}/certificates/templates`);
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to save template';
      toast.error(msg);
    }
  };

  const backHref = `/dashboard/${accountId}/certificates/templates`;
  const title = isEditing ? 'Edit template' : 'New template';

  return (
    <div className="space-y-6 pb-20">
      <TemplateEditorHeader
        backHref={backHref}
        title={title}
        isSaving={creating || updating}
        canSave={canSave}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form column */}
        <div className="min-w-0 space-y-6">
          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <PenLine className="h-4 w-4 text-primary" />
                Basics
              </h2>
              <TemplateBasicsForm
                form={form}
                onChange={setField}
                disabled={creating || updating}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
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
                    disabled={creating || updating}
                  />
                </TabsContent>

                <TabsContent value="text" className="mt-0">
                  <TemplateTextForm
                    form={form}
                    onDesignChange={setDesignField}
                    disabled={creating || updating}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview column */}
        <div className="sticky top-24 h-fit">
          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Eye className="h-4 w-4 text-primary" />
                Preview
              </h2>
              <TemplatePreview design={form.design} />
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
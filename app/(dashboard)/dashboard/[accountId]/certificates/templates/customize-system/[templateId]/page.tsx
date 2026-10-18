// app/(dashboard)/dashboard/[accountId]/certificates/templates/customize-system/[templateId]/page.tsx

'use client';

import { useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import {
  useListCertificateTemplatesQuery,
  useListSystemTemplatesQuery,
} from '@/lib/store/api/certificatesApi';
import { TemplateEditor } from '../../_components/TemplateEditor';

export default function CustomizeSystemTemplatePage() {
  const params = useParams<{ accountId: string; templateId: string }>();
  const { accountId, templateId } = params;
  const router = useRouter();

  // Detect platform admin: if this succeeds, the user is a super_admin.
  // If it 403s, they're an organizer → show the customize editor.
  const { isSuccess: isPlatformAdmin, isLoading: isCheckingAdmin } =
    useListSystemTemplatesQuery(undefined, {
      refetchOnMountOrArgChange: false,
    });

  useEffect(() => {
    if (isPlatformAdmin) {
      // Admins edit system templates in place
      router.replace(
        `/dashboard/${accountId}/certificates/templates/${templateId}`,
      );
    }
  }, [isPlatformAdmin, accountId, templateId, router]);

  const { data, isLoading } = useListCertificateTemplatesQuery(accountId, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: true,
  });

  const template = useMemo(
    () => data?.data?.templates.find((t) => t.id === templateId),
    [data, templateId],
  );

  if (isCheckingAdmin || (isLoading && !data)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="border-border">
          <CardContent className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Template not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Defensive: this page is only for system templates.
  if (!template.is_system) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              This template is not a system template. It cannot be customized
              via this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // The parent's tier slug comes from system_slug. It's the invariant
  // that drives the locked tier card, the design form field-locking,
  // and the backend's tier re-resolution on save.
  const parentSlug = template.system_slug ?? '';
  const parentPrice = template.price_minor ?? 0;

  return (
    <TemplateEditor
      key={`customize-${templateId}`}
      accountId={accountId}
      initial={{
        // Preserve the parent's design and text so the user starts from
        // the real template, not a blank canvas.
        ...template,
        // Clone semantics: new account template, new name, not a system
        // template, not the default.
        id: '',
        name: `${template.name} (My Copy)`,
        is_default: false,
        is_system: false,
      }}
      forceTier={{
        tierTemplateId: template.id,
        tierSlug: parentSlug,
        priceMinor: parentPrice,
      }}
    />
  );
}
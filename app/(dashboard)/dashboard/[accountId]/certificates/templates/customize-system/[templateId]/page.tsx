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

  // Detect platform admin: if this succeeds AND returns templates,
  // the user is a super_admin. A trainer may still get a 200 with
  // an empty list (depending on backend authz), so we also check the
  // length before redirecting.
  const {
    data: adminData,
    isSuccess: isPlatformAdmin,
    isLoading: isCheckingAdmin,
  } = useListSystemTemplatesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    // Only redirect if the user is a real admin AND actually got
    // templates back. Otherwise a trainer hitting this page would be
    // redirected to the admin editor, which uses the wrong mutation
    // (createSystemTemplate instead of createCertificateTemplate).
    if (isPlatformAdmin && (adminData?.data?.templates?.length ?? 0) > 0) {
      router.replace(
        `/dashboard/${accountId}/certificates/templates/${templateId}`,
      );
    }
  }, [isPlatformAdmin, adminData, accountId, templateId, router]);

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

  const parentSlug = template.system_slug ?? '';
  const parentPrice = template.price_minor ?? 0;

  return (
    <TemplateEditor
      key={`customize-${templateId}`}
      accountId={accountId}
      initial={{
        ...template,
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
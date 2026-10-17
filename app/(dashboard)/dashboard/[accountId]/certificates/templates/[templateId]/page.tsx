'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { useListCertificateTemplatesQuery } from '@/lib/store/api/certificatesApi';
import { TemplateEditor } from '../_components/TemplateEditor';

export default function EditTemplatePage() {
  const params = useParams<{ accountId: string; templateId: string }>();
  const { accountId, templateId } = params;

  const { data, isLoading } = useListCertificateTemplatesQuery(accountId, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false,
  });

  const template = useMemo(
    () => data?.data?.templates.find((t) => t.id === templateId),
    [data, templateId],
  );

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="border-border">
          <CardContent className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading template…
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

  const isAdmin = template.is_system;

  return (
    <TemplateEditor
      key={templateId}
      accountId={accountId}
      templateId={templateId}
      initial={template}
      isAdmin={isAdmin}
    />
  );
}
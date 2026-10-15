// app/(dashboard)/dashboard/[accountId]/certificates/templates/new/page.tsx

'use client';

import { useParams } from 'next/navigation';

import { TemplateEditor } from '../_components/TemplateEditor';

export default function NewTemplatePage() {
  const params = useParams<{ accountId: string }>();
  return <TemplateEditor accountId={params.accountId} />;
}
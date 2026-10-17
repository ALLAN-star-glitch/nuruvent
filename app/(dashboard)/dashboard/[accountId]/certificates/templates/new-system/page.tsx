'use client';

import { useParams } from 'next/navigation';
import { TemplateEditor } from '../_components/TemplateEditor';

export default function NewSystemTemplatePage() {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  return (
    <TemplateEditor 
      accountId={accountId} 
      isAdmin={true} 
    />
  );
}
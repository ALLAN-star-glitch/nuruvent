// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplatesGrid.tsx

'use client';


import { CertificateTemplate } from '@/lib/types/certificates';
import { TemplateCard } from './TemplateCard';

interface Props {
  templates: CertificateTemplate[];
  onEdit: (t: CertificateTemplate) => void;
  onDelete: (t: CertificateTemplate) => void;
  onSetDefault: (t: CertificateTemplate) => void;
  settingDefaultId?: string | null;
}

export function TemplatesGrid({
  templates,
  onEdit,
  onDelete,
  onSetDefault,
  settingDefaultId,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          isSettingDefault={settingDefaultId === t.id}
        />
      ))}
    </div>
  );
}
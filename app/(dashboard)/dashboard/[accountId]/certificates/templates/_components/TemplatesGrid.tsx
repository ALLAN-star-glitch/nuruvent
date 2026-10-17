// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplatesGrid.tsx

import { TemplateCard } from './TemplateCard';
import { CertificateTemplate } from '@/lib/types/certificates';

interface Props {
  templates: CertificateTemplate[];
  onEdit: (t: CertificateTemplate) => void;
  onDelete: (t: CertificateTemplate) => void;
  onSetDefault: (t: CertificateTemplate) => void;
  settingDefaultId?: string | null;
  adminMode?: boolean;
}

export function TemplatesGrid({
  templates,
  onEdit,
  onDelete,
  onSetDefault,
  settingDefaultId,
  adminMode = false,
}: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          isSettingDefault={settingDefaultId === t.id}
          adminMode={adminMode}
        />
      ))}
    </div>
  );
}
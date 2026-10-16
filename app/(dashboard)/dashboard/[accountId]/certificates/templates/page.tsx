// app/(dashboard)/dashboard/[accountId]/certificates/templates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useListCertificateTemplatesQuery,
  useSetDefaultCertificateTemplateMutation,
} from '@/lib/store/api/certificatesApi';

import { DeleteTemplateDialog } from './_components/DeleteTemplateDialog';
import { TemplateEmpty } from './_components/TemplateEmpty';
import { TemplatesGrid } from './_components/TemplatesGrid';
import { TemplatesHeader } from './_components/TemplatesHeader';
import { TemplatesSkeleton } from './_components/TemplatesSkeleton';
import { CertificateTemplate } from '@/lib/types/certificates';

type FilterTab = 'all' | 'mine' | 'system';

export default function TemplatesPage() {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;
  const router = useRouter();

  const [tab, setTab] = useState<FilterTab>('all');
  const [deleteTarget, setDeleteTarget] = useState<CertificateTemplate | null>(
    null,
  );
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useListCertificateTemplatesQuery(accountId);

  const [setDefault] = useSetDefaultCertificateTemplateMutation();

  const allTemplates = data?.data?.templates ?? [];

  const filtered = useMemo(() => {
    let list = allTemplates;
    if (tab === 'mine') list = list.filter((t) => !t.is_system);
    else if (tab === 'system') list = list.filter((t) => t.is_system);

    return [...list].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      if (a.is_system && !b.is_system) return 1;
      if (!a.is_system && b.is_system) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [allTemplates, tab]);

  const mineCount = allTemplates.filter((t) => !t.is_system).length;
  const systemCount = allTemplates.filter((t) => t.is_system).length;

  const handleEdit = (t: CertificateTemplate) => {
    if (t.is_system) return; // system templates are immutable
    router.push(`/dashboard/${accountId}/certificates/templates/${t.id}`);
  };

  const handleSetDefault = async (t: CertificateTemplate) => {
    if (t.is_system) return;
    setSettingDefaultId(t.id);
    try {
      await setDefault(t.id).unwrap();
      toast.success(`"${t.name}" is now the default template`);
      refetch();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to set default template';
      toast.error(msg);
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <TemplatesHeader
        accountId={accountId}
        isFetching={isFetching}
        onRefresh={() => refetch()}
      />

      {!isLoading && allTemplates.length > 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
              <TabButton
                active={tab === 'all'}
                onClick={() => setTab('all')}
                label="All"
                count={allTemplates.length}
              />
              <TabButton
                active={tab === 'mine'}
                onClick={() => setTab('mine')}
                label="My templates"
                count={mineCount}
              />
              <TabButton
                active={tab === 'system'}
                onClick={() => setTab('system')}
                label="System"
                count={systemCount}
              />
            </div>

            <Select value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
              <SelectTrigger className="hidden cursor-pointer sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  All templates
                </SelectItem>
                <SelectItem value="mine" className="cursor-pointer">
                  My templates
                </SelectItem>
                <SelectItem value="system" className="cursor-pointer">
                  System templates
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <TemplatesSkeleton count={6} />
      ) : filtered.length === 0 ? (
        tab === 'mine' || tab === 'all' ? (
          <TemplateEmpty accountId={accountId} />
        ) : (
          <Card className="border-border">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No system templates available.
            </CardContent>
          </Card>
        )
      ) : (
        <TemplatesGrid
          templates={filtered}
          onEdit={handleEdit}
          onDelete={(t) => {
            if (!t.is_system) setDeleteTarget(t);
          }}
          onSetDefault={handleSetDefault}
          settingDefaultId={settingDefaultId}
        />
      )}

      <DeleteTemplateDialog
        template={deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onDeleted={() => refetch()}
      />
    </div>
  );
}

// ============================================================
// TAB BUTTON
// ============================================================

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-background text-primary shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
    </button>
  );
}
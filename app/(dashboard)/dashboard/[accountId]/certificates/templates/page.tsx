// app/(dashboard)/dashboard/[accountId]/certificates/templates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
  useDeleteSystemTemplateMutation,
} from '@/lib/store/api/certificatesApi';
import { useGetMyMembershipQuery } from '@/lib/store/api/accountsApi';

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
  const [deleteTarget, setDeleteTarget] = useState<CertificateTemplate | null>(null);
  const [systemDeleteTarget, setSystemDeleteTarget] = useState<CertificateTemplate | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useListCertificateTemplatesQuery(accountId);

  // Get the current user's role in this account.
  // Account admins are also platform admins in our setup; non-admin
  // organizers (trainers/learners) will get the customize flow instead
  // of the direct edit flow.
  const { data: myMembership } = useGetMyMembershipQuery(accountId ?? '', {
    skip: !accountId,
  });
  const isAccountAdmin = myMembership?.role === 'account_admin';

  const [setDefault] = useSetDefaultCertificateTemplateMutation();
  const [deleteSystem, { isLoading: isDeletingSystem }] = useDeleteSystemTemplateMutation();

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
  if (t.is_system) {
    // Always go to customize. The customize page redirects admins to
    // the in-place edit page if they turn out to be platform admins.
    router.push(
      `/dashboard/${accountId}/certificates/templates/customize-system/${t.id}`,
    );
    return;
  }
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

  const handleDeleteSystem = async () => {
    if (!systemDeleteTarget) return;
    try {
      await deleteSystem(systemDeleteTarget.id).unwrap();
      toast.success(`"${systemDeleteTarget.name}" deleted`);
      setSystemDeleteTarget(null);
      refetch();
    } catch (err) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete system template';
      toast.error(msg);
    }
  };

  // Pass admin context down to the grid so it can render admin-only actions.
  const adminMode = isAccountAdmin && tab === 'system';

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

            <div className="flex items-center gap-2">
              {tab === 'system' && isAccountAdmin && (
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/${accountId}/certificates/templates/new-system`,
                    )
                  }
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New System Template
                </Button>
              )}

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
            </div>
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
            if (t.is_system) {
              if (adminMode) setSystemDeleteTarget(t);
            } else {
              setDeleteTarget(t);
            }
          }}
          onSetDefault={handleSetDefault}
          settingDefaultId={settingDefaultId}
          adminMode={adminMode}
        />
      )}

      {/* Existing delete dialog for account templates */}
      <DeleteTemplateDialog
        template={deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onDeleted={() => refetch()}
      />

      {/* Confirmation dialog for system template deletion (admin only) */}
      {systemDeleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isDeletingSystem && setSystemDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold">
              Delete &quot;{systemDeleteTarget.name}&quot;?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This will remove the system template from every organizer&apos;s
              tier picker. Existing certificates issued with this template
              are not affected.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSystemDeleteTarget(null)}
                disabled={isDeletingSystem}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSystem}
                disabled={isDeletingSystem}
                className="cursor-pointer"
              >
                {isDeletingSystem ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
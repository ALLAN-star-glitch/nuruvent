// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificatesGrid.tsx

'use client';

import { useState } from 'react';
import {
  Award,
  Check,
  Eye,
  MoreVertical,
  Send,
  Trash2,
  Download,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Certificate, CertificateTemplate } from '@/lib/types/certificates';

import { useAppSelector } from '@/lib/store/hooks';
import { selectActiveAccount } from '@/lib/store/slices/authSlice';

import { TemplatePreview } from '../templates/_components/TemplatePreview';

interface Props {
  certificates: Certificate[];
  templatesById: Map<string, CertificateTemplate>;
  accountId: string;
  downloadingId?: string | null;
  onSend: (c: Certificate) => void;
  onRevoke: (c: Certificate) => void;
  onDownload: (c: Certificate) => void;
  emptyState: React.ReactNode;
}

export function AccountCertificatesGrid({
  certificates,
  templatesById,
  downloadingId,
  onSend,
  onRevoke,
  onDownload,
  emptyState,
}: Props) {
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const activeAccount = useAppSelector(selectActiveAccount);

  if (certificates.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {certificates.map((cert) => {
          const template = templatesById.get(cert.template_id);
          const design = template?.design ?? {};
          const tier = template?.system_slug || (template ? 'premium' : '');
          const isActive = cert.status === 'active';
          
          const isDownloading = downloadingId === cert.id;
          
          // Use the certificate's stored issuer name, fallback to account name, then Nuruvent
          const issuerName = 
            cert.metadata?.issuer_name || 
            activeAccount?.displayName || 
            activeAccount?.name || 
            'Nuruvent';

          return (
            <Card
              key={cert.id}
              className={cn(
                'flex flex-col border-border transition-colors hover:border-primary/40',
                isActive && 'border-primary/50 ring-1 ring-primary/20',
              )}
            >
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                {/* Header: icon + badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {isActive ? (
                      <Badge
                        variant="outline"
                        className="border-primary/40 bg-primary/10 text-primary"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <ShieldAlert className="mr-1 h-3 w-3" />
                        Revoked
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Recipient Name + Email */}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-foreground">
                    {cert.recipient_name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {cert.recipient_email}
                  </p>
                </div>

                {/* Design mini-preview — clickable, opens the modal */}
                <button
                  type="button"
                  onClick={() => setPreviewCert(cert)}
                  className="group cursor-pointer rounded-md border border-border p-1 text-left transition-shadow hover:shadow-md"
                  aria-label="Preview certificate"
                >
                  {template ? (
                    <TemplatePreview
                      design={design}
                      size="sm"
                      tier={tier}
                      sampleData={{
                        recipient_name: cert.recipient_name,
                        context_title: cert.metadata?.context_title || '',
                        context_date: cert.metadata?.context_date || '',
                        context_duration: cert.metadata?.context_duration || '',
                        issuer_name: issuerName,
                      }}
                    />
                  ) : (
                    <div className="flex aspect-[297/210] w-full items-center justify-center rounded bg-muted/30 text-xs text-muted-foreground">
                      Template unavailable
                    </div>
                  )}
                </button>

                {/* Meta: Event & Date */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate pr-2">
                    {cert.metadata?.context_title || 'No event linked'}
                  </span>
                  <span className="font-medium text-foreground shrink-0">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2 pt-1 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 cursor-pointer"
                    onClick={() => onDownload(cert)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Preparing…
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-3.5 w-3.5" />
                        PDF
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setPreviewCert(cert)}
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onSend(cert)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Resend Email
                      </DropdownMenuItem>
                      {isActive && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => onRevoke(cert)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Verification code footer */}
                <p className="mt-1 text-center text-[10px] font-mono text-muted-foreground">
                  ID: {cert.verification_code}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!previewCert} onOpenChange={(open) => !open && setPreviewCert(null)}>
        <DialogContent className="max-h-[92vh] w-[min(95vw,1100px)] max-w-none overflow-y-auto p-6 sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>{previewCert?.recipient_name}&apos;s Certificate</DialogTitle>
            <DialogDescription>
              Issued on {previewCert && new Date(previewCert.issued_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 w-full">
            {previewCert && (
              <TemplatePreview
                design={templatesById.get(previewCert.template_id)?.design ?? {}}
                size="lg"
                tier={templatesById.get(previewCert.template_id)?.system_slug || 'premium'}
                sampleData={{
                  recipient_name: previewCert.recipient_name,
                  context_title: previewCert.metadata?.context_title || '',
                  context_date: previewCert.metadata?.context_date || '',
                  context_duration: previewCert.metadata?.context_duration || '',
                  issuer_name: 
                    previewCert.metadata?.issuer_name || 
                    activeAccount?.displayName || 
                    activeAccount?.name || 
                    'Nuruvent',
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
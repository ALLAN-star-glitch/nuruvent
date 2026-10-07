'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: ExportFormat | null;
  defaultName: string;
  paymentsCount: number;
  eventTitle?: string;
  filtersSummary?: string;
  isExporting: boolean;
  onExport: (format: ExportFormat, name: string) => Promise<void>;
}

export function ExportPaymentsDialog({
  open,
  onOpenChange,
  format,
  defaultName,
  paymentsCount,
  eventTitle,
  filtersSummary,
  isExporting,
  onExport,
}: Props) {
  const [reportName, setReportName] = useState(defaultName);

  // Reset when the dialog opens with a new default
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setReportName(defaultName);
  }, [open, defaultName]);

  const handleConfirm = async () => {
    if (!format) return;
    await onExport(format, reportName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Generate report
          </DialogTitle>
          <DialogDescription className="text-sm">
            Give the report a name — it becomes the file name and the PDF title.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="report-name"
              className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
            >
              Report name
            </Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. Computer Science Webinar — October"
              autoFocus
            />
          </div>

          <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payments included</span>
              <span className="font-medium tabular-nums">{paymentsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Format</span>
              <span className="font-medium uppercase">{format}</span>
            </div>
            {eventTitle && (
              <div className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-muted-foreground">Event</span>
                <span className="break-words text-right font-medium">
                  {eventTitle}
                </span>
              </div>
            )}
            {filtersSummary && (
              <div className="flex items-start justify-between gap-3 border-t border-border/60 pt-2">
                <span className="shrink-0 text-muted-foreground">Filters</span>
                <span className="break-words text-right text-xs">
                  {filtersSummary}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full cursor-pointer sm:w-auto"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isExporting || reportName.trim().length === 0}
            className="w-full cursor-pointer sm:w-auto"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download {format?.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
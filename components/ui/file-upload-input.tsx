// components/ui/file-upload-input.tsx

'use client';

import { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useUploadTemplateImageMutation,
  useDeleteTemplateImageMutation,
} from '@/lib/store/api/certificatesApi';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  templateId: string;
  locked?: boolean;
  onLockedClick?: () => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUploadInput({
  label,
  value,
  onChange,
  templateId,
  locked,
  onLockedClick,
  disabled,
  accept = 'image/*',
  maxSizeMB = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadImage] = useUploadTemplateImageMutation();
  const [deleteImage] = useDeleteTemplateImageMutation();

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Max ${maxSizeMB}MB.`);
      return;
    }

    // Instant preview
    const reader = new FileReader();
    reader.onloadend = () => setLocalPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      // Delete the old one first (best-effort, don't block)
      if (value) {
        deleteImage({ url: value }).catch(() => {
          // Ignore — orphaned files are cheap
        });
      }

      const res = await uploadImage({ templateId, file }).unwrap();
      onChange(res.data.url);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error('Upload failed. Please try again.');
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    // Instant UI feedback
    onChange('');
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = '';

    try {
      await deleteImage({ url: value }).unwrap();
      toast.success(`${label} removed`);
    } catch {
      toast.error('Failed to remove image — please try again');
      // Roll back
      onChange(value);
    }
  };

  const displayUrl = localPreview || value;
  const isBusy = isUploading;

  return (
    <div className="space-y-1.5 relative">
      <Label className="text-xs text-muted-foreground flex items-center justify-between">
        {label}
        {locked && (
          <span className="text-[10px] text-amber-600 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Locked
          </span>
        )}
      </Label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || locked || isBusy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="flex items-center gap-2">
        {displayUrl ? (
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt=""
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {isBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || locked || isBusy}
            className={cn(
              'flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors',
              !disabled && !locked && 'cursor-pointer hover:border-primary/50 hover:bg-primary/5',
              (disabled || locked) && 'cursor-not-allowed opacity-60',
            )}
          >
            {isBusy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </button>
        )}

        <div className="flex flex-1 flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || locked || isBusy}
            className="h-8 cursor-pointer justify-start text-xs"
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            {displayUrl ? 'Replace image' : 'Upload image'}
          </Button>
          {displayUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || locked || isBusy}
              className="h-8 cursor-pointer justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {locked && onLockedClick && (
        <div className="absolute inset-0 top-5 z-10 cursor-pointer" onClick={onLockedClick} />
      )}
    </div>
  );
}
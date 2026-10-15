// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/certificates/_components/IssueBatchRecipientSelector.tsx

'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectedRecipient } from '../types';



interface Props {
  autoRecipients: SelectedRecipient[];
  selectedIds: Set<string>;
  manualRecipients: SelectedRecipient[];
  attendeesLoading: boolean;
  disabled: boolean;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  onAddManual: (r: SelectedRecipient) => void;
  onRemoveManual: (id: string) => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function IssueBatchRecipientSelector({
  autoRecipients,
  selectedIds,
  manualRecipients,
  attendeesLoading,
  disabled,
  onToggleOne,
  onToggleAll,
  onAddManual,
  onRemoveManual,
}: Props) {
  const [search, setSearch] = useState('');
  const [manualOpen, setManualOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return autoRecipients;
    return autoRecipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
    );
  }, [autoRecipients, search]);

  const allSelected =
    autoRecipients.length > 0 && selectedIds.size === autoRecipients.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">
          Recipients ({selectedIds.size + manualRecipients.length} of{' '}
          {autoRecipients.length + manualRecipients.length})
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 cursor-pointer text-xs"
          onClick={onToggleAll}
          disabled={disabled || autoRecipients.length === 0}
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </Button>
      </div>

      {autoRecipients.length > 5 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
            disabled={disabled}
          />
        </div>
      )}

      <ScrollArea className="h-52 rounded-md border border-border">
        <div className="divide-y divide-border">
          {attendeesLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Loading attendees…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {autoRecipients.length === 0
                ? 'No attendees qualify for certificates.'
                : 'No matches.'}
            </div>
          ) : (
            filtered.map((r) => {
              const checked = selectedIds.has(r.attendee_id);
              return (
                <button
                  type="button"
                  key={r.attendee_id}
                  onClick={() => onToggleOne(r.attendee_id)}
                  disabled={disabled}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <Checkbox checked={checked} className="pointer-events-none" />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials(r.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.email}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {manualRecipients.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Added manually ({manualRecipients.length})
          </Label>
          <div className="space-y-1">
            {manualRecipients.map((r) => (
              <div
                key={r.attendee_id}
                className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {r.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.email}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => onRemoveManual(r.attendee_id)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full cursor-pointer"
        onClick={() => setManualOpen(true)}
        disabled={disabled}
      >
        <UserPlus className="mr-2 h-3.5 w-3.5" />
        Add recipient manually
      </Button>

      <ManualRecipientDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        existingEmails={[
          ...autoRecipients.map((r) => r.email.toLowerCase()),
          ...manualRecipients.map((r) => r.email.toLowerCase()),
        ]}
        onAdd={(r) => {
          onAddManual(r);
          toast.success(`${r.name} added`);
          setManualOpen(false);
        }}
      />
    </div>
  );
}

function ManualRecipientDialog({
  open,
  onOpenChange,
  existingEmails,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingEmails: string[];
  onAdd: (r: SelectedRecipient) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const reset = () => {
    setName('');
    setEmail('');
  };

  const handleSubmit = () => {
    const n = name.trim();
    const e = email.trim().toLowerCase();
    if (!n) {
      toast.error('Name is required');
      return;
    }
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      toast.error('A valid email is required');
      return;
    }
    if (existingEmails.includes(e)) {
      toast.error('This recipient is already on the list');
      return;
    }
    onAdd({
      attendee_id: `manual-${e}`,
      name: n,
      email: e,
      completed_at: new Date().toISOString(),
      is_host: false,
      is_auto: false,
    });
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add recipient</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSubmit}>
            Add recipient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Calendar, Users, Building2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export function MobileCreateFab() {
  const router = useRouter();
  const params = useParams<{ accountId?: string; teamId?: string }>();
  const accountId = params?.accountId;
  const teamId = params?.teamId;
  const hasTeamContext = Boolean(accountId && teamId);

  const [open, setOpen] = useState(false);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const items = [
    {
      key: 'event',
      label: 'Event',
      icon: Calendar,
      disabled: !hasTeamContext,
      href:
        accountId && teamId
          ? `/dashboard/${accountId}/${teamId}/events/new`
          : undefined,
      hint: !hasTeamContext ? 'Pick a team first' : undefined,
    },

     {
  key: 'certificate',
  label: 'Certificate',
  icon: Award,
  disabled: !hasTeamContext,
  href:
    accountId && teamId
      ? `/dashboard/${accountId}/${teamId}/certificates/create`
      : undefined,
  hint: !hasTeamContext ? 'Pick a team first' : undefined,
},
    {
      key: 'team',
      label: 'Team',
      icon: Users,
      disabled: !accountId,
      href: accountId ? `/dashboard/${accountId}/teams/new` : undefined,
      hint: !accountId ? 'Pick a workspace first' : undefined,
    },
    {
      key: 'workspace',
      label: 'Workspace',
      icon: Building2,
      disabled: false,
      href: '/accounts/new',
      hint: undefined,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Create new"
        className={cn(
          'md:hidden',
          'fixed bottom-24 right-4 z-40',
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-primary text-primary-foreground',
          'shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
          'transition-all duration-200 active:scale-95 cursor-pointer',
        )}
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="z-50 rounded-t-[24px] border-t border-border/60 bg-background/95 backdrop-blur-2xl px-0 pb-0 shadow-2xl"
          showCloseButton={false}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
          </div>

          <SheetHeader className="border-b border-border/50 px-6 py-3 text-left">
            <SheetTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground/80">
              Create New
            </SheetTitle>
          </SheetHeader>

          <div className="max-h-[70vh] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => item.href && go(item.href)}
                      disabled={item.disabled}
                      className={cn(
                        'group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-colors',
                        item.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:bg-muted/60 active:bg-muted',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-200',
                          !item.disabled && 'group-hover:scale-105',
                          item.disabled
                            ? 'text-muted-foreground/60'
                            : 'text-muted-foreground',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        {item.hint && (
                          <p className="text-[11px] text-muted-foreground">
                            {item.hint}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
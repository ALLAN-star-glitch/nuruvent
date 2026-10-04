'use client';

import { Users, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'hosting' | 'attending';

interface Props {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function SegmentedTabs({ activeTab, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Registrations view"
      className="flex flex-col sm:inline-flex sm:flex-row sm:items-stretch gap-1.5 sm:gap-1 p-1.5 rounded-2xl bg-muted/70 border border-border/60 backdrop-blur-sm shadow-sm w-full sm:w-auto"
    >
      <TabButton
        active={activeTab === 'hosting'}
        onClick={() => onChange('hosting')}
        icon={<Users className="h-4 w-4" />}
        label="For Events I'm Hosting"
        sub="Across your events"
      />
      <TabButton
        active={activeTab === 'attending'}
        onClick={() => onChange('attending')}
        icon={<Ticket className="h-4 w-4" />}
        label="For Events I'm Attending"
        sub="Yours + join links"
      />
    </div>
  );
}

function TabButton({
  active, onClick, icon, label, sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-all duration-200 cursor-pointer',
        'w-full sm:w-auto sm:min-w-[250px] text-left',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/70',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg shrink-0 transition-colors',
          active
            ? 'bg-primary-foreground/15 text-primary-foreground'
            : 'bg-muted-foreground/10 text-muted-foreground',
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-sm sm:text-[15px] leading-tight',
            active
              ? 'font-semibold text-primary-foreground'
              : 'font-medium text-foreground',
          )}
        >
          {label}
        </div>
        <div
          className={cn(
            'text-[11px] sm:text-xs leading-tight mt-0.5',
            active
              ? 'text-primary-foreground/80'
              : 'text-muted-foreground',
          )}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}
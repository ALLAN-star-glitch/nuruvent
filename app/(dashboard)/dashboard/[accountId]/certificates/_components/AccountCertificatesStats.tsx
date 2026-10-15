// app/(dashboard)/dashboard/[accountId]/certificates/_components/AccountCertificatesStats.tsx

import { Award, CheckCircle2, FileText, XCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'primary' | 'emerald' | 'sky' | 'destructive';
}

const toneClasses: Record<Stat['tone'], string> = {
  primary: 'bg-primary/10 text-primary',
  emerald:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
  destructive: 'bg-destructive/10 text-destructive',
};

export function AccountCertificatesStats({
  total,
  active,
  revoked,
  events,
}: {
  total: number;
  active: number;
  revoked: number;
  events: number;
}) {
  const stats: Stat[] = [
    { label: 'Total', value: total, icon: <FileText className="h-4 w-4" />, tone: 'primary' },
    { label: 'Active', value: active, icon: <CheckCircle2 className="h-4 w-4" />, tone: 'emerald' },
    { label: 'Revoked', value: revoked, icon: <XCircle className="h-4 w-4" />, tone: 'destructive' },
    { label: 'Events', value: events, icon: <Award className="h-4 w-4" />, tone: 'sky' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {s.value}
              </p>
            </div>
            <div className={cn('rounded-lg p-2.5', toneClasses[s.tone])}>
              {s.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
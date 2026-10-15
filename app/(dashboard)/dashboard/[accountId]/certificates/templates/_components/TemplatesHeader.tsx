// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplatesHeader.tsx

import { Palette, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
  accountId: string;
  isFetching: boolean;
  onRefresh: () => void;
}

export function TemplatesHeader({
  accountId,
  isFetching,
  onRefresh,
}: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Palette className="h-6 w-6 text-primary" />
          Certificate Templates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Design reusable certificate layouts. System templates are provided
          by Nuruvent; you can also create your own.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onRefresh}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
        <Link href={`/dashboard/${accountId}/certificates/templates/new`}>
          <Button size="sm" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            New template
          </Button>
        </Link>
      </div>
    </div>
  );
}
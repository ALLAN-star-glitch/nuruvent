// app/(dashboard)/dashboard/[accountId]/certificates/templates/_components/TemplateEmpty.tsx

import { Palette, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  accountId: string;
}

export function TemplateEmpty({ accountId }: Props) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <Palette className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            No custom templates yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first template to start issuing branded certificates.
          </p>
        </div>
        <Link
          href={`/dashboard/${accountId}/certificates/templates/new`}
        >
          <Button size="sm" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create template
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
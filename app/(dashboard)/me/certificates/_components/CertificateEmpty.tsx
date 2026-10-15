// app/(dashboard)/dashboard/me/certificates/_components/CertificateEmpty.tsx

import { Award, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function CertificateEmpty({ hasFilters, onClearFilters }: Props) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          {hasFilters ? (
            <Search className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Award className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {hasFilters ? 'No certificates match' : 'No certificates yet'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Certificates you receive will appear here.'}
          </p>
        </div>
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
// app/verify/[code]/_components/InvalidView.tsx

import { AlertCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export function InvalidView({ message }: { message: string }) {
  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Invalid verification code
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Verification codes are 12-64 characters long and contain only
          letters, numbers, hyphens, and underscores.
        </p>
      </CardContent>
    </Card>
  );
}
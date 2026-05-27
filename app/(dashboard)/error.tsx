'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WarningCircle } from '@phosphor-icons/react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <WarningCircle size={24} className="text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong!</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          We encountered an unexpected error while trying to load this page. Please try again or contact support if the issue persists.
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline" className="mt-4">
        Try again
      </Button>
    </div>
  );
}

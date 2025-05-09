'use client';

import { Suspense } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

function AnalyticsContent({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnalyticsContent>{children}</AnalyticsContent>
    </Suspense>
  );
} 
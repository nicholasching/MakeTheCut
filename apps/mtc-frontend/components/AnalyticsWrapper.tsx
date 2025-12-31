'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

function AnalyticsContent({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return <AnalyticsContent>{children}</AnalyticsContent>;
} 
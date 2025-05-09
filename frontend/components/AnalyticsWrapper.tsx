'use client';

import { useAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
} 
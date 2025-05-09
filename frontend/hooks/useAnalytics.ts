"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

export const useAnalytics = () => {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageView = async () => {
      const analyticsInstance = await analytics;
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'page_view', {
          page_path: pathname,
          page_search: typeof window !== 'undefined' ? window.location.search : '',
        });
      }
    };

    trackPageView();
  }, [pathname]);

  const trackEvent = async (eventName: string, eventParams?: Record<string, any>) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  };

  return { trackEvent };
}; 
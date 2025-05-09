"use client";

import { useEffect, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

export const useSectionTracking = <T extends HTMLElement>(sectionName: string) => {
  const sectionRef = useRef<T>(null);
  const { trackEvent } = useAnalytics();
  const hasTracked = useRef(false);
  const enterTime = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            trackEvent('section_view', {
              section_name: sectionName,
              section_id: sectionRef.current?.id,
            });
            hasTracked.current = true;
            enterTime.current = Date.now();
          } else if (!entry.isIntersecting && hasTracked.current) {
            hasTracked.current = false;
            if (enterTime.current) {
              const duration = Math.round((Date.now() - enterTime.current) / 1000); // seconds
              trackEvent('section_engagement_time', {
                section_name: sectionName,
                section_id: sectionRef.current?.id,
                engagement_time_sec: duration,
              });
              enterTime.current = null;
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      // On unmount, send engagement time if user was viewing
      if (hasTracked.current && enterTime.current) {
        const duration = Math.round((Date.now() - enterTime.current) / 1000);
        trackEvent('section_engagement_time', {
          section_name: sectionName,
          section_id: sectionRef.current?.id,
          engagement_time_sec: duration,
        });
      }
    };
  }, [sectionName, trackEvent]);

  return sectionRef;
}; 
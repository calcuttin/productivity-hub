'use client';

import { useEffect } from 'react';
import { useRecentItems, createRecentItem } from '@/context/RecentItemsContext';

interface UseRecentItemsTrackerProps {
  id: string;
  type: 'project' | 'todo' | 'research' | 'workout';
  title: string;
  subtitle?: string;
  status?: string;
  priority?: string;
  customUrl?: string;
  trackOnMount?: boolean;
}

/**
 * Hook to automatically track items as recently viewed/edited
 * Call this hook in components where you want to track user interaction
 */
export function useRecentItemsTracker({
  id,
  type,
  title,
  subtitle,
  status,
  priority,
  customUrl,
  trackOnMount = true,
}: UseRecentItemsTrackerProps) {
  const { addRecentItem } = useRecentItems();

  // Track on mount if enabled
  useEffect(() => {
    if (trackOnMount && id && title) {
      const recentItem = createRecentItem(id, type, title, {
        subtitle,
        status,
        priority,
        customUrl,
      });
      addRecentItem(recentItem);
    }
  }, [id, type, title, subtitle, status, priority, customUrl, trackOnMount, addRecentItem]);

  // Return a function to manually track items
  const trackItem = (overrides?: Partial<UseRecentItemsTrackerProps>) => {
    const item = createRecentItem(
      overrides?.id || id,
      overrides?.type || type,
      overrides?.title || title,
      {
        subtitle: overrides?.subtitle || subtitle,
        status: overrides?.status || status,
        priority: overrides?.priority || priority,
        customUrl: overrides?.customUrl || customUrl,
      }
    );
    addRecentItem(item);
  };

  return { trackItem };
}

/**
 * Utility hook for tracking multiple items at once
 * Useful for list views where multiple items are displayed
 */
export function useRecentItemsListTracker() {
  const { addRecentItem } = useRecentItems();

  const trackItems = (items: Array<{
    id: string;
    type: 'project' | 'todo' | 'research' | 'workout';
    title: string;
    subtitle?: string;
    status?: string;
    priority?: string;
    customUrl?: string;
  }>) => {
    items.forEach(item => {
      const recentItem = createRecentItem(item.id, item.type, item.title, {
        subtitle: item.subtitle,
        status: item.status,
        priority: item.priority,
        customUrl: item.customUrl,
      });
      addRecentItem(recentItem);
    });
  };

  const trackItem = (item: {
    id: string;
    type: 'project' | 'todo' | 'research' | 'workout';
    title: string;
    subtitle?: string;
    status?: string;
    priority?: string;
    customUrl?: string;
  }) => {
    const recentItem = createRecentItem(item.id, item.type, item.title, {
      subtitle: item.subtitle,
      status: item.status,
      priority: item.priority,
      customUrl: item.customUrl,
    });
    addRecentItem(recentItem);
  };

  return { trackItem, trackItems };
} 
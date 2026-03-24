'use client';

import { useEffect } from 'react';
import { getNotificationPrefs, startNotificationScheduler } from '@/lib/notifications';

// Registers the service worker on mount and starts the notification scheduler
// if the user previously enabled notifications.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silently fail — SW is enhancement, not requirement
    });

    // Resume notification scheduler if previously enabled
    const prefs = getNotificationPrefs();
    if (prefs.enabled && Notification.permission === 'granted') {
      startNotificationScheduler();
    }
  }, []);

  return null;
}

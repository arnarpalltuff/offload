'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  requestPermission,
  isSupported,
  getPermissionState,
  startNotificationScheduler,
  stopNotificationScheduler,
  type NotificationPrefs,
} from '@/lib/notifications';

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [permState, setPermState] = useState<NotificationPermission | 'unsupported'>('default');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setPrefs(getNotificationPrefs());
    setPermState(getPermissionState());
  }, []);

  if (!prefs) return null;

  const supported = isSupported();
  const denied = permState === 'denied';

  async function handleEnable() {
    setRequesting(true);
    const granted = await requestPermission();
    setPermState(getPermissionState());
    if (granted) {
      // Register service worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
      }
      const updated = { ...prefs!, enabled: true };
      setPrefs(updated);
      saveNotificationPrefs(updated);
      startNotificationScheduler();
    }
    setRequesting(false);
  }

  function handleDisable() {
    const updated = { ...prefs!, enabled: false };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    stopNotificationScheduler();
  }

  function togglePref(key: keyof Omit<NotificationPrefs, 'enabled'>) {
    const updated = { ...prefs!, [key]: !prefs![key] };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  }

  if (!supported) {
    return (
      <div className="glass-card rounded-2xl p-4 opacity-60">
        <p className="text-xs text-muted">Notifications aren&apos;t supported in this browser.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-sm font-semibold text-foreground">Notifications</span>
        </div>
        {prefs.enabled ? (
          <button
            onClick={handleDisable}
            className="rounded-lg bg-danger/20 px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/30"
          >
            Turn Off
          </button>
        ) : (
          <button
            onClick={handleEnable}
            disabled={denied || requesting}
            className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/30 disabled:opacity-40"
          >
            {requesting ? 'Requesting...' : denied ? 'Blocked by Browser' : 'Enable'}
          </button>
        )}
      </div>

      {denied && !prefs.enabled && (
        <p className="text-[11px] text-danger/70">
          Notifications are blocked. Please enable them in your browser settings for this site.
        </p>
      )}

      <AnimatePresence>
        {prefs.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <Toggle
              label="Morning brain dump reminder"
              sublabel="~9am — nudge to start your day organized"
              checked={prefs.morningReminder}
              onChange={() => togglePref('morningReminder')}
            />
            <Toggle
              label="Evening reflection reminder"
              sublabel="~8pm — prompt to reflect on your day"
              checked={prefs.eveningReminder}
              onChange={() => togglePref('eveningReminder')}
            />
            <Toggle
              label="Streak protection nudge"
              sublabel="~6pm — alert if you haven't checked in today"
              checked={prefs.streakNudge}
              onChange={() => togglePref('streakNudge')}
            />
            <Toggle
              label="Celebration alerts"
              sublabel="Celebrate streak milestones (3, 7, 14, 30 days...)"
              checked={prefs.celebrationAlerts}
              onChange={() => togglePref('celebrationAlerts')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="flex w-full items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
    >
      <div>
        <p className="text-xs font-medium text-foreground/80">{label}</p>
        <p className="text-[10px] text-muted/60">{sublabel}</p>
      </div>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-primary/60' : 'bg-border/40'
        }`}
      >
        <motion.div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

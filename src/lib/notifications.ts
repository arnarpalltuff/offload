// Push notification scheduling & management for Offload
// Uses local scheduling (setTimeout/setInterval) since we don't have a push server.
// Notifications fire via the Service Worker when the app is open or in background.

const STORAGE_KEY = 'offload_notification_prefs';
const LAST_DUMP_KEY = 'offload_last_dump_time';
const LAST_REFLECT_KEY = 'offload_last_reflect_time';

export interface NotificationPrefs {
  enabled: boolean;
  morningReminder: boolean;   // ~9am brain dump reminder
  eveningReminder: boolean;   // ~8pm reflection reminder
  streakNudge: boolean;       // nudge if no activity by 6pm
  celebrationAlerts: boolean; // celebrate streaks, milestones
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  morningReminder: true,
  eveningReminder: true,
  streakNudge: true,
  celebrationAlerts: true,
};

export function getNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function recordDumpTime(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_DUMP_KEY, Date.now().toString());
}

export function recordReflectTime(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_REFLECT_KEY, Date.now().toString());
}

function getLastDumpTime(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(LAST_DUMP_KEY) || '0', 10);
}

function getLastReflectTime(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(LAST_REFLECT_KEY) || '0', 10);
}

export async function requestPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function isSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

async function showNotification(title: string, body: string, url: string = '/dump'): Promise<void> {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker?.ready;
  if (reg) {
    await reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url },
      tag: `offload-${Date.now()}`,
    } as NotificationOptions);
  }
}

// --- Notification content generators ---

const MORNING_MESSAGES = [
  { title: 'Good morning', body: "What's on your mind today? A quick brain dump sets the tone for a focused day." },
  { title: 'Rise and organize', body: "Your brain's been busy overnight. Let's capture those thoughts before they scatter." },
  { title: 'New day, clear mind', body: "Take 2 minutes to dump your thoughts. You'll feel lighter instantly." },
  { title: 'Morning check-in', body: "What's the one thing you need to get done today? Let's start there." },
  { title: 'Hey there', body: "Your morning brain dump is waiting. Unload what's floating around in there." },
];

const EVENING_MESSAGES = [
  { title: "Time to reflect", body: "How did today go? A quick mood check helps you spot patterns over time." },
  { title: "Day's winding down", body: "Take a moment to reflect. What went well? What's still on your mind?" },
  { title: 'Evening check-in', body: "Your reflection streak is counting on you. How was today?" },
  { title: 'Before you unwind', body: "30 seconds to reflect can shift how you feel about the whole day." },
  { title: 'Lumen is curious', body: "How did today land? Even a quick mood score helps me understand your patterns." },
];

const STREAK_NUDGES = [
  { title: "Don't break the streak", body: "You haven't checked in today yet. Even a quick capture counts!" },
  { title: 'Quick reminder', body: "Your streak is on the line. A 30-second brain dump keeps it alive." },
  { title: 'Still time today', body: "Haven't seen you today. Drop a quick thought to keep your momentum going." },
];

const CELEBRATION_MESSAGES: Record<number, { title: string; body: string }> = {
  3: { title: '3-day streak!', body: "You're building a habit. Most people don't make it past day 2." },
  7: { title: '1 week streak!', body: "A full week of showing up for your mind. That's genuinely impressive." },
  14: { title: '2 week streak!', body: "You've been at this for two weeks. Lumen is evolving because of your consistency." },
  21: { title: '3 week streak!', body: "21 days — they say that's when habits stick. You're proving it." },
  30: { title: '1 month streak!', body: "A full month of organized thinking. You're in the top 2% of users." },
  50: { title: '50 day streak!', body: "50 days. Your mind has a real system now. Lumen has never been sharper." },
  100: { title: '100 day streak!', body: "Triple digits. You've built something most people only talk about." },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isToday(timestamp: number): boolean {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

// --- Scheduling engine ---

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export function startNotificationScheduler(): void {
  if (typeof window === 'undefined') return;
  if (schedulerInterval) return; // already running

  // Check every 15 minutes
  schedulerInterval = setInterval(() => {
    checkAndFireNotifications();
  }, 15 * 60 * 1000);

  // Also check immediately on start
  setTimeout(() => checkAndFireNotifications(), 5000);
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

const FIRED_KEY = 'offload_notifications_fired_today';

function getFiredToday(): Set<string> {
  try {
    const stored = localStorage.getItem(FIRED_KEY);
    if (!stored) return new Set();
    const { date, fired } = JSON.parse(stored);
    const today = new Date().toDateString();
    if (date !== today) return new Set(); // reset for new day
    return new Set(fired);
  } catch {
    return new Set();
  }
}

function markFired(type: string): void {
  const fired = getFiredToday();
  fired.add(type);
  localStorage.setItem(FIRED_KEY, JSON.stringify({
    date: new Date().toDateString(),
    fired: Array.from(fired),
  }));
}

function checkAndFireNotifications(): void {
  const prefs = getNotificationPrefs();
  if (!prefs.enabled) return;
  if (Notification.permission !== 'granted') return;

  const now = new Date();
  const hour = now.getHours();
  const fired = getFiredToday();

  // Morning reminder: 8:30-10am window
  if (prefs.morningReminder && hour >= 8 && hour < 10 && !fired.has('morning')) {
    if (!isToday(getLastDumpTime())) {
      const msg = pickRandom(MORNING_MESSAGES);
      showNotification(msg.title, msg.body, '/dump');
      markFired('morning');
    }
  }

  // Evening reminder: 7:30-9:30pm window
  if (prefs.eveningReminder && hour >= 19 && hour < 22 && !fired.has('evening')) {
    if (!isToday(getLastReflectTime())) {
      const msg = pickRandom(EVENING_MESSAGES);
      showNotification(msg.title, msg.body, '/reflect');
      markFired('evening');
    }
  }

  // Streak nudge: 5-7pm if no activity today
  if (prefs.streakNudge && hour >= 17 && hour < 19 && !fired.has('nudge')) {
    if (!isToday(getLastDumpTime()) && !isToday(getLastReflectTime())) {
      const msg = pickRandom(STREAK_NUDGES);
      showNotification(msg.title, msg.body, '/dump');
      markFired('nudge');
    }
  }
}

// Fire a celebration notification for a streak milestone
export function checkStreakCelebration(streakDays: number): void {
  const prefs = getNotificationPrefs();
  if (!prefs.enabled || !prefs.celebrationAlerts) return;

  const celebration = CELEBRATION_MESSAGES[streakDays];
  if (celebration) {
    showNotification(celebration.title, celebration.body, '/insights');
  }
}

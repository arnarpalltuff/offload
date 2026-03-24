// localStorage wrapper for Offload demo mode data
// Keys: 'offload_dumps', 'offload_reflections', 'offload_captures', 'offload_plan_items', 'offload_gratitude', 'offload_streak', 'offload_onboarded'

const PREFIX = 'offload_';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function saveEntry(key: string, data: unknown): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Quota exceeded or other localStorage error
  }
}

export function loadEntry<T>(key: string): T | null {
  if (!isClient()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAll(): void {
  if (!isClient()) return;
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

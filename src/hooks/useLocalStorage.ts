'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveEntry, loadEntry } from '@/lib/storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // On the server (SSR) or first render, use initialValue.
  // On the client, hydrate from localStorage.
  const [storedValue, setStoredValue] = useState<T>(() => {
    const persisted = loadEntry<T>(key);
    return persisted !== null ? persisted : initialValue;
  });

  // Persist to localStorage whenever the value changes
  useEffect(() => {
    saveEntry(key, storedValue);
  }, [key, storedValue]);

  // Cross-tab sync: listen for storage events from other tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setStoredValue(initialValue);
      } else {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          // ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        return next;
      });
    },
    [],
  );

  return [storedValue, setValue];
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGreeting } from '@/lib/utils';
import { DEMO_MODE } from '@/lib/demo-client';
import { useWeather } from '@/context/WeatherContext';
import { WEATHER_CONFIGS } from '@/lib/weather';
import LumenLevelBadge from '@/components/LumenLevelBadge';
import { usePremium } from '@/hooks/usePremium';

const DUMPS_KEY = 'offload_total_dumps';

function getTotalDumps(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(DUMPS_KEY);
  if (stored) return parseInt(stored, 10);
  // Default for demo mode
  if (DEMO_MODE) return 7;
  return 0;
}

export function incrementTotalDumps(): void {
  if (typeof window === 'undefined') return;
  const current = getTotalDumps();
  localStorage.setItem(DUMPS_KEY, String(current + 1));
}

export default function PageHeader() {
  const [greeting, setGreeting] = useState('');
  const [streak, setStreak] = useState(0);
  const [totalDumps, setTotalDumps] = useState(0);
  const { weather } = useWeather();
  const weatherConfig = WEATHER_CONFIGS[weather];
  const { isPremium } = usePremium();

  useEffect(() => {
    setGreeting(getGreeting());
    setTotalDumps(getTotalDumps());
    if (DEMO_MODE) {
      setStreak(7);
    }
    // Update greeting when time of day changes
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between py-4">
      <div>
        <h2 className="text-lg font-bold">
          <span className="gradient-text-animated">
            Offload
          </span>
        </h2>
        <p className="text-sm text-muted">{greeting}</p>
      </div>
      <div className="flex items-center gap-2">
        <LumenLevelBadge totalDumps={totalDumps} compact />
        <div className="glass-card flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted">
          <span>{weatherConfig.icon}</span>
          <span>{weatherConfig.label}</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold text-primary">{streak}</span>
          </div>
        )}
        {!isPremium && (
          <Link
            href="/pricing"
            className="flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(99,102,241,0.15))',
              color: '#00FF88',
              border: '1px solid rgba(0,255,136,0.2)',
            }}
          >
            Pro
          </Link>
        )}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          aria-label="Search (⌘K)"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition-all hover:border-border-bright hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <Link
          href="/account"
          aria-label="Account settings"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition-all hover:border-border-bright hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

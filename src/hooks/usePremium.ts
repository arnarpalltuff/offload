'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '@/lib/demo-client';
import { getUserLimits } from '@/lib/limits';

const PREMIUM_KEY = 'offload_premium';

function getISOWeekKey(): string {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);
  return `offload_dumps_week_${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [dumpsThisWeek, setDumpsThisWeek] = useState(0);

  const limits = getUserLimits(isPremium);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for ?upgraded=true in URL (checkout redirect) — show premium UI immediately
    // but always verify against database below
    const params = new URLSearchParams(window.location.search);
    const justUpgraded = params.get('upgraded') === 'true';
    if (justUpgraded) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Start with localStorage (fast), then verify against database (authoritative)
    const premiumStored = justUpgraded || localStorage.getItem(PREMIUM_KEY) === 'true';
    setIsPremium(premiumStored);

    if (!DEMO_MODE) {
      // In live mode, check the database for the real premium status
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            supabase
              .from('users')
              .select('is_premium')
              .eq('id', data.user.id)
              .single()
              .then(({ data: userData }) => {
                if (userData) {
                  const dbPremium = userData.is_premium === true;
                  setIsPremium(dbPremium);
                  // Keep localStorage in sync with database
                  if (dbPremium) {
                    localStorage.setItem(PREMIUM_KEY, 'true');
                  } else {
                    localStorage.removeItem(PREMIUM_KEY);
                  }
                }
              });
          }
        });
      });
    }

    if (!premiumStored) {
      const weekKey = getISOWeekKey();
      const stored = localStorage.getItem(weekKey);
      setDumpsThisWeek(stored ? parseInt(stored, 10) : 0);
    }
  }, []);

  const incrementDumps = useCallback(() => {
    if (isPremium) return; // no limit tracking for premium
    const weekKey = getISOWeekKey();
    const current = parseInt(localStorage.getItem(weekKey) || '0', 10);
    const next = current + 1;
    localStorage.setItem(weekKey, String(next));
    setDumpsThisWeek(next);
  }, [isPremium]);

  const canDump = isPremium || dumpsThisWeek < limits.dumpsPerWeek;

  return {
    isPremium,
    limits,
    dumpsThisWeek,
    canDump,
    incrementDumps,
  };
}

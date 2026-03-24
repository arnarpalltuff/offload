'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LumenAvatar from '@/components/LumenAvatar';
import TiltCard from '@/components/TiltCard';
import { useToast } from '@/components/Toast';
import { MOOD_EMOJIS, MOOD_COLORS } from '@/lib/types';
import type { Reflection } from '@/lib/types';

interface DayEntry {
  date: string;
  reflection: Reflection | null;
  dumpSummary: string | null;
  itemCount: number;
  completedCount: number;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

export default function JournalPage() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(searchParams.get('date'));
  const { toast } = useToast();

  useEffect(() => {
    async function loadHistory() {
      try {
        // Build date list for last 14 days
        const dates: string[] = [];
        for (let i = 0; i < 14; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
        }

        // Fetch all days in parallel (individual failures don't break the whole page)
        const results = await Promise.all(
          dates.map(async (dateStr) => {
            try {
              const res = await fetch(`/api/entries?date=${dateStr}`);
              const data = await res.json();
              return { dateStr, data };
            } catch {
              return { dateStr, data: {} };
            }
          })
        );

        const days: DayEntry[] = results.map(({ dateStr, data }) => ({
          date: dateStr,
          reflection: data.reflection || null,
          dumpSummary: data.dump?.organized?.summary || null,
          itemCount: data.items?.length || 0,
          completedCount: data.items?.filter((item: { completed: boolean }) => item.completed).length || 0,
        }));

        setEntries(days);
      } catch {
        toast('Failed to load journal history.', 'error');
      }
      setLoading(false);
    }
    loadHistory();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-shimmer rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Journal</h1>
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="glass-card flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-muted transition-all hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
          <kbd className="hidden rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] sm:inline-block">⌘K</kbd>
        </button>
      </div>

      {/* Let Go prompt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="/let-go"
          className="glass-card flex items-center gap-3 rounded-2xl p-4 transition-all hover:bg-white/[0.03]"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(99,102,241,0.15))' }}
          >
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground">Let Go Ritual</span>
            <p className="text-xs text-muted">Release thoughts that no longer serve you</p>
          </div>
          <svg className="h-4 w-4 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </motion.div>

      {entries.length === 0 && (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <motion.div
            className="text-4xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span aria-hidden="true">📖</span>
          </motion.div>
          <h2 className="text-lg font-bold">Your journal is empty</h2>
          <p className="text-sm text-muted">Start with a brain dump or a reflection and your entries will appear here.</p>
          <Link
            href="/dump"
            className="rounded-xl bg-primary/20 px-5 py-2.5 text-sm font-semibold text-primary"
          >
            Start First Dump
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry, i) => {
          const today = isToday(entry.date);
          const expanded = expandedDate === entry.date;
          const hasMood = entry.reflection?.mood_score;

          return (
            <motion.div
              key={entry.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TiltCard className="rounded-2xl" glowColor={hasMood ? MOOD_COLORS[entry.reflection!.mood_score] + '15' : 'transparent'} intensity={8}>
                <button
                  onClick={() => setExpandedDate(expanded ? null : entry.date)}
                  aria-expanded={expanded}
                  aria-label={`${today ? 'Today' : formatDateShort(entry.date)} — ${hasMood ? `mood ${entry.reflection!.mood_score}/5` : 'no mood recorded'}`}
                  className="glass-card w-full rounded-2xl p-4 text-left transition-all hover:bg-white/[0.02]"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasMood ? (
                        <span className="text-xl">{MOOD_EMOJIS[entry.reflection!.mood_score]}</span>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-border/30 text-xs text-muted">
                          —
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          {today ? 'Today' : formatDateShort(entry.date)}
                        </span>
                        {today && (
                          <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                            now
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 text-xs text-muted">
                      {entry.itemCount > 0 && (
                        <span>{entry.completedCount}/{entry.itemCount} done</span>
                      )}
                      {hasMood && (
                        <span style={{ color: MOOD_COLORS[entry.reflection!.mood_score] }}>
                          {entry.reflection!.mood_score}/5
                        </span>
                      )}
                      <svg
                        className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Brief summary always visible */}
                  {entry.dumpSummary && !expanded && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                      {entry.dumpSummary}
                    </p>
                  )}
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 px-4 pb-4">
                        {/* Dump summary */}
                        {entry.dumpSummary && (
                          <div className="rounded-xl bg-white/[0.03] p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <LumenAvatar size="sm" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
                                Lumen&apos;s Summary
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-foreground/70">
                              {entry.dumpSummary}
                            </p>
                          </div>
                        )}

                        {/* Reflection */}
                        {entry.reflection && (
                          <div className="rounded-xl bg-white/[0.03] p-3">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-calm/60">
                              Reflection
                            </span>
                            {entry.reflection.text && (
                              <p className="mt-1 text-xs text-foreground/60">
                                &ldquo;{entry.reflection.text}&rdquo;
                              </p>
                            )}
                            {entry.reflection.ai_insight && (
                              <p className="mt-2 text-xs leading-relaxed text-foreground/70">
                                {entry.reflection.ai_insight}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Task completion */}
                        {entry.itemCount > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/30">
                              <div
                                className="h-full rounded-full bg-primary/60"
                                style={{ width: `${(entry.completedCount / entry.itemCount) * 100}%` }}
                              />
                            </div>
                            <span>{Math.round((entry.completedCount / entry.itemCount) * 100)}% complete</span>
                          </div>
                        )}

                        {/* Quick actions */}
                        {today && (
                          <div className="flex gap-2 pt-1">
                            {!entry.dumpSummary && (
                              <Link href="/dump" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                                Brain Dump
                              </Link>
                            )}
                            {!entry.reflection && (
                              <Link href="/reflect" className="rounded-lg bg-calm/10 px-3 py-1.5 text-xs font-medium text-calm">
                                Reflect
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

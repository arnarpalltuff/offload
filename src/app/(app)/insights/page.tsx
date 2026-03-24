'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CATEGORY_CONFIG, MOOD_COLORS, type ItemCategory } from '@/lib/types';
import { useWeather } from '@/context/WeatherContext';
import LumenAvatar from '@/components/LumenAvatar';
import TiltCard from '@/components/TiltCard';
import MoodCalendar from '@/components/MoodCalendar';
import StreakRewards from '@/components/StreakRewards';
import ShareInsight from '@/components/ShareInsight';
import WeeklySummary from '@/components/WeeklySummary';
import AnimatedCounter from '@/components/AnimatedCounter';
import TextReveal from '@/components/TextReveal';
import { usePremium } from '@/hooks/usePremium';

interface InsightsData {
  moodTrend: { date: string; score: number }[];
  categoryDistribution: Record<string, number>;
  recurringThemes: { text: string; count: number }[];
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  totalDumps: number;
  avgMood: number;
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState<7 | 30>(7);
  const { limits } = usePremium();

  const { setWeatherInputs } = useWeather();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/insights');
        const d = await res.json();
        setData(d);
        setWeatherInputs({
          mood: d.avgMood ? Math.round(d.avgMood) : null,
          completionRate: d.completionRate || 0,
        });
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    load();
  }, [setWeatherInputs]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-shimmer rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <motion.div
          className="text-4xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          😔
        </motion.div>
        <h2 className="text-xl font-bold">Couldn&apos;t Load Insights</h2>
        <p className="text-sm text-muted">Something went wrong fetching your data.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-background"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || (data.totalDumps === 0 && data.moodTrend.length === 0)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <motion.div
          className="text-4xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          📊
        </motion.div>
        <h2 className="text-xl font-bold">No Insights Yet</h2>
        <p className="text-sm text-muted max-w-xs">
          Do a few brain dumps and reflections, and Lumen will start spotting patterns in your thinking.
        </p>
        <Link
          href="/dump"
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-background"
        >
          Start Your First Dump
        </Link>
      </div>
    );
  }

  const moodData = range === 7 ? data.moodTrend.slice(-7) : data.moodTrend;
  const maxBarHeight = 80;

  const lumenText = data.currentStreak >= 7
    ? `You're on a ${data.currentStreak}-day streak. Your consistency is building real self-awareness. Mood average: ${data.avgMood.toFixed(1)}/5.`
    : data.currentStreak >= 3
      ? `${data.currentStreak} days in a row — momentum is building. Your ${data.completionRate}% task completion tells me you're following through.`
      : `You've completed ${data.totalDumps} brain dumps so far. The more you show up, the more patterns I can spot for you.`;

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">Insights</h1>

      {/* Lumen overview */}
      <TiltCard className="rounded-2xl" glowColor="rgba(124,58,237,0.15)">
        <div className="glass-card flex gap-3 rounded-2xl border-calm/20 p-4 glow-calm">
          <LumenAvatar size="sm" />
          <TextReveal
            text={lumenText}
            className="flex-1 text-sm leading-relaxed text-foreground/70"
            delay={0.3}
          />
        </div>
      </TiltCard>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: data.currentStreak, label: 'Day Streak', icon: '🔥', color: 'rgba(255,136,0,0.12)' },
          { value: data.avgMood.toFixed(1), label: 'Avg Mood', icon: '😊', color: 'rgba(0,255,136,0.12)' },
          { value: data.completionRate, label: 'Completion', icon: '✅', color: 'rgba(99,102,241,0.12)', suffix: '%' },
        ].map((stat, i) => (
          <TiltCard key={stat.label} className="rounded-2xl" glowColor={stat.color} intensity={15}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-3 text-center"
            >
              <motion.div
                className="text-lg"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                {stat.icon}
              </motion.div>
              <div className="mt-1 text-xl font-bold text-foreground">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.label === 'Avg Mood' ? 1 : 0} />
              </div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                {stat.label}
              </div>
            </motion.div>
          </TiltCard>
        ))}
      </div>

      {/* Mood Trend */}
      <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.08)" intensity={6}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Mood Trend</h3>
            <div className="flex gap-1 rounded-lg bg-background/50 p-0.5">
              {([7, 30] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    range === r ? 'bg-card text-foreground' : 'text-muted'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1" style={{ height: maxBarHeight + 20 }}>
            {moodData.map((d, i) => {
              const height = (d.score / 5) * maxBarHeight;
              return (
                <motion.div
                  key={d.date}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.03, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex-1 rounded-t-md"
                  style={{
                    backgroundColor: MOOD_COLORS[d.score] + '80',
                    boxShadow: `0 0 12px ${MOOD_COLORS[d.score]}30`,
                  }}
                  title={`${d.date}: ${d.score}/5`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{moodData[0]?.date.slice(5)}</span>
            <span>{moodData[moodData.length - 1]?.date.slice(5)}</span>
          </div>
        </motion.div>
      </TiltCard>

      {/* Category Distribution */}
      <TiltCard className="rounded-2xl" glowColor="rgba(99,102,241,0.1)" intensity={6}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
            What You Think About
          </h3>
          <div className="space-y-3">
            {Object.entries(data.categoryDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, pct]) => {
                const config = CATEGORY_CONFIG[cat as ItemCategory];
                if (!config) return null;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm">{config.icon}</span>
                    <span className="w-24 text-sm font-medium">{config.label}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-border">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: config.color,
                            boxShadow: `0 0 8px ${config.color}60`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-muted">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </TiltCard>

      {/* Recurring Themes */}
      <TiltCard className="rounded-2xl" glowColor="rgba(124,58,237,0.1)" intensity={6}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Recurring Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.recurringThemes.map((theme, i) => (
              <motion.span
                key={theme.text}
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 200, damping: 15 }}
                className="glass-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
              >
                <span className="text-foreground">{theme.text}</span>
                <span className="text-muted">{theme.count}x</span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </TiltCard>

      {/* Completion Ring */}
      <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.12)" intensity={8}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted">
            Task Completion
          </h3>
          <div className="flex justify-center">
            <motion.div
              className="relative flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#00FF88 ${data.completionRate * 3.6}deg, rgba(30,41,59,0.5) ${data.completionRate * 3.6}deg)`,
                boxShadow: `0 0 30px rgba(0,255,136,${data.completionRate / 500})`,
              }}
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="flex h-22 w-22 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                <span className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={data.completionRate} suffix="%" />
                </span>
              </div>
            </motion.div>
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            {data.totalDumps} brain dumps completed
          </p>
        </motion.div>
      </TiltCard>

      {/* Mood Calendar Heatmap */}
      <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.08)" intensity={5}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Mood Calendar
          </h3>
          <MoodCalendar data={data.moodTrend} />
        </motion.div>
      </TiltCard>

      {/* Weekly Summary from Lumen */}
      <WeeklySummary
        avgMood={data.avgMood}
        completionRate={data.completionRate}
        topThemes={data.recurringThemes.map((t) => t.text)}
        totalDumps={data.totalDumps}
        streakDays={data.currentStreak}
        locked={!limits.weeklySummaryEnabled}
      />

      {/* Streak Rewards & Milestones */}
      <TiltCard className="rounded-2xl" glowColor="rgba(249,115,22,0.1)" intensity={6}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Streak Rewards
          </h3>
          <StreakRewards currentStreak={data.currentStreak} bestStreak={data.bestStreak} />
        </motion.div>
      </TiltCard>

      {/* Share Your Progress */}
      <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.1)" intensity={6}>
        <ShareInsight
          streakDays={data.currentStreak}
          avgMood={data.avgMood}
          totalDumps={data.totalDumps}
          completionRate={data.completionRate}
          locked={!limits.shareEnabled}
        />
      </TiltCard>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MoodSelector from '@/components/MoodSelector';
import LoadingBreath from '@/components/LoadingBreath';
import LumenAvatar from '@/components/LumenAvatar';
import TiltCard from '@/components/TiltCard';
import TextReveal from '@/components/TextReveal';
import MagneticButton from '@/components/MagneticButton';
import { formatDate, getTodayDate, getTimeOfDay } from '@/lib/utils';
import { getLumenGreeting } from '@/lib/lumen';
import { useWeather } from '@/context/WeatherContext';
import { useToast } from '@/components/Toast';
import { recordReflectTime } from '@/lib/notifications';
import type { Reflection } from '@/lib/types';

export default function ReflectPage() {
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<Reflection | null>(null);
  const [checking, setChecking] = useState(true);
  const [greeting, setGreeting] = useState('');
  const { setWeatherInputs } = useWeather();
  const { toast } = useToast();

  useEffect(() => {
    setGreeting(getLumenGreeting(getTimeOfDay(), 2));

    async function check() {
      try {
        const res = await fetch(`/api/entries?date=${getTodayDate()}`);
        const data = await res.json();
        if (data.reflection) {
          setExisting(data.reflection);
          setWeatherInputs({ mood: data.reflection.mood_score });
        }
      } catch {
        toast('Failed to load today\u2019s reflection. Please try refreshing.', 'error');
      }
      setChecking(false);
    }
    check();
  }, [setWeatherInputs, toast]);

  async function handleSubmit() {
    if (mood === null || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_score: mood, text }),
      });
      const data = await res.json();
      setExisting({
        id: 'new',
        mood_score: mood,
        text,
        ai_insight: data.insight || '',
        created_at: new Date().toISOString(),
        date: getTodayDate(),
      });
      setWeatherInputs({ mood });
      recordReflectTime();
    } catch {
      toast('Failed to save your reflection. Please try again.', 'error');
    }
    setLoading(false);
  }

  if (checking) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-shimmer rounded-lg" />
        <div className="h-32 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (loading) {
    return <LoadingBreath text="Lumen is reflecting with you..." />;
  }

  const moodEmojis = ['', '😔', '😕', '😐', '😊', '😄'];
  const today = formatDate(getTodayDate());

  // Show existing reflection
  if (existing) {
    return (
      <div className="space-y-5 pb-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Today&apos;s Reflection</h1>
          <p className="text-sm text-muted">{today}</p>
        </div>

        <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.1)" intensity={10}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="glass-card flex flex-col items-center gap-3 rounded-2xl p-6"
          >
            <motion.span
              className="text-5xl"
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {moodEmojis[existing.mood_score]}
            </motion.span>
            <span className="text-sm font-medium text-muted">
              {['', 'Rough', 'Meh', 'Okay', 'Good', 'Great'][existing.mood_score]}
            </span>
            {existing.text && (
              <p className="text-center text-sm text-foreground/70">&ldquo;{existing.text}&rdquo;</p>
            )}
          </motion.div>
        </TiltCard>

        {/* Lumen Insight */}
        <TiltCard className="rounded-2xl" glowColor="rgba(124,58,237,0.15)">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl border-calm/20 p-5 glow-calm"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <LumenAvatar size="sm" />
              <span className="text-xs font-semibold uppercase tracking-wider text-calm">Lumen&apos;s Insight</span>
            </div>
            <TextReveal
              text={existing.ai_insight}
              className="text-sm leading-relaxed text-foreground/80"
              delay={0.5}
              stagger={0.03}
            />
          </motion.div>
        </TiltCard>
      </div>
    );
  }

  // Reflection input
  return (
    <div className="space-y-6 pb-4">
      {/* Lumen greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <LumenAvatar size="md" />
        <TextReveal text={greeting} className="text-sm text-muted" delay={0.2} />
      </motion.div>

      <div className="text-center">
        <motion.h1
          className="text-xl font-bold"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
        >
          How did today go?
        </motion.h1>
        <p className="text-sm text-muted">{today}</p>
      </div>

      <MoodSelector value={mood} onChange={setMood} />

      {mood !== null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Anything else on your mind? (optional)"
              className="glass-input min-h-[120px] w-full rounded-2xl p-4 text-sm leading-relaxed text-foreground placeholder-muted/50"
            />
          </motion.div>

          <MagneticButton
            onClick={handleSubmit}
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl py-4 text-lg font-bold text-white transition-all"
          >
            <div className="gradient-calm absolute inset-0 transition-opacity group-hover:opacity-90" />
            <motion.div
              className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)',
              }}
            />
            <span className="relative flex items-center justify-center gap-2">
              <LumenAvatar size="sm" />
              Get Lumen&apos;s Insight
            </span>
          </MagneticButton>
        </motion.div>
      )}
    </div>
  );
}

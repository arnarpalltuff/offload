'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { OrganizedDump, PlanItem } from '@/lib/types';
import CategoryCard from '@/components/CategoryCard';
import LoadingBreath from '@/components/LoadingBreath';
import LumenAvatar from '@/components/LumenAvatar';
import MagneticButton from '@/components/MagneticButton';
import TextReveal from '@/components/TextReveal';
import TiltCard from '@/components/TiltCard';
import VoiceCapture from '@/components/VoiceCapture';
import DailyPrompt from '@/components/DailyPrompt';
import GratitudeCapture from '@/components/GratitudeCapture';
import ExportData from '@/components/ExportData';
import { formatDate, getTodayDate, getTimeOfDay } from '@/lib/utils';
import { useWeather } from '@/context/WeatherContext';
import { useToast } from '@/components/Toast';
import UpgradePrompt from '@/components/UpgradePrompt';
import { usePremium } from '@/hooks/usePremium';
import NotificationSettings from '@/components/NotificationSettings';
import { recordDumpTime } from '@/lib/notifications';
import { incrementTotalDumps } from '@/components/PageHeader';

const MorningOracle = dynamic(() => import('@/components/MorningOracle'), { ssr: false });
const DriftMode = dynamic(() => import('@/components/DriftMode'), { ssr: false });
const ThoughtDriftView = dynamic(() => import('@/components/ThoughtDriftView'), { ssr: false });
const Onboarding = dynamic(() => import('@/components/Onboarding'), { ssr: false });

type ViewMode = 'list' | 'drift';

export default function DumpPage() {
  const [rawText, setRawText] = useState('');
  const [organized, setOrganized] = useState<OrganizedDump | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [showOracle, setShowOracle] = useState(false);
  const [driftMode, setDriftMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { setWeatherInputs } = useWeather();
  const { toast } = useToast();
  const { isPremium, limits, dumpsThisWeek, canDump, incrementDumps } = usePremium();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('offload_onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    async function checkToday() {
      try {
        const res = await fetch(`/api/entries?date=${getTodayDate()}`);
        const data = await res.json();
        if (data.dump) {
          setOrganized(data.dump.organized);
          setRawText(data.dump.raw_text);
          setHasExisting(true);
          setWeatherInputs({
            worryCount: data.dump.organized.worries?.length || 0,
            ideaCount: data.dump.organized.ideas?.length || 0,
          });
        } else {
          const tod = getTimeOfDay();
          if (tod === 'morning') {
            setShowOracle(true);
          }
        }
      } catch {
        toast('Failed to load today\u2019s entries. Please try refreshing.', 'error');
      }
      setCheckingExisting(false);
    }
    checkToday();
  }, [setWeatherInputs, toast]);

  async function handleSubmit(text?: string) {
    const inputText = text || rawText;
    if (!inputText.trim() || loading) return;

    if (!canDump) {
      setShowUpgradePrompt(true);
      return;
    }

    setRawText(inputText);
    setLoading(true);
    setDriftMode(false);
    try {
      const res = await fetch('/api/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (data.organized) {
        setOrganized(data.organized);
        setHasExisting(true);
        incrementDumps();
        incrementTotalDumps();
        recordDumpTime();
        setWeatherInputs({
          worryCount: data.organized.worries?.length || 0,
          ideaCount: data.organized.ideas?.length || 0,
        });
      }
    } catch {
      toast('Failed to organize your thoughts. Please try again.', 'error');
    }
    setLoading(false);
  }

  function handleStartFresh() {
    setOrganized(null);
    setRawText('');
    setHasExisting(false);
  }

  function getAllItems(): PlanItem[] {
    if (!organized) return [];
    return [
      ...organized.must_do,
      ...organized.can_wait,
      ...organized.ideas,
      ...organized.worries,
    ];
  }

  if (showOnboarding) {
    return (
      <AnimatePresence>
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </AnimatePresence>
    );
  }

  if (checkingExisting) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-shimmer rounded-lg" />
        <div className="h-48 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (driftMode) {
    return (
      <DriftMode
        onComplete={(text) => handleSubmit(text)}
        onCancel={() => setDriftMode(false)}
      />
    );
  }

  if (loading) {
    return <LoadingBreath text="Lumen is organizing your thoughts..." />;
  }

  if (showOracle && !hasExisting) {
    return <MorningOracle onBeginDay={() => setShowOracle(false)} />;
  }

  const today = formatDate(getTodayDate());

  // Show organized results
  if (organized) {
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Your Day, Organized</h1>
            <p className="text-sm text-muted">{today}</p>
          </div>
          {/* View toggle */}
          <div className="glass-card flex gap-1 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('drift')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'drift' ? 'bg-primary/20 text-primary' : 'text-muted'
              }`}
            >
              Drift
            </button>
          </div>
        </div>

        {/* Lumen summary */}
        <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.12)">
          <div className="glass-card flex gap-3 rounded-2xl border-primary/20 p-4 glow-green">
            <LumenAvatar size="sm" />
            <TextReveal text={organized.summary} className="flex-1 text-sm leading-relaxed text-foreground/80" delay={0.2} />
          </div>
        </TiltCard>

        {viewMode === 'drift' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ThoughtDriftView items={getAllItems()} />
          </motion.div>
        ) : (
          <>
            <CategoryCard category="must_do" items={organized.must_do} delay={0.1} />
            <CategoryCard category="can_wait" items={organized.can_wait} delay={0.2} />
            <CategoryCard category="ideas" items={organized.ideas} delay={0.3} />
            <CategoryCard category="worries" items={organized.worries} delay={0.4} />
          </>
        )}

        <ExportData organized={organized} />

        {/* Cross-page navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-2"
        >
          <Link
            href="/plan"
            className="glass-card glass-card-hover flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-primary transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            View Plan
          </Link>
          <button
            onClick={handleStartFresh}
            className="glass-card glass-card-hover flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-muted transition-all hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add More
          </button>
        </motion.div>
      </div>
    );
  }

  // Input view
  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {hasExisting ? 'Add More Thoughts' : "What's on your mind?"}
          </motion.h1>
          <p className="text-sm text-muted">{today}</p>
        </div>
      </div>

      {/* Voice + text input */}
      <div className="flex items-center gap-2">
        <VoiceCapture
          onTranscript={(t) => setRawText((prev) => (prev ? prev + ' ' + t : t))}
          className="shrink-0"
          locked={!limits.voiceEnabled}
        />
        <MagneticButton
          onClick={() => setDriftMode(true)}
          className="flex items-center gap-1.5 rounded-xl border border-calm/30 bg-calm/10 px-3 py-2.5 text-xs font-medium text-calm transition-all hover:bg-calm/20 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Drift
        </MagneticButton>
      </div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Dump everything here — tasks, thoughts, worries, ideas, half-formed plans... Don't filter, just write."
            className="glass-input min-h-[200px] w-full rounded-2xl p-4 text-[15px] leading-relaxed text-foreground placeholder-muted/50"
            autoFocus
          />
        </motion.div>
        <div className="absolute bottom-3 right-3 text-xs text-muted">
          {rawText.length > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={rawText.length > 9500 ? (rawText.length > 10000 ? 'text-red-400' : 'text-yellow-400') : ''}
            >
              {rawText.length.toLocaleString()}{rawText.length > 9500 ? ' / 10,000' : ''} chars
              {rawText.length > 10000 && ' — over limit'}
            </motion.span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUpgradePrompt && !canDump && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <UpgradePrompt
              feature="Weekly Dump Limit Reached"
              description={`You've used all ${limits.dumpsPerWeek} free dumps this week. Upgrade to Pro for unlimited brain dumps.`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rawText.trim().length > 10 && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
          >
            {!isPremium && (
              <p className="mb-2 text-center text-xs text-muted">
                {dumpsThisWeek}/{limits.dumpsPerWeek} free dumps this week
              </p>
            )}
            <MagneticButton
              onClick={() => handleSubmit()}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl py-4 text-lg font-bold text-background transition-all"
            >
              <div className="gradient-primary absolute inset-0 transition-opacity group-hover:opacity-90" />
              <motion.div
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <LumenAvatar size="sm" />
                Let Lumen Organize This
              </span>
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>

      {!rawText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 pt-2"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Try something like...</p>
          {[
            'I need to finish my report today, also remember to call the dentist...',
            'Feeling stressed about the deadline. Maybe I should ask for help?',
            'Had an idea for a side project — something with AI and daily habits...',
          ].map((example, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              onClick={() => setRawText(example)}
              className="glass-card glass-card-hover block w-full rounded-xl px-4 py-3 text-left text-sm text-muted transition-all hover:text-foreground hover:shadow-[0_0_20px_rgba(0,255,136,0.06)]"
            >
              &ldquo;{example}&rdquo;
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Daily prompt */}
      {!rawText && (
        <DailyPrompt onUsePrompt={(prompt) => setRawText(prompt + '\n\n')} />
      )}

      {/* Gratitude */}
      {!rawText && (
        <GratitudeCapture
          onSave={() => {/* saved locally in demo */}}
          locked={!limits.gratitudeEnabled}
        />
      )}

      {/* Notification settings */}
      {!rawText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-4"
        >
          <NotificationSettings />
        </motion.div>
      )}
    </div>
  );
}

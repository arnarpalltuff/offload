'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Link from 'next/link';
import LumenAvatar from '@/components/LumenAvatar';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { LetGoItem } from '@/app/api/let-go/route';

const LUMEN_MESSAGES = [
  "Most worries are just your brain rehearsing for things that never happen.",
  "You carried this all week. It's okay to put it down now.",
  "Not everything that feels urgent deserves your energy.",
  "Letting go isn't giving up — it's making room.",
  "Your mind held onto this so you wouldn't forget. You've seen it. You can release it.",
];

const CLOSING_MESSAGES = [
  "You just made space for what actually matters this week.",
  "Lighter already. Your brain will thank you tomorrow morning.",
  "That's the whole point — not doing more, but carrying less.",
];

function getDaysAgoLabel(days: number): string {
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

interface SwipeCardProps {
  item: LetGoItem;
  onKeep: () => void;
  onLetGo: () => void;
  isTop: boolean;
}

function SwipeCard({ item, onKeep, onLetGo, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const letGoOpacity = useTransform(x, [0, 100], [0, 1]);
  const keepOpacity = useTransform(x, [-100, 0], [1, 0]);

  const categoryConfig = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG];

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 100) {
      onLetGo();
    } else if (info.offset.x < -100) {
      onKeep();
    }
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: isTop ? 10 : 1 }}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.5 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{
        x: 300,
        opacity: 0,
        rotate: 20,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
    >
      <motion.div
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        className="glass-card relative h-full cursor-grab rounded-3xl p-6 active:cursor-grabbing"
      >
        {/* Swipe indicators */}
        <motion.div
          style={{ opacity: letGoOpacity }}
          className="absolute right-6 top-6 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary"
        >
          Let go
        </motion.div>
        <motion.div
          style={{ opacity: keepOpacity }}
          className="absolute left-6 top-6 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400"
        >
          Keep
        </motion.div>

        {/* Category badge */}
        <div className="mb-6 mt-4 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: categoryConfig.bg, color: categoryConfig.color }}
          >
            {categoryConfig.icon} {categoryConfig.label}
          </span>
          <span className="text-[10px] text-muted/50">
            {getDaysAgoLabel(item.daysOld)}
          </span>
        </div>

        {/* The thought */}
        <p className="text-lg font-medium leading-relaxed text-foreground/90">
          {item.text}
        </p>

        {/* Lumen nudge */}
        <div className="mt-8 flex items-start gap-2">
          <LumenAvatar size="sm" />
          <p className="text-xs leading-relaxed text-foreground/40 italic">
            {LUMEN_MESSAGES[Math.abs(item.id.charCodeAt(item.id.length - 1)) % LUMEN_MESSAGES.length]}
          </p>
        </div>

        {/* Swipe hint */}
        {isTop && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 text-[10px] text-muted/40">
            <span>← keep</span>
            <span>let go →</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function LetGoPage() {
  const [items, setItems] = useState<LetGoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letGoCount, setLetGoCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [done, setDone] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/let-go');
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        setItems([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const spawnParticles = useCallback(() => {
    const newParticles = Array.from({ length: 12 }, () => ({
      id: particleIdRef.current++,
      x: Math.random() * 300 - 150,
      y: -(Math.random() * 200 + 50),
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1500);
  }, []);

  function handleLetGo() {
    setLetGoCount((c) => c + 1);
    spawnParticles();
    advance();
  }

  function handleKeep() {
    setKeptCount((c) => c + 1);
    advance();
  }

  function advance() {
    if (currentIndex >= items.length - 1) {
      setTimeout(() => setDone(true), 500);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <LumenAvatar size="lg" />
        </motion.div>
        <p className="text-sm text-muted">Gathering what you can let go of...</p>
      </div>
    );
  }

  // Nothing to let go of
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <LumenAvatar size="lg" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold">Nothing to let go of</h2>
          <p className="mt-2 text-sm text-muted">
            You&apos;re carrying light this week. Come back when things pile up.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/journal"
            className="rounded-xl bg-primary/20 px-5 py-2.5 text-sm font-semibold text-primary"
          >
            Back to Journal
          </Link>
        </motion.div>
      </div>
    );
  }

  // Completion screen
  if (done) {
    const closingMessage = CLOSING_MESSAGES[letGoCount % CLOSING_MESSAGES.length];
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
        >
          <LumenAvatar size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold">
            {letGoCount > 0 ? (
              <>
                You released{' '}
                <span className="gradient-text-animated">
                  {letGoCount} thing{letGoCount !== 1 ? 's' : ''}
                </span>
              </>
            ) : (
              'You chose to keep everything'
            )}
          </h2>

          {keptCount > 0 && letGoCount > 0 && (
            <p className="text-sm text-muted">
              Kept {keptCount} — and that&apos;s okay too.
            </p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mx-auto max-w-xs text-sm leading-relaxed text-foreground/60 italic"
          >
            &ldquo;{closingMessage}&rdquo;
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-3"
        >
          <Link
            href="/dump"
            className="rounded-xl bg-primary/20 px-5 py-2.5 text-sm font-semibold text-primary"
          >
            Start Fresh Dump
          </Link>
          <Link
            href="/journal"
            className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-muted"
          >
            Journal
          </Link>
        </motion.div>
      </div>
    );
  }

  // Active card stack
  const remaining = items.length - currentIndex;
  const progress = currentIndex / items.length;

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Let Go</h1>
          <p className="text-xs text-muted">
            {remaining} thought{remaining !== 1 ? 's' : ''} from this week
          </p>
        </div>
        <button
          onClick={() => setDone(true)}
          className="text-xs text-muted/50 transition-colors hover:text-muted"
        >
          Skip all
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-border/30">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-calm))' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Card stack */}
      <div className="relative mx-auto h-[380px] max-w-sm">
        {/* Release particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: '50%', y: '50%', scale: 1 }}
              animate={{
                opacity: 0,
                x: `calc(50% + ${p.x}px)`,
                y: `calc(50% + ${p.y}px)`,
                scale: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute h-2 w-2 rounded-full"
              style={{ background: 'var(--color-primary)' }}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {items.slice(currentIndex, currentIndex + 2).map((item, i) => (
            <SwipeCard
              key={item.id}
              item={item}
              isTop={i === 0}
              onLetGo={handleLetGo}
              onKeep={handleKeep}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action buttons (fallback for non-swipe users) */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleKeep}
          className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-2.5 text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Keep
        </button>
        <button
          onClick={handleLetGo}
          className="flex items-center gap-2 rounded-xl bg-primary/20 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/30"
        >
          Release
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

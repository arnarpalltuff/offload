'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ShareInsightProps {
  streakDays: number;
  avgMood: number;
  totalDumps: number;
  completionRate: number;
  locked?: boolean;
}

export default function ShareInsight({ streakDays, avgMood, totalDumps, completionRate, locked = false }: ShareInsightProps) {
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = `I've been on a ${streakDays}-day streak on Offload, averaging ${avgMood.toFixed(1)}/5 mood. ${totalDumps} brain dumps and counting! \u{1F9E0}\u2728 Try it: ${appUrl}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Offload Progress',
          text: shareText,
        });
      } catch {
        // User cancelled or share failed — fall back to clipboard
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Shareable card preview */}
      <div className="mb-4 rounded-xl bg-gradient-to-br from-background/80 to-card/60 border border-border/40 p-5 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{streakDays}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{avgMood.toFixed(1)}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted">Avg Mood</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalDumps}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted">Brain Dumps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted">Completion</div>
          </div>
        </div>
        <div className="text-center text-xs text-muted/60 font-medium tracking-wide">
          Offload &mdash; Where overthinking ends
        </div>
      </div>

      {/* Share button */}
      {locked ? (
        <Link
          href="/pricing"
          className="block w-full rounded-xl bg-primary/10 py-3 text-center text-sm font-semibold text-primary/60 transition-all hover:bg-primary/15"
        >
          Upgrade to Share
        </Link>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="w-full rounded-xl bg-primary/15 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/25"
        >
          <span aria-live="polite">
            {copied ? 'Copied to Clipboard!' : 'Share Your Progress'}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}

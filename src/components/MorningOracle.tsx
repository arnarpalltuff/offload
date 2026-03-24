'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LumenAvatar from '@/components/LumenAvatar';

interface OracleData {
  theme: string;
  challenge: string;
  observation: string;
}

interface MorningOracleProps {
  onBeginDay: () => void;
}

export default function MorningOracle({ onBeginDay }: MorningOracleProps) {
  const [oracle, setOracle] = useState<OracleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOracle() {
      try {
        const res = await fetch('/api/oracle');
        const data = await res.json();
        setOracle(data);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchOracle();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <LumenAvatar size="lg" thinking />
        <p className="text-sm text-muted">Lumen is preparing your morning oracle...</p>
      </div>
    );
  }

  if (!oracle) return null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-2 relative">
      {/* Skip button — always visible */}
      <button
        onClick={onBeginDay}
        className="absolute right-0 top-0 text-xs text-muted/50 transition-colors hover:text-muted"
      >
        Skip
      </button>

      {/* Lumen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <LumenAvatar size="lg" />
      </motion.div>

      {/* Oracle card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Theme */}
        <div className="oracle-border rounded-2xl p-[1px]">
          <div className="glass-card rounded-2xl px-6 py-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary/60"
            >
              Today&apos;s Oracle
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-xl font-bold leading-relaxed text-foreground"
            >
              &ldquo;{oracle.theme}&rdquo;
            </motion.p>
          </div>
        </div>

        {/* Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 glass-card rounded-xl border-primary/20 px-5 py-4 glow-green"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
            Micro-Challenge
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
            {oracle.challenge}
          </p>
        </motion.div>

        {/* Observation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-3 glass-card rounded-xl border-calm/20 px-5 py-4 glow-calm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-calm/60">
            Pattern Insight
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
            {oracle.observation}
          </p>
        </motion.div>
      </motion.div>

      {/* Begin day button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        onClick={onBeginDay}
        className="group relative overflow-hidden rounded-2xl px-8 py-4 text-lg font-bold text-background"
      >
        <div className="gradient-primary absolute inset-0 transition-opacity group-hover:opacity-90" />
        <span className="relative">Begin Your Day</span>
      </motion.button>
    </div>
  );
}

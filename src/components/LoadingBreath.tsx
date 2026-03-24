'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingBreath({ text = 'Organizing your thoughts...' }: { text?: string }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'done'>('inhale');

  useEffect(() => {
    // Quick breath: inhale 2s → hold 1s → exhale 2s → done (5s total, not 10)
    const t1 = setTimeout(() => setPhase('hold'), 2000);
    const t2 = setTimeout(() => setPhase('exhale'), 3000);
    const t3 = setTimeout(() => setPhase('done'), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const isBreathing = phase !== 'done';
  const isInhale = phase === 'inhale';
  const isExhale = phase === 'exhale';

  const breathLabel = isInhale ? 'Breathe in...' : phase === 'hold' ? 'Hold...' : isExhale ? 'Breathe out...' : '';

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <motion.div
        animate={{
          scale: isInhale ? 1.3 : isExhale ? 1 : isBreathing ? 1.3 : [1, 1.15, 1],
          opacity: isBreathing ? [0.5, 1] : [0.5, 1, 0.5],
        }}
        transition={{
          duration: isBreathing ? 2 : 3,
          repeat: isBreathing ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 glow-green"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <div className="h-8 w-8 rounded-full gradient-primary opacity-60" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isBreathing ? (
          <motion.p
            key={`breath-${phase}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-foreground/60"
          >
            {breathLabel}
          </motion.p>
        ) : (
          <motion.p
            key="organizing"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm font-medium text-muted"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

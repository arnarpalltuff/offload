'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import UpgradePrompt from '@/components/UpgradePrompt';

interface GratitudeCaptureProps {
  onSave: (items: string[]) => void;
  existing?: string[];
  locked?: boolean;
}

export default function GratitudeCapture({ onSave, existing, locked = false }: GratitudeCaptureProps) {
  const [persistedGratitude, setPersistedGratitude] = useLocalStorage<string[]>('offload_gratitude', []);
  const initial = existing?.length ? existing : persistedGratitude.length ? persistedGratitude : ['', '', ''];
  const [items, setItems] = useState<string[]>(initial);
  const [saved, setSaved] = useState(!!existing?.length || !!persistedGratitude.length);

  if (locked) {
    return (
      <div className="space-y-3">
        <div className="glass-card rounded-2xl p-4 opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm" aria-hidden="true">&#10024;</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-warm/70">
              Three Good Things
            </span>
          </div>
          <p className="text-xs text-muted">Name three good things each day to shift your perspective...</p>
        </div>
        <UpgradePrompt feature="Three Good Things" description="Unlock daily gratitude capture to build a more positive mindset." />
      </div>
    );
  }

  function handleChange(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    setItems(next);
  }

  function handleSave() {
    const filled = items.filter((i) => i.trim());
    if (filled.length === 0) return;
    setPersistedGratitude(filled);
    onSave(filled);
    setSaved(true);
  }

  const displayItems = existing?.length ? existing : persistedGratitude.length ? persistedGratitude : [];

  if (saved && displayItems.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm" aria-hidden="true">✨</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-warm/70">
            Today&apos;s Gratitude
          </span>
        </div>
        <div className="space-y-2">
          {displayItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2"
            >
              <span className="mt-0.5 text-warm/60 text-xs">&#x2022;</span>
              <span className="text-sm text-foreground/70">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm" aria-hidden="true">✨</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-warm/70">
          Three Good Things
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2"
          >
            <span className="text-warm/40 text-xs font-bold">{i + 1}</span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={
                i === 0
                  ? 'Something that made you smile...'
                  : i === 1
                    ? 'Someone you appreciate...'
                    : 'A small win today...'
              }
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted/40 outline-none border-b border-border/30 pb-1 focus:border-primary/30 transition-colors"
            />
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {items.some((i) => i.trim()) && !saved && (
          <motion.button
            key="save-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSave}
            className="mt-3 w-full rounded-xl bg-warm/20 py-2 text-xs font-semibold text-warm transition-colors hover:bg-warm/30"
          >
            Save Gratitude
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

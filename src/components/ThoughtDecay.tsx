'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ThoughtDecayProps {
  createdAt: string;
  completed: boolean;
  children: React.ReactNode;
}

function getTimeAgo(createdAt: string): string {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getDecayLevel(createdAt: string): 0 | 1 | 2 | 3 {
  const hoursSince = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (hoursSince >= 72) return 3;
  if (hoursSince >= 48) return 2;
  if (hoursSince >= 24) return 1;
  return 0;
}

const DECAY_OPACITY = [1.0, 0.85, 0.7, 0.55] as const;

const DECAY_TINT = [
  'transparent',
  'rgba(239, 68, 68, 0.03)',
  'rgba(239, 68, 68, 0.06)',
  'rgba(239, 68, 68, 0.10)',
] as const;

export default function ThoughtDecay({ createdAt, completed, children }: ThoughtDecayProps) {
  // Compute decay on client only to avoid hydration mismatch
  const [decayLevel, setDecayLevel] = useState<0 | 1 | 2 | 3>(0);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setDecayLevel(getDecayLevel(createdAt));
    setTimeAgo(getTimeAgo(createdAt));
  }, [createdAt]);

  // Completed items glow green — no decay
  if (completed) {
    return (
      <div className="relative">
        <motion.div
          initial={{ boxShadow: 'none' }}
          animate={{
            boxShadow: [
              'inset 0 0 0 rgba(0, 255, 136, 0)',
              'inset 0 0 12px rgba(0, 255, 136, 0.06)',
              'inset 0 0 0 rgba(0, 255, 136, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  const opacity = DECAY_OPACITY[decayLevel];
  const tint = DECAY_TINT[decayLevel];
  const showParticles = decayLevel >= 3;

  return (
    <div className="relative">
      {/* Decay tint overlay */}
      {decayLevel > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none rounded-sm z-0"
          style={{ backgroundColor: tint }}
        />
      )}

      {/* Main content with opacity decay */}
      <div style={{ opacity }} className="relative z-[1] transition-opacity duration-500">
        {children}
      </div>

      {/* Time badge */}
      {decayLevel > 0 && timeAgo && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-1/2 -translate-y-1/2 right-2 z-[2] text-[10px] font-medium
            px-1.5 py-0.5 rounded-full
            bg-white/[0.04] text-muted border border-white/[0.06]
            backdrop-blur-sm"
        >
          {timeAgo}
        </motion.span>
      )}

      {/* Dissolving edge particles for 72h+ decay */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-muted/40"
              style={{
                top: `${15 + i * 14}%`,
                right: 0,
              }}
              animate={{
                x: [0, 8 + i * 3, 16 + i * 2],
                opacity: [0.4, 0.2, 0],
                scale: [1, 0.6, 0.2],
              }}
              transition={{
                duration: 2.5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

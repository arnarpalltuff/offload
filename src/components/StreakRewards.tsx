'use client';

import { motion } from 'framer-motion';
import TiltCard from './TiltCard';

interface StreakRewardsProps {
  currentStreak: number;
  bestStreak: number;
}

const MILESTONES = [
  { days: 3, label: 'Getting Started', icon: '🌱', color: 'rgba(34,197,94,0.15)', unlock: 'Lumen learns your name' },
  { days: 7, label: 'One Week', icon: '🔥', color: 'rgba(249,115,22,0.15)', unlock: 'Lumen gets casual' },
  { days: 14, label: 'Two Weeks', icon: '⚡', color: 'rgba(234,179,8,0.15)', unlock: 'Weekly AI summaries' },
  { days: 30, label: 'One Month', icon: '🏆', color: 'rgba(139,92,246,0.15)', unlock: 'Lumen knows your patterns' },
  { days: 60, label: 'Two Months', icon: '💎', color: 'rgba(99,102,241,0.15)', unlock: 'Deep pattern insights' },
  { days: 100, label: 'Centurion', icon: '👑', color: 'rgba(251,191,36,0.15)', unlock: 'Lumen becomes your advisor' },
];

export default function StreakRewards({ currentStreak, bestStreak }: StreakRewardsProps) {
  return (
    <div className="space-y-3">
      {/* Streak header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={currentStreak >= 7 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          >
            🔥
          </motion.span>
          <div>
            <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-sm text-muted ml-1">day streak</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted">Best: </span>
          <span className="text-xs font-bold text-foreground">{bestStreak} days</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {MILESTONES.map((milestone, i) => {
          const reached = currentStreak >= milestone.days;
          const isNext = !reached && (i === 0 || currentStreak >= MILESTONES[i - 1].days);
          const progress = isNext
            ? Math.min(1, (currentStreak - (i > 0 ? MILESTONES[i - 1].days : 0)) / (milestone.days - (i > 0 ? MILESTONES[i - 1].days : 0)))
            : reached ? 1 : 0;

          return (
            <TiltCard
              key={milestone.days}
              className="rounded-xl"
              glowColor={reached ? milestone.color : 'transparent'}
              intensity={reached ? 8 : 0}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card relative overflow-hidden rounded-xl p-3 ${
                  reached ? '' : 'opacity-50'
                }`}
              >
                {/* Progress fill for "next" milestone */}
                {isNext && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: milestone.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                )}
                <div className="relative flex items-center gap-3">
                  <span className={`text-xl ${reached ? '' : 'grayscale'}`}>
                    {milestone.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {milestone.label}
                      </span>
                      <span className="text-[10px] text-muted">{milestone.days} days</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      {reached ? '✓ ' : ''}{milestone.unlock}
                    </p>
                  </div>
                  {reached && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}

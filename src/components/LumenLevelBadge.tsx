'use client';

import { motion } from 'framer-motion';
import { getLumenLevel } from '@/lib/lumen-levels';

interface LumenLevelBadgeProps {
  totalDumps: number;
  compact?: boolean;
}

export default function LumenLevelBadge({ totalDumps, compact = false }: LumenLevelBadgeProps) {
  const level = getLumenLevel(totalDumps);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{
        boxShadow: `0 0 12px ${level.glowColor}, 0 0 4px ${level.glowColor}`,
        borderColor: level.coreColor + '30',
      }}
    >
      {/* Animated glow dot */}
      <motion.span
        className="inline-block rounded-full"
        style={{
          width: compact ? 6 : 8,
          height: compact ? 6 : 8,
          backgroundColor: level.coreColor,
          boxShadow: `0 0 6px ${level.coreColor}`,
        }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {!compact && (
        <span className="text-xs font-medium" style={{ color: level.coreColor }}>
          {level.name}
        </span>
      )}
      <span className="text-xs text-muted">
        Lvl {level.level}
      </span>
    </motion.div>
  );
}

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useWeather } from '@/context/WeatherContext';
import { WEATHER_CONFIGS } from '@/lib/weather';
import type { LumenLevel } from '@/lib/lumen-levels';

interface LumenAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  thinking?: boolean;
  level?: LumenLevel;
}

export default memo(function LumenAvatar({ size = 'md', thinking = false, level }: LumenAvatarProps) {
  const { weather } = useWeather();
  const config = WEATHER_CONFIGS[weather];

  // When a level is provided, override colors from weather config
  const coreColor = level?.coreColor ?? config.particleColor;
  const glowColor = level?.glowColor ?? config.particleColor;
  const orbitCount = level?.orbitCount ?? 2;

  const sizes = {
    sm: { outer: 28, mid: 20, inner: 12, ring: 34 },
    md: { outer: 36, mid: 26, inner: 16, ring: 44 },
    lg: { outer: 56, mid: 42, inner: 26, ring: 66 },
  };
  const s = sizes[size];

  // Generate orbiting dots based on orbitCount
  const orbitDots = Array.from({ length: orbitCount }, (_, i) => {
    const direction = i % 2 === 0 ? 360 : -360;
    const duration = 8 + i * 2;
    const dotSize = Math.max(3, 4 - i * 0.5);
    const startAngle = (360 / orbitCount) * i;
    return { direction, duration, dotSize, startAngle, key: i };
  });

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: s.ring, height: s.ring }}
      aria-hidden="true"
    >
      {/* Orbiting ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s.ring,
          height: s.ring,
          border: `1px solid ${coreColor}`,
          opacity: 0.2,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      {/* Dynamic orbiting dots */}
      {orbitDots.map((dot) => (
        <motion.div
          key={dot.key}
          className="absolute"
          style={{ width: s.ring, height: s.ring }}
          initial={{ rotate: dot.startAngle }}
          animate={{ rotate: dot.startAngle + dot.direction }}
          transition={{ duration: dot.duration, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: dot.dotSize,
              height: dot.dotSize,
              top: -(dot.dotSize / 2),
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: coreColor,
              boxShadow: `0 0 8px ${coreColor}`,
            }}
          />
        </motion.div>
      ))}
      {/* Thinking pulse — applied only to core elements, not orbits */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={thinking ? { scale: [1, 1.08, 1] } : {}}
        transition={thinking ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s.outer,
            height: s.outer,
            backgroundColor: glowColor,
            filter: `blur(${s.outer / 4}px)`,
          }}
          animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s.mid,
            height: s.mid,
            background: `radial-gradient(circle, ${coreColor}, transparent)`,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        {/* Core — bright white with colored shadow */}
        <div
          className="absolute rounded-full"
          style={{
            width: s.inner,
            height: s.inner,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,1), rgba(255,255,255,0.8))`,
            boxShadow: `0 0 ${s.inner}px ${coreColor}, 0 0 ${s.inner * 2}px ${coreColor}40`,
          }}
        />
      </motion.div>
    </div>
  );
});

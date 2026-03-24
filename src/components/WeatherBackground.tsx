'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather } from '@/context/WeatherContext';
import { WEATHER_CONFIGS } from '@/lib/weather';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function WeatherBackground() {
  const { weather } = useWeather();
  const config = WEATHER_CONFIGS[weather];
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const particles = useMemo(() => {
    const p: Particle[] = [];
    for (let i = 0; i < config.particleCount; i++) {
      p.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: config.particleSpeed + Math.random() * 20,
        delay: Math.random() * 10,
      });
    }
    return p;
  }, [config.particleCount, config.particleSpeed]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={weather}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          {/* Gradient layers */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${config.gradient1} 0%, transparent 60%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 70% 80%, ${config.gradient2} 0%, transparent 50%)`,
            }}
          />

          {/* Aurora bands */}
          {weather === 'aurora' && (
            <motion.div
              className="absolute inset-0 aurora-wave"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background:
                  'linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(124,58,237,0.06) 30%, transparent 60%, rgba(0,255,136,0.05) 80%, rgba(124,58,237,0.04) 100%)',
              }}
            />
          )}

          {/* Lightning flash for stormy */}
          {weather === 'stormy' && (
            <motion.div
              className="absolute inset-0 bg-white/[0.02]"
              animate={{ opacity: [0, 0, 0, 0.06, 0, 0.03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          )}

          {/* Morphing blobs */}
          <div
            className="morph-blob-1 absolute -left-1/4 -top-1/4 h-[60vh] w-[60vh] opacity-30"
            style={{
              background: `radial-gradient(circle, ${config.gradient1} 0%, transparent 70%)`,
            }}
          />
          <div
            className="morph-blob-2 absolute -bottom-1/4 -right-1/4 h-[50vh] w-[50vh] opacity-20"
            style={{
              background: `radial-gradient(circle, ${config.gradient2} 0%, transparent 70%)`,
            }}
          />

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: config.particleColor,
                left: `${p.x}%`,
                top: `${p.y}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                x: [0, 30 * (Math.random() - 0.5), -20 * (Math.random() - 0.5), 0],
                y: [0, -40 * Math.random(), 20 * (Math.random() - 0.5), 0],
                opacity: [0.3, 0.7, 0.4, 0.3],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

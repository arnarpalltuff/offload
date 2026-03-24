'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanItem, ItemCategory } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/types';

interface ThoughtDriftViewProps {
  items: PlanItem[];
  onToggle?: (id: string) => void;
}

interface BubblePosition {
  x: number;
  y: number;
}

const QUADRANTS: Record<ItemCategory, { cx: number; cy: number }> = {
  must_do: { cx: 25, cy: 25 },
  can_wait: { cx: 75, cy: 25 },
  ideas: { cx: 25, cy: 70 },
  worries: { cx: 75, cy: 70 },
};

export default function ThoughtDriftView({ items, onToggle }: ThoughtDriftViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const bubbles = useMemo(() => {
    return items.map((item, i) => {
      const quad = QUADRANTS[item.category];
      const offset = i * 137.508; // golden angle
      const x = quad.cx + Math.cos(offset) * (12 + Math.random() * 8);
      const y = quad.cy + Math.sin(offset) * (10 + Math.random() * 6);
      const size = item.priority === 1 ? 80 : item.priority === 2 ? 65 : 55;
      return { item, x: Math.max(10, Math.min(90, x)), y: Math.max(8, Math.min(85, y)), size };
    });
  }, [items]);

  // Connection lines between same-category items
  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const byCat: Record<string, BubblePosition[]> = {};
    for (const b of bubbles) {
      if (!byCat[b.item.category]) byCat[b.item.category] = [];
      byCat[b.item.category].push({ x: b.x, y: b.y });
    }
    for (const [cat, positions] of Object.entries(byCat)) {
      const color = CATEGORY_CONFIG[cat as ItemCategory].color;
      for (let i = 0; i < positions.length - 1; i++) {
        lines.push({
          x1: positions[i].x,
          y1: positions[i].y,
          x2: positions[i + 1].x,
          y2: positions[i + 1].y,
          color,
        });
      }
    }
    return lines;
  }, [bubbles]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card/50" style={{ height: 420 }}>
      {/* Category labels */}
      {Object.entries(QUADRANTS).map(([cat, pos]) => {
        const config = CATEGORY_CONFIG[cat as ItemCategory];
        const count = items.filter((i) => i.category === cat).length;
        if (count === 0) return null;
        return (
          <div
            key={cat}
            className="absolute text-[10px] font-medium uppercase tracking-wider"
            style={{
              left: `${pos.cx}%`,
              top: `${pos.cy - 14}%`,
              transform: 'translateX(-50%)',
              color: config.color,
              opacity: 0.5,
            }}
          >
            {config.icon} {config.label}
          </div>
        );
      })}

      {/* Connection lines */}
      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
        {connections.map((line, i) => (
          <motion.line
            key={i}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke={line.color}
            strokeWidth={1}
            strokeOpacity={0.15}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}
      </svg>

      {/* Thought bubbles */}
      {bubbles.map((bubble, i) => {
        const config = CATEGORY_CONFIG[bubble.item.category];
        const isExpanded = expanded === bubble.item.id;
        const truncated =
          bubble.item.text.length > 25
            ? bubble.item.text.slice(0, 25) + '...'
            : bubble.item.text;

        return (
          <motion.div
            key={bubble.item.id}
            className="absolute cursor-pointer select-none"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isExpanded ? 10 : 1,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: bubble.item.completed ? 0.4 : 1,
              scale: 1,
              x: [0, Math.random() * 6 - 3, Math.random() * 4 - 2, 0],
              y: [0, Math.random() * 8 - 4, Math.random() * 6 - 3, 0],
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 },
              x: { duration: 12 + Math.random() * 8, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 10 + Math.random() * 8, repeat: Infinity, ease: 'easeInOut' },
            }}
            drag
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            dragElastic={0.1}
            whileDrag={{ scale: 1.15, zIndex: 20 }}
            onClick={() => setExpanded(isExpanded ? null : bubble.item.id)}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-56 rounded-2xl border-2 bg-card p-4"
                  style={{ borderColor: config.color + '40' }}
                >
                  <p className="text-sm leading-relaxed text-foreground">{bubble.item.text}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: config.color }}>
                      {config.icon} {config.label}
                    </span>
                    {onToggle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(bubble.item.id);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          bubble.item.completed
                            ? 'bg-primary/20 text-primary'
                            : 'bg-border text-muted hover:bg-border-bright'
                        }`}
                      >
                        {bubble.item.completed ? 'Done ✓' : 'Complete'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="bubble"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="flex items-center justify-center rounded-full border-2 p-2 text-center"
                  style={{
                    width: bubble.size,
                    height: bubble.size,
                    borderColor: config.color + '40',
                    backgroundColor: config.bg,
                    boxShadow: `0 0 ${bubble.size / 3}px ${config.color}15`,
                  }}
                >
                  <span className="text-[10px] font-medium leading-tight text-foreground/80">
                    {truncated}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

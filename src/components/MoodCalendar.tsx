'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MOOD_COLORS } from '@/lib/types';

interface MoodDay {
  date: string;
  score: number;
}

interface MoodCalendarProps {
  data: MoodDay[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function MoodCalendar({ data }: MoodCalendarProps) {
  const weeks = useMemo(() => {
    const today = new Date();
    const grid: (MoodDay | null)[] = [];

    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = data.find((m) => m.date === dateStr);
      grid.push(entry || null);
    }

    const firstDate = new Date(today);
    firstDate.setDate(firstDate.getDate() - 34);
    const startDow = (firstDate.getDay() + 6) % 7;
    const paddedGrid: (MoodDay | null | 'empty')[] = [];
    for (let i = 0; i < startDow; i++) paddedGrid.push('empty');
    paddedGrid.push(...grid);
    while (paddedGrid.length % 7 !== 0) paddedGrid.push('empty');

    const w: (MoodDay | null | 'empty')[][] = [];
    for (let i = 0; i < paddedGrid.length; i += 7) {
      w.push(paddedGrid.slice(i, i + 7));
    }
    return w;
  }, [data]);

  if (weeks.length === 0) return null;

  return (
    <div role="img" aria-label="Mood calendar showing daily mood scores for the last 5 weeks">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[9px] text-muted/50 font-medium">
            {label}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell, di) => {
              if (cell === 'empty') {
                return <div key={di} className="aspect-square rounded-sm" />;
              }
              if (cell === null) {
                return (
                  <div
                    key={di}
                    className="aspect-square rounded-sm bg-border/30"
                    title="No entry"
                  />
                );
              }
              return (
                <motion.div
                  key={di}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.015 }}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: MOOD_COLORS[cell.score] + '90',
                    boxShadow: `0 0 6px ${MOOD_COLORS[cell.score]}30`,
                  }}
                  title={`${cell.date}: ${cell.score}/5`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-1">
        <span className="text-[9px] text-muted/50 mr-1">Low</span>
        {[1, 2, 3, 4, 5].map((score) => (
          <div
            key={score}
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: MOOD_COLORS[score] + '90' }}
          />
        ))}
        <span className="text-[9px] text-muted/50 ml-1">High</span>
      </div>
    </div>
  );
}

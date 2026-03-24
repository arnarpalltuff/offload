'use client';

import { motion } from 'framer-motion';

const MOODS = [
  { score: 1, emoji: '😔', label: 'Rough' },
  { score: 2, emoji: '😕', label: 'Meh' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '😊', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
];

interface MoodSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3" role="radiogroup" aria-label="Rate your mood">
      {MOODS.map((mood) => {
        const isSelected = value === mood.score;
        return (
          <motion.button
            key={mood.score}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(mood.score)}
            animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Rate mood as ${mood.label}`}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition-colors ${
              isSelected
                ? 'border-primary bg-primary/10 glow-green'
                : 'glass-card border-transparent hover:border-border-bright'
            }`}
          >
            <span className="text-2xl">
              {mood.emoji}
            </span>
            <span className={`text-[10px] font-medium ${isSelected ? 'text-primary' : 'text-muted'}`}>
              {mood.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

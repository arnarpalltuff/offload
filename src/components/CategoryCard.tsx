'use client';

import { motion } from 'framer-motion';
import type { PlanItem, ItemCategory } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/types';
import ThoughtDecay from '@/components/ThoughtDecay';

interface CategoryCardProps {
  category: ItemCategory;
  items: PlanItem[];
  delay?: number;
  onToggle?: (id: string) => void;
  interactive?: boolean;
}

export default function CategoryCard({ category, items, delay = 0, onToggle, interactive = false }: CategoryCardProps) {
  const config = CATEGORY_CONFIG[category];

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50"
        style={{ backgroundColor: config.bg }}
      >
        <span className="text-lg" aria-hidden="true">{config.icon}</span>
        <span className="text-sm font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
        <span className="ml-auto text-xs text-muted">{items.length}</span>
      </div>
      <div className="divide-y divide-border/30">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.05 * i }}
          >
            <ThoughtDecay createdAt={item.created_at} completed={item.completed}>
              <div
                className={`flex items-start gap-3 px-4 py-3 ${interactive ? 'cursor-pointer hover:bg-card-hover' : ''}`}
                role={interactive ? 'checkbox' : undefined}
                aria-checked={interactive ? item.completed : undefined}
                aria-label={interactive ? `${item.completed ? 'Uncheck' : 'Check'}: ${item.text}` : undefined}
                tabIndex={interactive ? 0 : undefined}
                onClick={() => interactive && onToggle?.(item.id)}
                onKeyDown={(e) => { if (interactive && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onToggle?.(item.id); } }}
              >
                {interactive && (
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                    item.completed
                      ? 'border-primary bg-primary/20'
                      : 'border-border'
                  }`}>
                    {item.completed && (
                      <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
                <span className={`text-sm leading-relaxed ${item.completed ? 'text-muted line-through' : 'text-foreground'}`}>
                  {item.text}
                </span>
              </div>
            </ThoughtDecay>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

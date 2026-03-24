'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanItem, ItemCategory } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/types';
import { getTodayDate, formatDate } from '@/lib/utils';
import Link from 'next/link';
import TiltCard from '@/components/TiltCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import MagneticButton from '@/components/MagneticButton';
import { useToast } from '@/components/Toast';

const CATEGORY_ORDER: ItemCategory[] = ['must_do', 'can_wait', 'ideas', 'worries'];

export default function PlanPage() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/entries?date=${getTodayDate()}`);
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        toast('Failed to load your plan. Please try refreshing.', 'error');
      }
      setLoading(false);
    }
    load();
  }, [toast]);

  async function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    try {
      const item = items.find((i) => i.id === id);
      await fetch('/api/plan/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: id, completed: !item?.completed }),
      });
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
      toast('Failed to update task. Please try again.', 'error');
    }
  }

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<ItemCategory>('must_do');
  const addInputRef = useRef<HTMLInputElement>(null);

  function addTask() {
    const text = newTaskText.trim();
    if (!text) return;
    const newItem: PlanItem = {
      id: `manual_${Date.now()}`,
      text,
      category: newTaskCategory,
      priority: 3,
      completed: false,
      notes: '',
      created_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, newItem]);
    setNewTaskText('');
    setShowAddTask(false);
    toast('Task added', 'success');
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const completedCount = items.filter((i) => i.completed).length;
  const totalActionable = items.filter((i) => i.category === 'must_do' || i.category === 'can_wait').length;
  const completedActionable = items.filter((i) => (i.category === 'must_do' || i.category === 'can_wait') && i.completed).length;
  const progressPct = totalActionable > 0 ? (completedActionable / totalActionable) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-shimmer rounded-lg" />
        <div className="h-4 w-full animate-shimmer rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <motion.div
          className="text-5xl"
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          📋
        </motion.div>
        <div>
          <h2 className="text-xl font-bold">No Plan for Today</h2>
          <p className="mt-1 text-sm text-muted">
            Do a brain dump and Lumen will organize it into your daily plan.
          </p>
        </div>
        <MagneticButton className="rounded-xl bg-primary px-6 py-3 font-semibold text-background">
          <Link href="/dump">Start Today&apos;s Dump</Link>
        </MagneticButton>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold">Today&apos;s Plan</h1>
        <p className="text-sm text-muted">{formatDate(getTodayDate())}</p>
      </div>

      {/* Progress bar */}
      <TiltCard className="glass-card rounded-2xl p-4" glowColor={`rgba(0,255,136,${progressPct / 300})`} intensity={5}>
        <div className="flex justify-between text-xs text-muted">
          <span>
            <AnimatedCounter value={completedActionable} /> of {totalActionable} tasks done
          </span>
          <span><AnimatedCounter value={Math.round(progressPct)} suffix="%" /></span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border/50">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00FF88, #00dd77)',
              boxShadow: '0 0 12px rgba(0,255,136,0.4)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </TiltCard>

      {/* Add Task */}
      <AnimatePresence>
        {showAddTask ? (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <input
                ref={addInputRef}
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="What needs to get done?"
                className="w-full bg-transparent text-sm text-foreground placeholder-muted/40 outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {CATEGORY_ORDER.map((cat) => {
                    const config = CATEGORY_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewTaskCategory(cat)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-all ${
                          newTaskCategory === cat
                            ? 'bg-white/10 text-foreground'
                            : 'text-muted hover:text-foreground'
                        }`}
                      >
                        {config.icon} {config.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowAddTask(false); setNewTaskText(''); }}
                    className="rounded-lg px-3 py-1.5 text-xs text-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTask}
                    disabled={!newTaskText.trim()}
                    className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-30"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddTask(true);
              setTimeout(() => addInputRef.current?.focus(), 100);
            }}
            className="glass-card glass-card-hover flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-muted transition-all hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </motion.button>
        )}
      </AnimatePresence>

      {/* Items grouped by category */}
      {CATEGORY_ORDER.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        const config = CATEGORY_CONFIG[cat];

        return (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm">{config.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
            <div className="space-y-1.5">
              {catItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                  layout
                  onClick={() => toggleItem(item.id)}
                  className={`glass-card flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-all ${
                    item.completed
                      ? 'opacity-50'
                      : 'glass-card-hover hover:shadow-[0_0_20px_rgba(0,255,136,0.04)]'
                  }`}
                >
                  <motion.div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      item.completed
                        ? 'border-primary bg-primary/20'
                        : 'border-border-bright'
                    }`}
                    whileTap={{ scale: 0.8 }}
                  >
                    {item.completed && (
                      <motion.svg
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="h-3 w-3 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.div>
                  <span className={`flex-1 text-sm leading-relaxed transition-all ${
                    item.completed ? 'text-muted line-through' : 'text-foreground'
                  }`}>
                    {item.text}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    className="shrink-0 rounded-md p-1 text-muted/30 transition-colors hover:text-danger/60"
                    aria-label="Remove task"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {completedCount === items.length && items.length > 0 && (
        <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.2)">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="glass-card rounded-2xl border-primary/20 p-6 text-center glow-green"
          >
            <motion.div
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🎉
            </motion.div>
            <p className="mt-2 text-lg font-bold text-primary">All done!</p>
            <p className="mt-1 text-sm text-muted">Time to reflect on your day.</p>
            <MagneticButton className="mt-3 inline-block rounded-xl bg-calm px-5 py-2.5 text-sm font-semibold text-white">
              <Link href="/reflect">Evening Reflection</Link>
            </MagneticButton>
          </motion.div>
        </TiltCard>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriftModeProps {
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export default function DriftMode({ onComplete, onCancel }: DriftModeProps) {
  const [text, setText] = useState('');
  const [idle, setIdle] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  function handleChange(val: string) {
    setText(val);
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (val.trim().length > 0) setIdle(true);
    }, 5000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background"
    >
      {/* Morphing ambient blobs */}
      <div
        className="morph-blob-1 pointer-events-none absolute -left-1/3 -top-1/3 h-[70vh] w-[70vh] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="morph-blob-2 pointer-events-none absolute -bottom-1/3 -right-1/3 h-[60vh] w-[60vh] opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
      />

      {/* Breathing border */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-none"
        style={{
          border: '2px solid transparent',
          backgroundImage:
            'linear-gradient(var(--color-background), var(--color-background)), radial-gradient(circle, rgba(0,255,136,0.3), rgba(124,58,237,0.2))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Close button */}
      <button
        onClick={onCancel}
        aria-label="Close drift mode"
        className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted transition-colors hover:text-foreground"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Drift label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-muted"
      >
        drift mode
      </motion.div>

      {/* Main text area — minimal, centered */}
      <div className="w-full max-w-lg px-8">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Let your thoughts flow..."
          className="min-h-[200px] w-full bg-transparent text-center text-lg leading-relaxed text-foreground/90 placeholder-muted/30 caret-primary typing-cursor"
          style={{ caretColor: 'var(--color-primary)' }}
        />
      </div>

      {/* AI listening indicator */}
      <AnimatePresence>
        {idle && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 flex items-center gap-2"
          >
            <motion.div
              className="flex gap-1.5"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            </motion.div>
            <span className="text-xs text-muted/60">Lumen is listening</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done button */}
      <AnimatePresence>
        {text.trim().length > 20 && (
          <motion.button
            key="done-btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => onComplete(text)}
            className="group relative mt-10 overflow-hidden rounded-2xl px-10 py-4 text-lg font-bold text-background"
          >
            <div className="gradient-primary absolute inset-0 transition-opacity group-hover:opacity-90" />
            <span className="relative">Organize These Thoughts</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

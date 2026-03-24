'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickCaptureBarProps {
  onCapture: (text: string) => void;
}

// Floating quick capture — one-tap to jot a thought from anywhere
export default function QuickCaptureBar({ onCapture }: QuickCaptureBarProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (!text.trim()) return;
    onCapture(text.trim());
    setText('');
    setOpen(false);
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {!open ? (
          /* Floating capture button */
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            aria-label="Quick capture"
            className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #00FF88, #00bb66)',
              boxShadow: '0 0 24px rgba(0,255,136,0.3), 0 4px 12px rgba(0,0,0,0.3)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="h-5 w-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        ) : (
          /* Expanded capture bar */
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 z-40 glass-card rounded-2xl p-3 glow-green"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Quick thought..."
                aria-label="Quick thought input"
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted/40 outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/30 disabled:opacity-30"
              >
                Save
              </button>
              <button
                onClick={() => { setOpen(false); setText(''); }}
                aria-label="Close quick capture"
                className="rounded-lg px-2 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

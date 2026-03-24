'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CATEGORY_CONFIG, MOOD_EMOJIS } from '@/lib/types';
import type { SearchResult } from '@/app/api/search/route';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  dump: { icon: '🧠', color: 'var(--color-primary)' },
  reflection: { icon: '🌙', color: 'var(--color-calm)' },
  task: { icon: '📋', color: '#F59E0B' },
};

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  // Show a window around the match
  const contextChars = 60;
  const start = Math.max(0, idx - contextChars);
  const end = Math.min(text.length, idx + query.length + contextChars);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  const before = text.slice(start, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length, end);

  return (
    <>
      {prefix}{before}
      <mark className="rounded-sm bg-primary/25 px-0.5 text-foreground">{match}</mark>
      {after}{suffix}
    </>
  );
}

function formatDateShort(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  function navigateToResult(result: SearchResult) {
    setOpen(false);
    router.push(`/journal?date=${result.date}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="search-modal"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-[12vh] z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2"
          >
            <div className="glass-card overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
                <svg
                  className="h-5 w-5 shrink-0 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search your thoughts..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted/50 outline-none"
                  aria-label="Search your thoughts"
                />
                {loading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                )}
                <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto">
                {query.length >= 2 && !loading && results.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <div className="mb-2 text-2xl" aria-hidden="true">🔍</div>
                    <p className="text-sm text-muted">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-muted/60">
                      Try a different keyword or phrase
                    </p>
                  </div>
                )}

                {query.length < 2 && !loading && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-muted/60">
                      Type at least 2 characters to search across your dumps, reflections, and tasks
                    </p>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="py-1" role="listbox" aria-label="Search results">
                    {results.map((result, i) => {
                      const typeInfo = TYPE_ICONS[result.type];
                      const isSelected = i === selectedIndex;
                      return (
                        <button
                          key={`${result.type}-${result.date}-${i}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => navigateToResult(result)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${
                            isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <span className="mt-0.5 text-sm" aria-hidden="true">{typeInfo.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider"
                                style={{ color: typeInfo.color }}
                              >
                                {result.context || result.type}
                              </span>
                              {result.type === 'task' && result.category && (
                                <span
                                  className="text-[10px]"
                                  style={{ color: CATEGORY_CONFIG[result.category as keyof typeof CATEGORY_CONFIG]?.color }}
                                >
                                  {CATEGORY_CONFIG[result.category as keyof typeof CATEGORY_CONFIG]?.label}
                                </span>
                              )}
                              {result.mood && (
                                <span className="text-xs">{MOOD_EMOJIS[result.mood]}</span>
                              )}
                              <span className="ml-auto text-[10px] text-muted/50">
                                {formatDateShort(result.date)}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-foreground/70">
                              {highlightMatch(result.text, query)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-white/5 px-4 py-2">
                <div className="flex gap-3 text-[10px] text-muted/50">
                  <span><kbd className="rounded border border-white/10 px-1">↑↓</kbd> navigate</span>
                  <span><kbd className="rounded border border-white/10 px-1">↵</kbd> open</span>
                  <span><kbd className="rounded border border-white/10 px-1">esc</kbd> close</span>
                </div>
                {results.length > 0 && (
                  <span className="text-[10px] text-muted/40">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

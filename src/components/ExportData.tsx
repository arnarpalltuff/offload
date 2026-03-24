'use client';

import { motion } from 'framer-motion';
import type { OrganizedDump } from '@/lib/types';
import { CATEGORY_CONFIG, type ItemCategory } from '@/lib/types';

interface ExportDataProps {
  organized: OrganizedDump | null;
  locked?: boolean;
}

function generateTextExport(organized: OrganizedDump): string {
  const sections: string[] = ['=== Offload — Brain Dump Export ===', ''];

  const categories: ItemCategory[] = ['must_do', 'can_wait', 'ideas', 'worries'];
  for (const cat of categories) {
    const items = organized[cat];
    if (items.length === 0) continue;
    const config = CATEGORY_CONFIG[cat];
    sections.push(`${config.icon} ${config.label}`);
    sections.push('-'.repeat(30));
    for (const item of items) {
      const status = item.completed ? '[x]' : '[ ]';
      sections.push(`  ${status} ${item.text}`);
    }
    sections.push('');
  }

  if (organized.summary) {
    sections.push('Summary');
    sections.push('-'.repeat(30));
    sections.push(organized.summary);
    sections.push('');
  }

  return sections.join('\n');
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExportData({ organized, locked = false }: ExportDataProps) {
  if (!organized) return null;

  function handleExportText() {
    if (!organized || locked) return;
    const text = generateTextExport(organized);
    triggerDownload(text, 'offload-export.txt', 'text/plain');
  }

  function handleExportJSON() {
    if (!organized || locked) return;
    const json = JSON.stringify(organized, null, 2);
    triggerDownload(json, 'offload-export.json', 'application/json');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex gap-3"
    >
      <button
        onClick={handleExportText}
        aria-label={locked ? 'Export as Text — requires Pro upgrade' : 'Export as Text'}
        className={`glass-card flex-1 rounded-xl py-2.5 text-xs font-medium transition-all ${
          locked
            ? 'text-muted/40 cursor-not-allowed opacity-50'
            : 'glass-card-hover text-muted hover:text-foreground'
        }`}
        disabled={locked}
      >
        <span className="flex items-center justify-center gap-1.5">
          {locked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          Export as Text
          {locked && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">PRO</span>}
        </span>
      </button>
      <button
        onClick={handleExportJSON}
        aria-label={locked ? 'Export as JSON — requires Pro upgrade' : 'Export as JSON'}
        className={`glass-card flex-1 rounded-xl py-2.5 text-xs font-medium transition-all ${
          locked
            ? 'text-muted/40 cursor-not-allowed opacity-50'
            : 'glass-card-hover text-muted hover:text-foreground'
        }`}
        disabled={locked}
      >
        <span className="flex items-center justify-center gap-1.5">
          {locked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          Export as JSON
          {locked && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">PRO</span>}
        </span>
      </button>
    </motion.div>
  );
}

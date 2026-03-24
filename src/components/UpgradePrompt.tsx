'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface UpgradePromptProps {
  feature: string;
  description: string;
}

export default function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card rounded-2xl p-5"
      style={{
        borderColor: 'rgba(0, 255, 136, 0.15)',
        boxShadow:
          '0 0 30px rgba(0, 255, 136, 0.06), 0 0 60px rgba(0, 255, 136, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
        >
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </motion.div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">{feature}</h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>
        </div>

        <Link
          href="/pricing"
          className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]"
        >
          Upgrade to Pro
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}

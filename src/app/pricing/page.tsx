'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const FREE_FEATURES = [
  '3 brain dumps per week',
  'Basic AI organizing',
  'Mood tracking',
  'Daily prompts',
  'Lumen Spark level (level 1\u20132)',
];

const PRO_FEATURES = [
  'Everything in Free, plus:',
  'Unlimited brain dumps',
  'Full Lumen Evolution (all 5 levels)',
  'Voice journaling',
  'Export & share',
  'Weekly AI summaries',
  'Gratitude journaling',
  'Priority AI responses',
  'Thought Decay insights',
];

const FAQ_ITEMS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, no questions asked. Cancel from your account settings and you won\u2019t be charged again.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your data is encrypted in transit and at rest, and never shared with third parties.',
  },
  {
    q: 'Does it work offline?',
    a: 'AI-powered features require an internet connection. Your data is saved locally so you can review past entries anytime.',
  },
  {
    q: 'What happens if I downgrade?',
    a: 'You keep all your data. Premium features simply lock until you resubscribe.',
  },
];

function CheckIcon({ color = '#00FF88' }: { color?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <span className="text-sm font-medium text-[#e2e8f0] pr-4">{q}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-[#94a3b8] leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#050810' }}>
      {/* Background gradient effects */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,255,136,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99,102,241,0.05) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(124,58,237,0.04) 0%, transparent 50%)
          `,
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 md:px-10 py-5 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold gradient-text-animated">
          Offload
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium px-5 py-2 rounded-full transition-all duration-300"
          style={{
            background: 'rgba(0,255,136,0.08)',
            color: '#00FF88',
            border: '1px solid rgba(0,255,136,0.2)',
          }}
        >
          Sign In
        </Link>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center pt-12 md:pt-20 pb-14 md:pb-20"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Simple, honest{' '}
            <span className="gradient-text-animated">pricing</span>
          </h1>
          <p className="text-lg text-[#94a3b8] max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pb-20 md:pb-28">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-card glass-card-hover rounded-3xl p-7 md:p-8 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">Free</h2>
              <p className="text-sm text-[#64748b]">For getting started</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-black text-[#e2e8f0]">$0</span>
              <span className="text-sm text-[#64748b] ml-1">/forever</span>
            </div>

            <ul className="space-y-3.5 mb-8 flex-1">
              {FREE_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckIcon color="#64748b" />
                  <span className="text-sm text-[#94a3b8]">{feat}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block w-full text-center py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Get Started
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card glow-green rounded-3xl p-7 md:p-8 flex flex-col relative"
            style={{
              border: '1px solid rgba(0,255,136,0.3)',
            }}
          >
            {/* Most Popular badge */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #00FF88, #00cc6a)',
                color: '#050810',
              }}
            >
              Most Popular
            </div>

            <div className="mb-6 mt-2">
              <h2 className="text-lg font-semibold text-[#e2e8f0] mb-1">Pro</h2>
              <p className="text-sm text-[#64748b]">For serious thinkers</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-black text-[#e2e8f0]">$9.99</span>
              <span className="text-sm text-[#64748b] ml-1">/month</span>
            </div>

            <ul className="space-y-3.5 mb-8 flex-1">
              {PRO_FEATURES.map((feat, i) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckIcon color={i === 0 ? '#6366f1' : '#00FF88'} />
                  <span
                    className={`text-sm ${
                      i === 0
                        ? 'text-[#6366f1] font-medium'
                        : 'text-[#e2e8f0]'
                    }`}
                  >
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/login?plan=pro"
              className="block w-full text-center py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #00FF88, #00cc6a)',
                color: '#050810',
                boxShadow: '0 0 40px rgba(0,255,136,0.2), 0 0 80px rgba(0,255,136,0.08)',
              }}
            >
              Upgrade to Pro
            </Link>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="pb-24 md:pb-32 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Frequently asked{' '}
            <span className="gradient-text-animated">questions</span>
          </h2>
          <p className="text-center text-[#64748b] text-sm mb-10">
            Everything you need to know before you start.
          </p>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-white/5">
          <Link href="/" className="text-sm gradient-text-animated font-bold mb-2 inline-block">
            Offload
          </Link>
          <p className="text-xs text-[#64748b] mt-3">Clear your head. One dump at a time.</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#e2e8f0] transition-colors">Home</Link>
            <Link href="/login" className="hover:text-[#e2e8f0] transition-colors">Sign In</Link>
            <Link href="/privacy" className="hover:text-[#e2e8f0] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#e2e8f0] transition-colors">Terms</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

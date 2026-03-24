'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import LumenAvatar from '@/components/LumenAvatar';

const GETTING_STARTED = [
  {
    title: 'Brain Dump',
    icon: '🧠',
    desc: 'Go to the Dump tab and type or speak everything on your mind. Don\'t worry about structure — just get it out. Lumen (our AI) will organize it into action items, ideas, worries, and things that can wait.',
  },
  {
    title: 'Plan Your Day',
    icon: '📋',
    desc: 'After your dump, head to the Plan tab. Your thoughts are now sorted into categories. Tap items to mark them done. Add new tasks if needed.',
  },
  {
    title: 'Reflect',
    icon: '🌙',
    desc: 'At the end of your day, visit the Reflect tab. Rate your mood and optionally write a note. Lumen will give you a personalized insight about your day.',
  },
  {
    title: 'Track Patterns',
    icon: '📊',
    desc: 'The Insights tab shows your mood trends, recurring themes, completion rates, and streaks over time. The more you use Offload, the smarter it gets.',
  },
  {
    title: 'Let Go',
    icon: '🕊️',
    desc: 'In the Journal tab, tap "Let Go Ritual" to review thoughts from the past week that you never acted on. Swipe right to release them, or left to keep. Most worries resolve themselves.',
  },
];

const FAQ = [
  {
    q: 'How does the AI organize my thoughts?',
    a: 'Lumen reads your brain dump and sorts each thought into one of four categories: Must Do Today (urgent actions), Can Wait (lower priority), Ideas (creative thoughts to revisit), and On My Mind (worries and feelings). It also writes a personalized summary.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Your data is encrypted in transit and at rest. We never share your personal information with third parties. You can export or delete all your data anytime from Account settings.',
  },
  {
    q: 'What does Lumen do?',
    a: 'Lumen is your AI companion. It organizes your dumps, gives reflection insights, generates morning oracles, and evolves as you use the app (from Spark to Nova, across 5 levels). Lumen gets to know your patterns over time.',
  },
  {
    q: 'What\'s the difference between Free and Pro?',
    a: 'Free gives you 3 brain dumps per week, basic AI organizing, and mood tracking. Pro unlocks unlimited dumps, voice journaling, gratitude capture, export/share, weekly AI summaries, and all 5 Lumen evolution levels.',
  },
  {
    q: 'Can I use Offload offline?',
    a: 'You can view your past entries and navigate the app offline. AI-powered features (organizing, reflections, oracle) need an internet connection since they process on our servers.',
  },
  {
    q: 'How do streaks work?',
    a: 'You earn a streak day each time you do a brain dump. The counter resets if you miss a day. Streaks unlock Lumen level milestones at 3, 7, 14, 30, 60, and 100 days.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Account → scroll to Danger Zone → Delete Account. You\'ll need to type "DELETE" to confirm. This permanently removes all your data from our servers.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="glass-card w-full rounded-2xl p-4 text-left transition-all hover:bg-white/[0.02]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{q}</span>
          <svg
            className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <AnimatePresence>
          {open && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-xs leading-relaxed text-muted overflow-hidden"
            >
              {a}
            </motion.p>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export default function HelpPage() {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'question'>('question');

  function handleSendFeedback() {
    if (!feedbackText.trim()) return;

    // Store feedback locally (in a real app, this would go to a backend)
    const existing = JSON.parse(localStorage.getItem('offload_feedback') || '[]');
    existing.push({
      type: feedbackType,
      text: feedbackText,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('offload_feedback', JSON.stringify(existing));

    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 3000);
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center gap-3">
        <LumenAvatar size="sm" />
        <div>
          <h1 className="text-xl font-bold">Help & Support</h1>
          <p className="text-xs text-muted">Everything you need to get the most out of Offload</p>
        </div>
      </div>

      {/* Getting Started */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary/70">Getting Started</h2>
        <div className="space-y-2">
          {GETTING_STARTED.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg" aria-hidden="true">{step.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary/70">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </section>

      {/* Send Feedback / Support */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary/70">Send Feedback</h2>
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div className="flex gap-2">
            {(['question', 'bug', 'feature'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFeedbackType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  feedbackType === type
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/5 text-muted hover:text-foreground'
                }`}
              >
                {type === 'question' ? 'Question' : type === 'bug' ? 'Bug Report' : 'Feature Request'}
              </button>
            ))}
          </div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              feedbackType === 'bug'
                ? 'Describe what happened and what you expected...'
                : feedbackType === 'feature'
                  ? 'What feature would make Offload better for you?'
                  : 'How can we help?'
            }
            aria-label="Feedback message"
            className="glass-input min-h-[100px] w-full rounded-xl p-3 text-sm text-foreground placeholder-muted/40"
          />
          <AnimatePresence mode="wait">
            {feedbackSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Thanks for your feedback! We&apos;ll look into it.
              </motion.div>
            ) : (
              <motion.button
                key="send"
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim()}
                className="w-full rounded-xl bg-primary/20 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/30 disabled:opacity-30"
              >
                Send Feedback
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Quick links */}
      <section className="space-y-2">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary/70">Quick Links</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/privacy"
            className="glass-card flex items-center gap-2 rounded-xl p-3 text-xs font-medium text-muted transition-all hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="glass-card flex items-center gap-2 rounded-xl p-3 text-xs font-medium text-muted transition-all hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Terms of Service
          </Link>
          <Link
            href="/pricing"
            className="glass-card flex items-center gap-2 rounded-xl p-3 text-xs font-medium text-muted transition-all hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pricing
          </Link>
          <Link
            href="/account"
            className="glass-card flex items-center gap-2 rounded-xl p-3 text-xs font-medium text-muted transition-all hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account
          </Link>
        </div>
      </section>

      <div className="text-center text-[10px] text-muted/40 pt-4">
        <p>Offload v1.0.0</p>
      </div>
    </div>
  );
}

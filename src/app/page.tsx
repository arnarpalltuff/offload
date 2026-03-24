'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/* ─── tiny reusable hook ─── */
function useAnimateInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
}

/* ─── animated demo component ─── */
function ThoughtDemo() {
  const [phase, setPhase] = useState(0); // 0 = messy, 1 = organizing, 2 = organized
  useEffect(() => {
    const cycle = () => {
      setPhase(0);
      setTimeout(() => setPhase(1), 2200);
      setTimeout(() => setPhase(2), 3400);
      setTimeout(() => setPhase(0), 7000);
    };
    cycle();
    const id = setInterval(cycle, 7000);
    return () => clearInterval(id);
  }, []);

  const messy = [
    "need to call mom back...",
    "presentation due friday omg",
    "should I take that job offer?",
    "buy groceries, milk eggs bread",
    "I feel overwhelmed lately",
    "app idea: dog walking service",
  ];

  const organized = [
    { label: "Must Do", color: "#EF4444", items: ["Presentation due Friday", "Call mom back"] },
    { label: "Can Wait", color: "#F59E0B", items: ["Buy groceries"] },
    { label: "Ideas", color: "#8B5CF6", items: ["Dog walking app"] },
    { label: "Worries", color: "#6366F1", items: ["Job offer decision", "Feeling overwhelmed"] },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto h-[340px] mt-10">
      {/* Messy phase */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 glass-card rounded-2xl p-5 overflow-hidden"
          >
            <div className="text-xs text-[#64748b] mb-3 font-mono">brain_dump.txt</div>
            {messy.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.25, duration: 0.3 }}
                className="text-sm text-[#94a3b8] mb-1.5 font-mono leading-relaxed"
              >
                {t}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-[#00FF88] mt-1"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organizing phase */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#00FF88", borderRightColor: "#6366f1" }}
            />
            <span className="absolute text-xs text-[#64748b] mt-20">Lumen is organizing...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organized phase */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 grid grid-cols-2 gap-2.5 p-1"
          >
            {organized.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.12, duration: 0.4, type: "spring" }}
                className="glass-card rounded-xl p-3"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: cat.color }}>
                  {cat.label}
                </div>
                {cat.items.map((item, j) => (
                  <div key={j} className="text-xs text-[#e2e8f0] mb-1 leading-snug">{item}</div>
                ))}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── section wrapper ─── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useAnimateInView(0.1);
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`px-5 md:px-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ─── animated card (avoids hooks in .map callbacks) ─── */
function AnimatedCard({
  children,
  delay = 0,
  className = '',
  y = 30,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const { ref, inView } = useAnimateInView();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── main page ─── */
export default function LandingPage() {
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
        <div className="text-xl font-bold gradient-text-animated">Offload</div>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="text-sm font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
          >
            Pricing
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
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ═══════ HERO ═══════ */}
        <section className="px-5 md:px-8 pt-12 md:pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-8 text-xs text-[#64748b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              AI-powered thought organizer
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-6">
              <span className="gradient-text-animated">Offload</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#94a3b8] font-light max-w-lg mx-auto mb-4 leading-relaxed">
              Where overthinking{' '}
              <span className="text-[#e2e8f0] font-medium">ends.</span>
            </p>

            <p className="text-sm text-[#64748b] max-w-md mx-auto mb-10">
              Dump your messy thoughts. Our AI companion Lumen sorts them into
              what matters, what can wait, and what to let go of.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #00FF88, #00cc6a)',
                color: '#050810',
                boxShadow: '0 0 40px rgba(0,255,136,0.25), 0 0 80px rgba(0,255,136,0.1)',
              }}
            >
              Start Dumping — It&apos;s Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <ThoughtDemo />
          </motion.div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <Section className="py-20 md:py-28">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
            How it <span className="gradient-text-animated">works</span>
          </h2>
          <p className="text-center text-[#64748b] mb-14 max-w-md mx-auto">
            Three steps. Thirty seconds. Total clarity.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                    <path d="M9 21h6M10 17v4M14 17v4" />
                  </svg>
                ),
                title: 'Dump Everything',
                desc: "Type or speak whatever's on your mind. Don't filter, don't organize — just let it out.",
              },
              {
                step: '02',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 3.2 3.5.5-2.5 2.5.6 3.5L12 11l-3.1 1.7.6-3.5L7 6.7l3.5-.5z" />
                    <path d="M5 19l2-4M19 19l-2-4M12 15v6" />
                  </svg>
                ),
                title: 'AI Organizes',
                desc: 'Lumen, your AI companion, sorts the chaos into must-do, can-wait, ideas, and worries.',
              },
              {
                step: '03',
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c-4 0-8-2-8-8 0-4 4-8 4-14 1 3 4 3 4 3s1-2 2-4c1 2 2 4 2 4s3 0 4-3c0 6 4 10 4 14 0 6-4 8-8 8z" />
                    <path d="M12 22v-6" />
                  </svg>
                ),
                title: 'Reflect & Grow',
                desc: 'Track your mood, spot patterns, build streaks. Watch your mental clarity compound.',
              },
            ].map((item, i) => (
              <AnimatedCard
                key={item.step}
                delay={i * 0.15}
                className="glass-card glass-card-hover rounded-2xl p-6 text-center"
              >
                <div className="text-xs font-mono text-[#64748b] mb-4">{item.step}</div>
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-[#e2e8f0] mb-2">{item.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{item.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </Section>

        {/* ═══════ FEATURE SHOWCASE ═══════ */}
        <Section className="py-20 md:py-28">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
            Everything you need to <span className="gradient-text-animated">stop overthinking</span>
          </h2>
          <p className="text-center text-[#64748b] mb-14 max-w-lg mx-auto">
            Built for the way your brain actually works — messy, fast, and nonlinear.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: '🎙',
                title: 'Voice Journaling',
                desc: 'Talk it out. Speech-to-text captures every thought, even the half-formed ones. Pro feature.',
                accent: '#00FF88',
              },
              {
                icon: '📊',
                title: 'Mood Heatmap',
                desc: 'A beautiful calendar that reveals your emotional patterns at a glance.',
                accent: '#f59e0b',
              },
              {
                icon: '💡',
                title: 'Daily Prompts',
                desc: "Stuck staring at a blank page? Lumen knows exactly what to ask you today.",
                accent: '#6366f1',
              },
              {
                icon: '🙏',
                title: 'Gratitude Capture',
                desc: 'End each dump by noting one good thing. Small habit, massive impact.',
                accent: '#7c3aed',
              },
              {
                icon: '🔥',
                title: 'Streak Rewards',
                desc: 'Build momentum with daily streaks. Your brain craves consistency — lean into it.',
                accent: '#FF4444',
              },
              {
                icon: '📋',
                title: 'Weekly AI Summaries',
                desc: "Lumen generates a personalized recap of your week's mental landscape. Pro feature.",
                accent: '#00cc6a',
              },
            ].map((feat, i) => (
              <AnimatedCard
                key={feat.title}
                delay={i * 0.08}
                y={24}
                className="glass-card glass-card-hover rounded-2xl p-5 group cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feat.accent}15` }}
                >
                  {feat.icon}
                </div>
                <h3 className="text-base font-semibold text-[#e2e8f0] mb-1.5">{feat.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{feat.desc}</p>
              </AnimatedCard>
            ))}
          </div>
        </Section>

        {/* ═══════ COMPARISON ═══════ */}
        <Section className="py-20 md:py-28">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-14">
            Why <span className="gradient-text-animated">Offload</span>?
          </h2>

          <div className="max-w-3xl mx-auto glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 text-xs font-semibold uppercase tracking-wider text-[#64748b] border-b border-white/5">
              <div className="p-4" />
              <div className="p-4 text-center">Notes Apps</div>
              <div className="p-4 text-center">Journals</div>
              <div className="p-4 text-center" style={{ color: '#00FF88' }}>Offload</div>
            </div>
            {[
              ['AI organization', false, false, true],
              ['Voice input', false, false, true],
              ['Mood tracking', false, true, true],
              ['Thought categorization', false, false, true],
              ['Pattern insights', false, false, true],
              ['Quick start', true, false, true],
            ].map(([label, a, b, c], i) => (
              <div
                key={i}
                className="grid grid-cols-4 text-sm border-b border-white/5 last:border-0"
              >
                <div className="p-4 text-[#e2e8f0]">{label as string}</div>
                {[a, b, c].map((val, j) => (
                  <div key={j} className="p-4 text-center">
                    {val ? (
                      <span style={{ color: j === 2 ? '#00FF88' : '#64748b' }}>✓</span>
                    ) : (
                      <span className="text-[#64748b]">—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════ FINAL CTA ═══════ */}
        <Section className="py-24 md:py-32 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-xl mx-auto leading-tight">
            Your thoughts deserve better than a{' '}
            <span className="gradient-text-animated">notes app</span>.
          </h2>
          <p className="text-[#94a3b8] mb-10 max-w-md mx-auto">
            Stop organizing. Start offloading. Let AI handle the structure
            while you focus on what matters — thinking clearly.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #00FF88, #00cc6a)',
              color: '#050810',
              boxShadow: '0 0 60px rgba(0,255,136,0.3), 0 0 120px rgba(0,255,136,0.1)',
            }}
          >
            Stop Overthinking — Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-[#64748b] mt-5">No credit card required. Sign up and start writing.</p>
        </Section>

        {/* Footer */}
        <footer className="text-center py-12 px-5 border-t border-white/5">
          <div className="text-sm gradient-text-animated font-bold mb-2">Offload</div>
          <p className="text-xs text-[#64748b] mb-4">Where overthinking ends.</p>
          <div className="flex items-center justify-center gap-6 text-xs text-[#64748b]">
            <Link href="/pricing" className="hover:text-[#e2e8f0] transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-[#e2e8f0] transition-colors">Sign In</Link>
            <Link href="/privacy" className="hover:text-[#e2e8f0] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#e2e8f0] transition-colors">Terms</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

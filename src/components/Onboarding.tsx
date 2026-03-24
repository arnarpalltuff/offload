'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LumenAvatar from '@/components/LumenAvatar';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  'welcome',
  'how-it-works',
  'meet-lumen',
  'ready',
] as const;

type Step = (typeof STEPS)[number];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
    scale: 0.95,
  }),
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentStep = STEPS[stepIndex];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex]);

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  }

  function dismiss() {
    localStorage.setItem('offload_onboarded', 'true');
    onComplete();
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

      {/* Skip button */}
      <button
        onClick={dismiss}
        aria-label="Skip onboarding"
        className="absolute right-4 top-4 z-10 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        Skip
      </button>

      {/* Card */}
      <div className="relative mx-4 flex w-full max-w-md flex-col items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass-card w-full rounded-3xl p-8 text-center"
          >
            {currentStep === 'welcome' && <WelcomeStep />}
            {currentStep === 'how-it-works' && <HowItWorksStep />}
            {currentStep === 'meet-lumen' && <MeetLumenStep />}
            {currentStep === 'ready' && <ReadyStep onStart={dismiss} />}
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="mt-8 flex gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="h-2 rounded-full"
              animate={{
                width: i === stepIndex ? 24 : 8,
                backgroundColor:
                  i === stepIndex
                    ? 'rgba(0, 255, 136, 0.9)'
                    : 'rgba(255, 255, 255, 0.15)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Next button (not shown on last step) */}
        {stepIndex < STEPS.length - 1 && (
          <motion.button
            onClick={next}
            className="relative mt-6 overflow-hidden rounded-2xl px-8 py-3 text-sm font-semibold text-background transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="gradient-primary absolute inset-0 rounded-2xl" />
            <span className="relative">Continue</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/* Step Components                                     */
/* -------------------------------------------------- */

function WelcomeStep() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
      >
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
      </motion.div>
      <h2 className="gradient-text-animated text-3xl font-bold">
        Welcome to Offload
      </h2>
      <p className="text-base leading-relaxed text-muted">
        Where overthinking ends.
      </p>
    </div>
  );
}

function HowItWorksStep() {
  const features = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.365.364.028.664.313.664.68v1.462c0 .334.226.607.553.707a7.49 7.49 0 005.174 0 .553.553 0 00.553-.707v-1.462c0-.367.3-.652.664-.68 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      label: 'Type or speak your thoughts',
      delay: 0.1,
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
      label: 'Lumen organizes everything',
      delay: 0.25,
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
      label: 'Reflect, track mood, grow',
      delay: 0.4,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">How it works</h2>
      <div className="space-y-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: f.delay, duration: 0.4 }}
            className="flex items-center gap-4 rounded-xl bg-white/[0.03] px-4 py-3"
          >
            <motion.div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                delay: f.delay + 0.5,
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              {f.icon}
            </motion.div>
            <span className="text-sm font-medium text-foreground/80">
              {f.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MeetLumenStep() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto"
      >
        <LumenAvatar size="lg" />
      </motion.div>
      <h2 className="text-2xl font-bold text-foreground">Meet Lumen</h2>
      <p className="text-sm leading-relaxed text-muted">
        I&apos;m Lumen, your AI companion. I&apos;ll learn your patterns and
        help you think clearer over time.
      </p>
    </div>
  );
}

function ReadyStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
      </motion.div>
      <h2 className="text-2xl font-bold text-foreground">Ready?</h2>
      <p className="text-sm leading-relaxed text-muted">
        Let&apos;s start with your first brain dump
      </p>
      <motion.button
        onClick={onStart}
        className="relative w-full overflow-hidden rounded-2xl py-4 text-base font-bold text-background"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="gradient-primary absolute inset-0 rounded-2xl" />
        <span className="relative">Let&apos;s Go</span>
      </motion.button>
    </div>
  );
}

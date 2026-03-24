'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PROMPTS = [
  // Self-awareness & patterns
  "What's the one thing you keep thinking about but haven't said out loud yet?",
  "If you could solve just one problem today, which would give you the most relief?",
  "What are you avoiding right now? Not what you should do — what are you actively not doing?",
  "What would 80-year-old you say about how you spent this week?",
  "What's draining your energy right now? Be specific — name the thing, not the feeling.",
  "What pattern keeps repeating in your life that you wish would stop?",
  "What did you learn about yourself this week that surprised you?",
  "What's the conversation you keep having in your head but haven't had in real life?",
  "If your anxiety had a specific request right now, what would it be asking for?",
  "What feels urgent but actually isn't? What feels unimportant but actually matters?",

  // Action & momentum
  "What's the one task that, if done today, would make everything else easier or unnecessary?",
  "What would you do today if you weren't afraid of doing it badly?",
  "Who needs to hear from you that you've been putting off reaching out to?",
  "What's the smallest possible action toward the biggest thing on your mind?",
  "If you had to delete 3 things from your to-do list right now, which would they be?",
  "What decision have you been postponing? What's the cost of waiting another week?",
  "Write down everything on your mind in 60 seconds. Don't edit. Don't filter. Go.",
  "What's one commitment you made to yourself that you've been quietly breaking?",
  "If today were your only chance to move one thing forward, what would it be?",
  "What would you do differently today if nobody were watching or judging?",

  // Emotional check-in
  "How are you actually doing? Not the polite answer — the real one.",
  "What would you tell your best friend if they described feeling the way you feel right now?",
  "What's one thing that went right recently that you forgot to celebrate?",
  "Where in your body do you feel stress right now? What's it trying to tell you?",
  "What's one boundary you need to set but haven't because it feels uncomfortable?",
  "If your mood right now were weather, what would it be? Why?",
  "What are you holding onto that you know you need to let go of?",
  "Name something that brought you genuine joy in the last 48 hours.",
  "What would 'enough' look like today? Not perfection — just enough.",
  "What do you need right now that you're not giving yourself permission to need?",
];

interface DailyPromptProps {
  onUsePrompt: (prompt: string) => void;
}

export default function DailyPrompt({ onUsePrompt }: DailyPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Deterministic daily prompt + random refresh
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const idx = dayOfYear % PROMPTS.length;
    setIndex(idx);
    setPrompt(PROMPTS[idx]);
  }, []);

  function shuffle() {
    const next = (index + 1) % PROMPTS.length;
    setIndex(next);
    setPrompt(PROMPTS[next]);
  }

  if (!prompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/60">
          Daily Prompt
        </span>
        <button
          onClick={shuffle}
          aria-label="Shuffle daily prompt"
          className="text-[10px] font-medium text-muted hover:text-foreground transition-colors"
        >
          Shuffle
        </button>
      </div>
      <motion.p
        key={prompt}
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        className="text-sm leading-relaxed text-foreground/80 mb-3"
      >
        &ldquo;{prompt}&rdquo;
      </motion.p>
      <button
        onClick={() => onUsePrompt(prompt)}
        className="text-xs font-medium text-primary hover:text-primary-dim transition-colors"
      >
        Use this prompt &rarr;
      </button>
    </motion.div>
  );
}

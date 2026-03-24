'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import LumenAvatar from './LumenAvatar';
import TextReveal from './TextReveal';
import TiltCard from './TiltCard';

interface WeeklySummaryProps {
  avgMood: number;
  completionRate: number;
  topThemes: string[];
  totalDumps: number;
  streakDays: number;
  locked?: boolean;
}

function generateSummary({ avgMood, completionRate, topThemes, totalDumps, streakDays }: WeeklySummaryProps): string {
  const parts: string[] = [];

  // Streak — behavioral psychology, not just counting
  if (streakDays >= 21) {
    parts.push(`${streakDays} days. At this point, the research is clear: this isn't discipline anymore — it's identity. You're someone who processes their thinking. That shift from "something I do" to "who I am" is the whole game.`);
  } else if (streakDays >= 14) {
    parts.push(`${streakDays} days straight. You've crossed the threshold where habit formation researchers say the behavior starts to feel automatic. Notice how it takes less willpower to show up now than it did on day 3? That's neuroplasticity — your brain literally rewired to expect this.`);
  } else if (streakDays >= 7) {
    parts.push(`${streakDays} consecutive days. The "habit formation takes 21 days" thing is a myth — research from UCL shows it actually takes 18-254 days depending on the behavior. But the first week is the steepest part of the curve. You climbed it.`);
  } else if (streakDays >= 3) {
    parts.push(`${streakDays} days this week. You're in what BJ Fogg calls the "habit honeymoon" — motivation is still fresh. The real test comes when you don't feel like it. When that day arrives, make the dump tiny. Two sentences. The streak matters more than the depth.`);
  } else if (totalDumps > 0) {
    parts.push(`${totalDumps} brain dumps total. Consistency isn't about streaks — it's about coming back. The fact that you returned today after a gap? That's more meaningful than a 10-day streak that never breaks.`);
  }

  // Mood — cross-reference with completion for deeper insight
  if (avgMood >= 4.5 && completionRate >= 70) {
    parts.push(`Mood at ${avgMood.toFixed(1)}/5 with ${completionRate}% completion — that's the sweet spot. High mood AND high follow-through usually means you're in what Csikszentmihalyi calls "flow" — the challenge-skill balance is right. Whatever you're doing, keep the ratio.`);
  } else if (avgMood >= 4.5 && completionRate < 50) {
    parts.push(`Mood at ${avgMood.toFixed(1)}/5 but only ${completionRate}% completion — interesting. You're feeling good despite not finishing your tasks. That's actually healthy. It might mean your wellbeing isn't tied to productivity, or it might mean your task list doesn't reflect what actually matters to you.`);
  } else if (avgMood >= 3.5) {
    parts.push(`Mood averaged ${avgMood.toFixed(1)}/5 — solid. Not euphoric, not struggling. The psychology of "good enough" is underrated: Sonja Lyubomirsky's research shows that people who aim for "satisficing" (good enough) rather than "maximizing" (perfect) are consistently happier. A steady ${avgMood.toFixed(1)} might be your actual optimal.`);
  } else if (avgMood >= 2.5) {
    parts.push(`Mood at ${avgMood.toFixed(1)}/5 — hovering in neutral. Not crisis territory, but not thriving either. Neutral often means one of two things: either nothing is strongly wrong (which is fine), or several small things are draining you at once (which is sneaky). Look at the themes below — if the same ones keep appearing, they might be the slow leaks.`);
  } else if (avgMood > 0) {
    parts.push(`Mood averaged ${avgMood.toFixed(1)}/5 this week. That's below your baseline and it matters. Low mood sustained over multiple days isn't a character flaw — it's information. Something in your environment or your patterns isn't working right now. The entries you've been writing hold the clues. What changed?`);
  }

  // Completion — tie it back to planning quality, not effort
  if (completionRate >= 90) {
    parts.push(`${completionRate}% completion rate — nearly everything done. Two possibilities: either you're exceptionally focused, or your lists are too easy. Check which one it is. If you're never leaving things undone, you might not be challenging yourself enough.`);
  } else if (completionRate >= 60) {
    parts.push(`${completionRate}% of tasks completed. That's a healthy number — it means you're setting ambitious enough lists that some things naturally roll over, but still making real progress. The sweet spot for most people is 60-80%. Below that, your lists are unrealistic. Above that, they might be too safe.`);
  } else if (completionRate >= 30) {
    parts.push(`${completionRate}% completion. Real talk: this usually means either the list was too long, the tasks were too vague, or something unexpected ate your day. Check your "must do" items — were they genuinely must-dos, or were some of them "would be nice" in disguise?`);
  } else if (completionRate > 0) {
    parts.push(`${completionRate}% completion rate. That's low, and I want to be honest about why it might be: planning fallacy. Humans consistently overestimate what they can do in a day by 40-50%. Try this: next time, plan for half of what you think you can do. You'll feel better and probably accomplish the same amount.`);
  }

  // Themes — connect to psychological patterns
  if (topThemes.length >= 3) {
    parts.push(`Your brain keeps circling back to ${topThemes[0]}, ${topThemes[1]}, and ${topThemes[2]}. In psychology, recurring thoughts are called "intrusive cognitions" — and they're not random noise. They're your mind's way of flagging unresolved business. The one that appears most often is usually the one that needs a decision, not just more thinking.`);
  } else if (topThemes.length === 2) {
    parts.push(`Two recurring themes: ${topThemes[0]} and ${topThemes[1]}. When two themes dominate, they're often in tension with each other — work vs. personal life, obligation vs. desire, security vs. growth. Is there a tension between these two that you haven't named yet?`);
  } else if (topThemes.length === 1) {
    parts.push(`"${topThemes[0]}" keeps showing up. A single dominant theme means your attention has a center of gravity right now. That's not a problem — it's focus. But check: is this where you WANT your attention, or is it where your anxiety keeps pulling it?`);
  }

  return parts.join(' ');
}

export default function WeeklySummary(props: WeeklySummaryProps) {
  const { locked = false, ...summaryProps } = props;
  const summary = generateSummary(summaryProps as WeeklySummaryProps);

  return (
    <TiltCard className="rounded-2xl" glowColor="rgba(124,58,237,0.1)">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative rounded-2xl p-5 glow-calm overflow-hidden"
      >
        <div className={locked ? 'blur-sm select-none pointer-events-none' : ''}>
          <div className="flex items-center gap-2.5 mb-3">
            <LumenAvatar size="sm" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-calm">
              Lumen&apos;s Weekly Recap
            </span>
          </div>
          <TextReveal
            text={summary}
            className="text-sm leading-relaxed text-foreground/75"
            delay={0.2}
            stagger={0.03}
          />
        </div>
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl">
            <svg className="h-6 w-6 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <Link href="/pricing" className="text-sm font-semibold text-primary hover:underline">
              Unlock with Pro
            </Link>
          </div>
        )}
      </motion.div>
    </TiltCard>
  );
}

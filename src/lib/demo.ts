import type { OrganizedDump, PlanItem, Reflection, QuickCapture, User } from './types';

export const DEMO_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === '';

export const DEMO_USER: User = {
  id: 'demo-001',
  email: 'demo@offload.app',
  username: 'demo',
  display_name: 'Demo User',
  created_at: '2025-06-15T00:00:00Z',
  is_premium: false,
  streak: 7,
};

export const DEMO_ORGANIZED: OrganizedDump = {
  must_do: [
    { id: 'p1', text: 'Finish the quarterly report — deadline is end of day', category: 'must_do', priority: 1, completed: false, notes: '', created_at: new Date().toISOString() },
    { id: 'p2', text: 'Reply to Sarah\'s email about the project timeline', category: 'must_do', priority: 2, completed: true, notes: '', created_at: new Date().toISOString() },
    { id: 'p3', text: 'Book dentist appointment before the month ends', category: 'must_do', priority: 3, completed: false, notes: '', created_at: new Date().toISOString() },
  ],
  can_wait: [
    { id: 'p4', text: 'Research new project management tools for the team', category: 'can_wait', priority: 1, completed: false, notes: '', created_at: new Date().toISOString() },
    { id: 'p5', text: 'Organize photos from last weekend', category: 'can_wait', priority: 2, completed: false, notes: '', created_at: new Date().toISOString() },
  ],
  ideas: [
    { id: 'p6', text: 'Start a weekly team standup to improve communication', category: 'ideas', priority: 1, completed: false, notes: '', created_at: new Date().toISOString() },
    { id: 'p7', text: 'Learn TypeScript generics properly — would speed up my work', category: 'ideas', priority: 2, completed: false, notes: '', created_at: new Date().toISOString() },
    { id: 'p8', text: 'Build a side project with the new AI APIs', category: 'ideas', priority: 3, completed: false, notes: '', created_at: new Date().toISOString() },
  ],
  worries: [
    { id: 'p9', text: 'Am I spending enough quality time with family?', category: 'worries', priority: 1, completed: false, notes: '', created_at: new Date().toISOString() },
    { id: 'p10', text: 'The car is making a weird noise — might be expensive to fix', category: 'worries', priority: 2, completed: false, notes: '', created_at: new Date().toISOString() },
  ],
  summary: 'Okay, here\'s the real picture: the quarterly report is the thing that\'ll haunt you if you don\'t finish it today, so start there — not email, not the dentist, that report. Sarah\'s email and the dentist are 5-minute tasks you can knock out in the gaps. The team standup idea and the TypeScript learning? Those are future-you investments — schedule them for Thursday. And the worry about family time — that one keeps coming back. It\'s not a task to check off. It\'s a signal worth listening to.',
};

export function getDemoPlanItems(): PlanItem[] {
  return [
    ...DEMO_ORGANIZED.must_do,
    ...DEMO_ORGANIZED.can_wait,
    ...DEMO_ORGANIZED.ideas,
    ...DEMO_ORGANIZED.worries,
  ];
}

export const DEMO_REFLECTIONS: Reflection[] = (() => {
  const reflections: Reflection[] = [];
  const insights = [
    'You crushed the quarterly report and cleared Sarah\'s email — that\'s two things that were probably taking up more mental space than they deserved. Now they\'re done and that headspace is yours. The family time worry keeps surfacing though. Not as a to-do, but as a value. Maybe this weekend, block out Saturday morning with no agenda — just presence.',
    'Sounds like one of those days where you kept busy but the *important* stuff got nudged aside again. That\'s not a character flaw — it\'s what happens when your to-do list doesn\'t distinguish between "urgent" and "meaningful." Tomorrow, start with the one thing that would make you proud to finish, before opening email.',
    'The creative energy coming through today is real — and it\'s not random. Your mood has been noticeably higher on days where you touch something creative, even briefly. That side project idea? You don\'t need a whole afternoon. 20 focused minutes tomorrow morning could be enough to feel the momentum.',
    'A 3/5 day with a lot on your mind. That\'s honest, and honesty is the whole point of showing up here. The car and the finances feel like they\'re looping — your brain keeps replaying them because it hasn\'t decided on a next step yet. Pick just one: what\'s the smallest action that would make it feel less abstract?',
    'Morning routine is clearly your engine right now. Three of your best days this week started with early focus time, and by afternoon you had energy left for the creative stuff. That\'s not luck — that\'s a pattern you built. Keep protecting those mornings.',
    'Feeling scattered usually means too many open loops, not too little willpower. You had 8 items flagged as "must do" — but realistically, 3 of those were must-dos and 5 were nice-to-haves wearing disguises. Tomorrow, be ruthless: pick 3, do those first, and let the rest wait.',
    'Seven days in a row. That\'s not about discipline — it\'s about the fact that this is actually working for you. Your mood average climbed from 3.6 to 4.1 this week. The act of writing things down and organizing them is changing how you carry the day. That\'s worth noticing.',
  ];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    reflections.push({
      id: `r${i}`,
      mood_score: [5, 4, 4, 3, 5, 3, 4][i],
      text: ['Great day, got everything done!', 'Bit overwhelmed but managed', 'Creative energy was high', 'Tough day, lots on my mind', 'Morning routine is really helping', 'Felt scattered today', 'Steady and consistent'][i],
      ai_insight: insights[i],
      created_at: d.toISOString(),
      date: d.toISOString().split('T')[0],
    });
  }
  return reflections;
})();

export const DEMO_CAPTURES: QuickCapture[] = [
  { id: 'c1', text: 'Remember to buy birthday gift for Mom', category: 'must_do', created_at: new Date().toISOString() },
  { id: 'c2', text: 'Podcast idea: interview local business owners', category: 'ideas', created_at: new Date().toISOString() },
  { id: 'c3', text: 'Check if gym membership auto-renews this month', category: 'can_wait', created_at: new Date().toISOString() },
];

export const DEMO_INSIGHTS = {
  moodTrend: (() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().split('T')[0],
        score: Math.max(1, Math.min(5, Math.round(3.5 + Math.sin(i / 3) * 1.5 + (Math.random() - 0.5)))),
      });
    }
    return data;
  })(),
  categoryDistribution: {
    must_do: 34,
    can_wait: 25,
    ideas: 23,
    worries: 18,
  },
  recurringThemes: [
    { text: 'work deadlines', count: 12 },
    { text: 'family time', count: 8 },
    { text: 'health & exercise', count: 7 },
    { text: 'side projects', count: 6 },
    { text: 'finances', count: 5 },
    { text: 'learning', count: 4 },
    { text: 'social plans', count: 3 },
  ],
  completionRate: 72,
  currentStreak: 7,
  bestStreak: 14,
  totalDumps: 23,
  avgMood: 3.8,
};

export const DEMO_RAW_TEXT = `I need to finish the quarterly report today, that's the big one. Also Sarah emailed me about the project timeline and I haven't replied yet. I should book a dentist appointment before the month ends.

I've been thinking about switching our project management tool — the current one is clunky. And I need to organize my photos from last weekend at some point.

Had an idea about starting weekly standups with the team. Also want to learn TypeScript generics properly. Maybe I should build something with those new AI APIs everyone's talking about.

I keep worrying that I'm not spending enough quality time with the family. And the car is making this weird noise that might be expensive to fix...`;

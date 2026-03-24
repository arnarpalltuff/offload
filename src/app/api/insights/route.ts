import { NextResponse } from 'next/server';
import { DEMO_MODE, DEMO_INSIGHTS } from '@/lib/demo';

export async function GET() {
  if (DEMO_MODE) {
    return NextResponse.json(DEMO_INSIGHTS);
  }

  // Live mode
  try {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString().split('T')[0];

  const [reflectionsRes, itemsRes, streakRes] = await Promise.all([
    supabase.from('reflections').select('mood_score, date').eq('user_id', user.id).gte('date', since).order('date'),
    supabase.from('plan_items').select('text, category, completed').eq('user_id', user.id).gte('date', since),
    supabase.from('users').select('streak').eq('id', user.id).single(),
  ]);

  const reflections = reflectionsRes.data || [];
  const items = itemsRes.data || [];

  const moodTrend = reflections.map((r) => ({ date: r.date, score: r.mood_score }));
  const avgMood = reflections.length > 0
    ? reflections.reduce((sum, r) => sum + r.mood_score, 0) / reflections.length
    : 0;

  const catCounts: Record<string, number> = {};
  let completed = 0;
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
    if (item.completed) completed++;
  }
  const total = items.length || 1;
  const categoryDistribution: Record<string, number> = {};
  for (const [cat, count] of Object.entries(catCounts)) {
    categoryDistribution[cat] = Math.round((count / total) * 100);
  }

  // Extract recurring themes from item text
  const recurringThemes = extractThemes(items.map((i) => i.text || ''));

  return NextResponse.json({
    moodTrend,
    categoryDistribution,
    recurringThemes,
    completionRate: Math.round((completed / total) * 100),
    currentStreak: streakRes.data?.streak || 0,
    bestStreak: streakRes.data?.streak || 0,
    totalDumps: reflections.length,
    avgMood: Math.round(avgMood * 10) / 10,
  });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch insights.' }, { status: 500 });
  }
}

// Simple keyword extraction from item texts to find recurring themes
function extractThemes(texts: string[]): { text: string; count: number }[] {
  const themeCounts: Record<string, number> = {};
  const keywords = [
    'work', 'family', 'health', 'exercise', 'finances', 'money',
    'relationship', 'friends', 'deadline', 'project', 'learning',
    'sleep', 'stress', 'creativity', 'side project', 'meeting',
    'email', 'travel', 'food', 'hobby', 'reading', 'social',
  ];

  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        themeCounts[keyword] = (themeCounts[keyword] || 0) + 1;
      }
    }
  }

  return Object.entries(themeCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([text, count]) => ({ text, count }));
}

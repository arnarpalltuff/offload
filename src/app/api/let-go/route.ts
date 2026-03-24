import { NextResponse } from 'next/server';
import { DEMO_MODE, DEMO_ORGANIZED, DEMO_REFLECTIONS } from '@/lib/demo';

export interface LetGoItem {
  id: string;
  text: string;
  category: 'worries' | 'must_do' | 'can_wait' | 'ideas';
  date: string;
  daysOld: number;
}

export async function GET() {
  const today = new Date();

  if (DEMO_MODE) {
    // Build demo items: unresolved worries and uncompleted tasks from "this week"
    const items: LetGoItem[] = [];

    // Worries are the prime candidates for letting go
    for (const worry of DEMO_ORGANIZED.worries) {
      items.push({
        id: worry.id,
        text: worry.text,
        category: 'worries',
        date: new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0],
        daysOld: 3,
      });
    }

    // Old uncompleted must_do items (they weren't urgent after all)
    for (const task of DEMO_ORGANIZED.must_do.filter((t) => !t.completed)) {
      items.push({
        id: task.id,
        text: task.text,
        category: 'must_do',
        date: new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0],
        daysOld: 5,
      });
    }

    // Old can_wait items
    for (const task of DEMO_ORGANIZED.can_wait) {
      items.push({
        id: task.id,
        text: task.text,
        category: 'can_wait',
        date: new Date(today.getTime() - 4 * 86400000).toISOString().split('T')[0],
        daysOld: 4,
      });
    }

    // Get the latest reflection for a closing message
    const latestReflection = DEMO_REFLECTIONS[0];

    return NextResponse.json({
      items,
      weekMoodAvg: 4.0,
      closingContext: latestReflection?.ai_insight?.slice(0, 100) || null,
    });
  }

  // Live mode
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get items from the past 7 days that are NOT completed and NOT from today
    const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const { data: oldItems } = await supabase
      .from('plan_items')
      .select('id, text, category, date, completed')
      .eq('user_id', user.id)
      .eq('completed', false)
      .gte('date', weekAgo)
      .lt('date', todayStr)
      .order('date', { ascending: true });

    const items: LetGoItem[] = (oldItems || []).map((item) => ({
      id: item.id,
      text: item.text,
      category: item.category,
      date: item.date,
      daysOld: Math.floor((today.getTime() - new Date(item.date + 'T12:00:00').getTime()) / 86400000),
    }));

    // Get week's mood average for closing message
    const { data: reflections } = await supabase
      .from('reflections')
      .select('mood_score')
      .eq('user_id', user.id)
      .gte('date', weekAgo)
      .lte('date', todayStr);

    const weekMoodAvg = reflections?.length
      ? Math.round((reflections.reduce((sum, r) => sum + r.mood_score, 0) / reflections.length) * 10) / 10
      : null;

    return NextResponse.json({ items, weekMoodAvg, closingContext: null });
  } catch {
    return NextResponse.json({ error: 'Failed to load items.' }, { status: 500 });
  }
}

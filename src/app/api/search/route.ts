import { NextResponse } from 'next/server';
import { DEMO_MODE, DEMO_ORGANIZED, DEMO_REFLECTIONS, DEMO_RAW_TEXT } from '@/lib/demo';

export interface SearchResult {
  type: 'dump' | 'reflection' | 'task';
  date: string;
  text: string;
  context?: string;
  mood?: number;
  category?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim().toLowerCase();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (DEMO_MODE) {
    const results: SearchResult[] = [];

    // Search demo raw dump text
    if (DEMO_RAW_TEXT.toLowerCase().includes(query)) {
      const lines = DEMO_RAW_TEXT.split('\n').filter((l) => l.trim());
      const matchingLine = lines.find((l) => l.toLowerCase().includes(query)) || lines[0];
      results.push({
        type: 'dump',
        date: new Date().toISOString().split('T')[0],
        text: matchingLine,
        context: 'Brain Dump',
      });
    }

    // Search demo summary
    if (DEMO_ORGANIZED.summary.toLowerCase().includes(query)) {
      results.push({
        type: 'dump',
        date: new Date().toISOString().split('T')[0],
        text: DEMO_ORGANIZED.summary,
        context: "Lumen's Summary",
      });
    }

    // Search demo plan items
    const allItems = [
      ...DEMO_ORGANIZED.must_do,
      ...DEMO_ORGANIZED.can_wait,
      ...DEMO_ORGANIZED.ideas,
      ...DEMO_ORGANIZED.worries,
    ];
    for (const item of allItems) {
      if (item.text.toLowerCase().includes(query)) {
        results.push({
          type: 'task',
          date: new Date().toISOString().split('T')[0],
          text: item.text,
          category: item.category,
        });
      }
    }

    // Search demo reflections
    for (const ref of DEMO_REFLECTIONS) {
      if (
        ref.text?.toLowerCase().includes(query) ||
        ref.ai_insight?.toLowerCase().includes(query)
      ) {
        const matchText = ref.text?.toLowerCase().includes(query) ? ref.text : ref.ai_insight;
        results.push({
          type: 'reflection',
          date: ref.date,
          text: matchText,
          mood: ref.mood_score,
          context: 'Reflection',
        });
      }
    }

    return NextResponse.json({ results: results.slice(0, 20) });
  }

  // Live mode — search across Supabase tables
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: SearchResult[] = [];

    // Search brain dumps (raw text + summary)
    const { data: dumps } = await supabase
      .from('brain_dumps')
      .select('raw_text, organized, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(60);

    if (dumps) {
      for (const dump of dumps) {
        if (dump.raw_text?.toLowerCase().includes(query)) {
          const lines = dump.raw_text.split('\n').filter((l: string) => l.trim());
          const matchingLine = lines.find((l: string) => l.toLowerCase().includes(query)) || lines[0];
          results.push({
            type: 'dump',
            date: dump.date,
            text: matchingLine,
            context: 'Brain Dump',
          });
        }
        const summary = dump.organized?.summary;
        if (summary?.toLowerCase().includes(query)) {
          results.push({
            type: 'dump',
            date: dump.date,
            text: summary,
            context: "Lumen's Summary",
          });
        }
      }
    }

    // Search plan items
    const { data: items } = await supabase
      .from('plan_items')
      .select('text, category, date')
      .eq('user_id', user.id)
      .ilike('text', `%${query}%`)
      .order('date', { ascending: false })
      .limit(20);

    if (items) {
      for (const item of items) {
        results.push({
          type: 'task',
          date: item.date,
          text: item.text,
          category: item.category,
        });
      }
    }

    // Search reflections
    const { data: reflections } = await supabase
      .from('reflections')
      .select('text, ai_insight, mood_score, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(60);

    if (reflections) {
      for (const ref of reflections) {
        if (
          ref.text?.toLowerCase().includes(query) ||
          ref.ai_insight?.toLowerCase().includes(query)
        ) {
          const matchText = ref.text?.toLowerCase().includes(query) ? ref.text : ref.ai_insight;
          results.push({
            type: 'reflection',
            date: ref.date,
            text: matchText,
            mood: ref.mood_score,
            context: 'Reflection',
          });
        }
      }
    }

    // Sort by date descending, limit to 20
    results.sort((a, b) => b.date.localeCompare(a.date));
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch {
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 });
  }
}

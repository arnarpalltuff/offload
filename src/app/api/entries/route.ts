import { NextResponse } from 'next/server';
import { DEMO_MODE, DEMO_ORGANIZED, getDemoPlanItems, DEMO_REFLECTIONS, DEMO_CAPTURES, DEMO_RAW_TEXT } from '@/lib/demo';
import { getTodayDate } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayDate();

  // Validate date format and logical validity
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date + 'T00:00:00').getTime())) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }

  if (DEMO_MODE) {
    const today = getTodayDate();
    const isToday = date === today;
    const reflection = DEMO_REFLECTIONS.find((r) => r.date === date) || (isToday ? null : DEMO_REFLECTIONS[0]);

    return NextResponse.json({
      dump: isToday
        ? { id: 'demo-dump', raw_text: DEMO_RAW_TEXT, organized: DEMO_ORGANIZED, date: today }
        : null,
      items: isToday ? getDemoPlanItems() : [],
      reflection,
      captures: isToday ? DEMO_CAPTURES : [],
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

    const [dumpRes, itemsRes, reflectionRes, capturesRes] = await Promise.all([
      supabase.from('brain_dumps').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('plan_items').select('*').eq('user_id', user.id).eq('date', date).order('priority'),
      supabase.from('reflections').select('*').eq('user_id', user.id).eq('date', date).single(),
      supabase.from('quick_captures').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);

    return NextResponse.json({
      dump: dumpRes.data,
      items: itemsRes.data || [],
      reflection: reflectionRes.data,
      captures: capturesRes.data || [],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch entries. Please try again.' }, { status: 500 });
  }
}

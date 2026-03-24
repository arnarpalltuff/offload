import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { item_id, completed } = body;

  if (!item_id || typeof item_id !== 'string') {
    return NextResponse.json({ error: 'Missing required field: item_id' }, { status: 400 });
  }

  if (typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'Missing required field: completed (must be boolean)' }, { status: 400 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ success: true });
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('plan_items')
      .update({ completed })
      .eq('id', item_id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update plan item.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update plan item. Please try again.' }, { status: 500 });
  }
}

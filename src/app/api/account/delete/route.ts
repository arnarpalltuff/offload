import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST() {
  if (DEMO_MODE) {
    // In demo mode, clear localStorage on the client side
    return NextResponse.json({ success: true, demo: true });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete all user data in order (respecting foreign key constraints)
  const tables = [
    { table: 'quick_captures', column: 'user_id' },
    { table: 'plan_items', column: 'user_id' },
    { table: 'reflections', column: 'user_id' },
    { table: 'brain_dumps', column: 'user_id' },
    { table: 'users', column: 'id' },
  ] as const;

  for (const { table, column } of tables) {
    const { error } = await supabase.from(table).delete().eq(column, user.id);
    if (error) {
      return NextResponse.json({ error: 'Account deletion failed. Please try again or contact support.' }, { status: 500 });
    }
  }

  // Sign out
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}

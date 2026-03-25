import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json({ url: '/pricing' });
  }

  try {
    const { lemonSqueezyFetch } = await import('@/lib/stripe');
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the customer's subscriptions
    const data = await lemonSqueezyFetch(`/subscriptions?filter[user_email]=${encodeURIComponent(user.email)}`);

    const subscription = data?.data?.[0];
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found.' }, { status: 404 });
    }

    // Lemon Squeezy provides a customer portal URL on each subscription
    const portalUrl = subscription.attributes?.urls?.customer_portal;
    if (!portalUrl) {
      return NextResponse.json({ error: 'Portal URL not available.' }, { status: 500 });
    }

    return NextResponse.json({ url: portalUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to create portal session. Please try again.' }, { status: 500 });
  }
}

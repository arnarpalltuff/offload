import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json({ url: '/pricing' });
  }

  try {
    const { stripe } = await import('@/lib/stripe');
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up the Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No billing account found. Please contact support.' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'App URL not configured. Please contact support.' }, { status: 500 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${appUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Failed to create portal session. Please try again.' }, { status: 500 });
  }
}

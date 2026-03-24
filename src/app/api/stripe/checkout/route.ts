import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { priceId } = body;

  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'Missing required field: priceId' }, { status: 400 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ url: '/dump?upgraded=true' });
  }

  try {
    // Authenticate user
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to upgrade.' }, { status: 401 });
    }

    // Validate price ID against allowed values
    const allowedPriceIds = process.env.STRIPE_ALLOWED_PRICE_IDS?.split(',') || [];
    if (allowedPriceIds.length > 0 && !allowedPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price selection.' }, { status: 400 });
    }

    const { stripe } = await import('@/lib/stripe');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'App URL not configured. Please set NEXT_PUBLIC_APP_URL.' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dump?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session. Please try again.' }, { status: 500 });
  }
}

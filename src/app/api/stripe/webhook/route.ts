import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST(request: Request) {
  if (DEMO_MODE) {
    return NextResponse.json({ received: true });
  }

  try {
    const { stripe } = await import('@/lib/stripe');
    const { createClient } = await import('@supabase/supabase-js');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
          await supabase
            .from('users')
            .update({ is_premium: true })
            .eq('email', customerEmail);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          await supabase
            .from('users')
            .update({ is_premium: false })
            .eq('email', customer.email);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          await supabase
            .from('users')
            .update({ is_premium: isActive })
            .eq('email', customer.email);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: Request) {
  if (DEMO_MODE) {
    return NextResponse.json({ received: true });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;
    const customerEmail = event.data?.attributes?.user_email;

    if (!customerEmail) {
      return NextResponse.json({ received: true });
    }

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_resumed': {
        await supabase
          .from('users')
          .update({ is_premium: true })
          .eq('email', customerEmail);
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        await supabase
          .from('users')
          .update({ is_premium: false })
          .eq('email', customerEmail);
        break;
      }

      case 'subscription_updated': {
        const status = event.data?.attributes?.status;
        const isActive = status === 'active' || status === 'on_trial';
        await supabase
          .from('users')
          .update({ is_premium: isActive })
          .eq('email', customerEmail);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { DEMO_MODE } from '@/lib/demo';

export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json({ url: '/dump?upgraded=true' });
  }

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to upgrade.' }, { status: 401 });
    }

    const { lemonSqueezyFetch, LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_VARIANT_ID } = await import('@/lib/stripe');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'App URL not configured.' }, { status: 500 });
    }

    const data = await lemonSqueezyFetch('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
              },
            },
            product_options: {
              redirect_url: `${appUrl}/dump?upgraded=true`,
            },
          },
          relationships: {
            store: {
              data: { type: 'stores', id: LEMONSQUEEZY_STORE_ID },
            },
            variant: {
              data: { type: 'variants', id: LEMONSQUEEZY_VARIANT_ID },
            },
          },
        },
      }),
    });

    const checkoutUrl = data?.data?.attributes?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Failed to create checkout.' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to create checkout session. Please try again.' }, { status: 500 });
  }
}

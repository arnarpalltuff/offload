import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-02-25.clover',
});

export const OFFLOAD_PRO_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_demo';

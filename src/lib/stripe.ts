// Lemon Squeezy configuration
export const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || '';
export const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || '';
export const LEMONSQUEEZY_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID || '';

export async function lemonSqueezyFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.lemonsqueezy.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
      ...options.headers,
    },
  });
  return res.json();
}

// Simple in-memory rate limiter.
// In production with multiple servers, swap this for Redis-backed (e.g. @upstash/ratelimit).
// For a single Vercel deployment, this works fine.

const requests = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requests) {
    if (now > value.resetTime) {
      requests.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g. IP address or user ID)
 * @param maxRequests - Max requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export function rateLimit(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = requests.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired — start fresh
    requests.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: windowSeconds };
  }

  if (entry.count >= maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  entry.count++;
  const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
  return { allowed: true, remaining: maxRequests - entry.count, resetInSeconds };
}

/**
 * Get client IP from request headers (works on Vercel and most hosts).
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

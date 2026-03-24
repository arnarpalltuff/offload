import { describe, it, expect } from 'vitest';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const result = rateLimit('test-allow', 5, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('counts down remaining requests', () => {
    const key = 'test-countdown';
    rateLimit(key, 3, 60);
    const second = rateLimit(key, 3, 60);
    expect(second.remaining).toBe(1);

    const third = rateLimit(key, 3, 60);
    expect(third.remaining).toBe(0);
    expect(third.allowed).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const key = 'test-block';
    rateLimit(key, 2, 60);
    rateLimit(key, 2, 60);
    const blocked = rateLimit(key, 2, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });

  it('uses separate limits for different keys', () => {
    const r1 = rateLimit('key-a', 1, 60);
    const r2 = rateLimit('key-b', 1, 60);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);

    // key-a is now at limit, key-b should also be at limit
    const r3 = rateLimit('key-a', 1, 60);
    expect(r3.allowed).toBe(false);
  });
});

describe('getClientIP', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIP(request)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.8.7.6' },
    });
    expect(getClientIP(request)).toBe('9.8.7.6');
  });

  it('returns unknown when no IP headers present', () => {
    const request = new Request('http://localhost');
    expect(getClientIP(request)).toBe('unknown');
  });
});

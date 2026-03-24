import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/reflect/route';

describe('POST /api/reflect', () => {
  it('rejects invalid JSON', async () => {
    const request = new Request('http://localhost/api/reflect', {
      method: 'POST',
      body: '{{bad',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('rejects missing mood_score', async () => {
    const request = new Request('http://localhost/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('rejects mood_score out of range', async () => {
    const request = new Request('http://localhost/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood_score: 7 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('rejects non-integer mood_score', async () => {
    const request = new Request('http://localhost/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood_score: 3.5 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns insight for valid mood in demo mode', async () => {
    for (const mood of [1, 2, 3, 4, 5]) {
      const request = new Request('http://localhost/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_score: mood }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.insight).toBeDefined();
      expect(data.insight.length).toBeGreaterThan(20);
    }
  });

  it('returns insight with optional text', async () => {
    const request = new Request('http://localhost/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood_score: 4, text: 'Had a great meeting today' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.insight).toBeDefined();
  });
});

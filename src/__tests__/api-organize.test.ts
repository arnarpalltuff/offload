import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/organize/route';

// These tests run against the demo mode (no Supabase/Claude needed)

describe('POST /api/organize', () => {
  it('rejects requests with no body', async () => {
    const request = new Request('http://localhost/api/organize', {
      method: 'POST',
      body: 'not json',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid JSON');
  });

  it('rejects requests with missing text field', async () => {
    const request = new Request('http://localhost/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('text');
  });

  it('rejects empty text after trimming', async () => {
    const request = new Request('http://localhost/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('organizes text in demo mode and returns valid structure', async () => {
    const request = new Request('http://localhost/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I need to finish my report today and also worried about the meeting' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.organized).toBeDefined();
    expect(data.organized.must_do).toBeDefined();
    expect(data.organized.can_wait).toBeDefined();
    expect(data.organized.ideas).toBeDefined();
    expect(data.organized.worries).toBeDefined();
    expect(data.organized.summary).toBeDefined();
    expect(typeof data.organized.summary).toBe('string');
  });

  it('detects urgent items correctly', async () => {
    const request = new Request('http://localhost/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I have a deadline today for the quarterly report' }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(data.organized.must_do.length).toBeGreaterThan(0);
  });

  it('detects worries correctly', async () => {
    const request = new Request('http://localhost/api/organize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I am so worried and anxious about everything' }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(data.organized.worries.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { getTodayDate, formatDate, generateId } from '@/lib/utils';

describe('getTodayDate', () => {
  it('returns a YYYY-MM-DD formatted string', () => {
    const date = getTodayDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatDate', () => {
  it('formats a date string into a readable format', () => {
    const result = formatDate('2025-03-15');
    // Should contain "March" and "15"
    expect(result).toContain('March');
    expect(result).toContain('15');
  });

  it('includes the day of week', () => {
    const result = formatDate('2025-01-01');
    // January 1, 2025 is a Wednesday
    expect(result).toContain('Wednesday');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

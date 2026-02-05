import { formatDate, formatDateTime, truncateText, getAvailableSpots, getFillRate, cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const result = formatDate('2026-02-15T00:00:00.000Z');
      expect(result).toBe('15 février 2026');
    });

    it('returns original string for invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });

    it('accepts custom format', () => {
      const result = formatDate('2026-02-15T00:00:00.000Z', 'dd/MM/yyyy');
      expect(result).toBe('15/02/2026');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const result = formatDateTime('2026-02-15T00:00:00.000Z', '14:00');
      expect(result).toContain('14:00');
      expect(result).toContain('2026');
    });

    it('formats date without time', () => {
      const result = formatDateTime('2026-02-15T00:00:00.000Z');
      expect(result).not.toContain('à');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23);
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe('Short text');
    });
  });

  describe('getAvailableSpots', () => {
    it('calculates available spots correctly', () => {
      expect(getAvailableSpots(30, 10)).toBe(20);
      expect(getAvailableSpots(30, 30)).toBe(0);
      expect(getAvailableSpots(30, 0)).toBe(30);
    });

    it('returns 0 for overbooking', () => {
      expect(getAvailableSpots(30, 35)).toBe(0);
    });
  });

  describe('getFillRate', () => {
    it('calculates fill rate correctly', () => {
      expect(getFillRate(100, 50)).toBe(50);
      expect(getFillRate(100, 100)).toBe(100);
      expect(getFillRate(100, 0)).toBe(0);
    });

    it('returns 0 for zero capacity', () => {
      expect(getFillRate(0, 10)).toBe(0);
    });

    it('rounds to nearest integer', () => {
      expect(getFillRate(30, 10)).toBe(33);
    });
  });

  describe('cn (className utility)', () => {
    it('merges class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'excluded');
      expect(result).toBe('base conditional');
    });

    it('merges tailwind classes correctly', () => {
      const result = cn('px-4', 'px-6');
      expect(result).toBe('px-6');
    });
  });
});

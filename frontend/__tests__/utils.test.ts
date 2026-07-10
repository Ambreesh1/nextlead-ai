import { formatBytes, formatDate, titleCaseFromSnake, cn } from '@/lib/utils';

describe('formatBytes', () => {
  it('formats bytes under 1KB as-is', () => {
    expect(formatBytes(512)).toBe('512 B');
  });
  it('formats KB range with one decimal', () => {
    expect(formatBytes(2048)).toBe('2.0 KB');
  });
  it('formats MB range with two decimals', () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
  });
});

describe('formatDate', () => {
  it('returns a dash for null/undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
  it('returns the raw string if unparseable', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
  it('formats a valid date string', () => {
    expect(formatDate('2026-05-13')).toMatch(/May 1[23], 2026/);
  });
});

describe('titleCaseFromSnake', () => {
  it('converts snake_case to Title Case', () => {
    expect(titleCaseFromSnake('leads_on_demand')).toBe('Leads On Demand');
  });
  it('handles a single word', () => {
    expect(titleCaseFromSnake('eden')).toBe('Eden');
  });
});

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

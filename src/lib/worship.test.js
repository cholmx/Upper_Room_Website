import { describe, it, expect } from 'vitest';
import { worshipLine } from './worship';

const at = (iso) => new Date(iso);

describe('worshipLine', () => {
  it('says today before the service', () => {
    expect(worshipLine(at('2026-11-08T12:00:00Z'))).toBe('Worship starts today at 10:30am'); // 7:00am in Ohio
  });
  it('says now during the service', () => {
    expect(worshipLine(at('2026-11-08T16:00:00Z'))).toBe('Worship is happening right now'); // 11:00am in Ohio
  });
  it('counts the days after the service', () => {
    expect(worshipLine(at('2026-11-08T20:00:00Z'))).toBe('Worship is in 7 days, Sunday at 10:30am');
    expect(worshipLine(at('2026-11-11T20:00:00Z'))).toBe('Worship is in 4 days, Sunday at 10:30am');
  });
  it('says tomorrow on Saturday', () => {
    expect(worshipLine(at('2026-11-14T20:00:00Z'))).toBe('Worship is tomorrow at 10:30am');
  });
});

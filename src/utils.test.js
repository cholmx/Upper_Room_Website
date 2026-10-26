import { describe, it, expect } from 'vitest';
import { ytId, ytEmbed, slugify, isLive, expandEvents, buildIcs, imgUrl, formatDate } from './utils';

describe('youtube helpers', () => {
  it('extracts ids from watch, short, and embed links', () => {
    expect(ytId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')).toBe('dQw4w9WgXcQ');
    expect(ytId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(ytId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('returns null for junk', () => {
    expect(ytId('')).toBeNull();
    expect(ytId('https://example.com')).toBeNull();
    expect(ytEmbed('nope')).toBeNull();
  });
  it('builds an embed url', () => {
    expect(ytEmbed('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('  Our Beliefs & Values! ')).toBe('our-beliefs-values');
  });
  it('falls back to "page"', () => {
    expect(slugify('')).toBe('page');
  });
});

describe('formatDate', () => {
  it('formats ISO dates in uppercase', () => {
    expect(formatDate('2025-03-09')).toMatch(/MAR 9, 2025/);
  });
});

describe('isLive', () => {
  const today = '2025-06-01';
  it('treats rows without publish fields as live', () => {
    expect(isLive({ title: 'old row' }, today)).toBe(true);
  });
  it('hides drafts in every stored shape', () => {
    for (const v of [false, 0, '0', 'false']) expect(isLive({ published: v }, today)).toBe(false);
  });
  it('hides future-dated items and shows past or same-day items', () => {
    expect(isLive({ published: 1, publish_date: '2025-06-02' }, today)).toBe(false);
    expect(isLive({ published: 1, publish_date: '2025-06-01' }, today)).toBe(true);
    expect(isLive({ published: 1, publish_date: '2025-05-01' }, today)).toBe(true);
  });
  it('rejects missing items', () => {
    expect(isLive(null, today)).toBe(false);
  });
});

describe('expandEvents', () => {
  const from = '2025-06-01';
  it('drops past one-off events and keeps upcoming ones', () => {
    const out = expandEvents([
      { id: 1, date: '2025-05-01', recurrence: 'none' },
      { id: 2, date: '2025-06-10' },
    ], from, 60);
    expect(out.map(e => e.id)).toEqual([2]);
  });
  it('expands weekly events inside the horizon', () => {
    const out = expandEvents([{ id: 1, date: '2025-05-25', recurrence: 'weekly' }], from, 20);
    expect(out.map(e => e.occurrence_date)).toEqual(['2025-06-01', '2025-06-08', '2025-06-15']);
  });
  it('expands biweekly and monthly events', () => {
    expect(expandEvents([{ id: 1, date: '2025-06-01', recurrence: 'biweekly' }], from, 30).map(e => e.occurrence_date))
      .toEqual(['2025-06-01', '2025-06-15', '2025-06-29']);
    expect(expandEvents([{ id: 1, date: '2025-05-15', recurrence: 'monthly' }], from, 60).map(e => e.occurrence_date))
      .toEqual(['2025-06-15', '2025-07-15']);
  });
  it('sorts across events and skips events without a date', () => {
    const out = expandEvents([{ id: 1, date: '2025-06-20' }, { id: 2, date: '2025-06-05' }, { id: 3 }], from, 60);
    expect(out.map(e => e.id)).toEqual([2, 1]);
  });
});

describe('buildIcs', () => {
  it('creates an all-day event and escapes text', () => {
    const ics = buildIcs({ id: 5, title: 'Pot Luck, Games; Fun', occurrence_date: '2025-06-08', location: 'Fellowship Hall', time: '6 PM' });
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20250608');
    expect(ics).toContain('DTEND;VALUE=DATE:20250609');
    expect(ics).toContain('SUMMARY:Pot Luck\\, Games\\; Fun');
    expect(ics).not.toContain('RRULE');
  });
  it('adds a recurrence rule', () => {
    expect(buildIcs({ id: 1, title: 'x', date: '2025-06-08', recurrence: 'biweekly' })).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2');
  });
  it('returns nothing without a date', () => {
    expect(buildIcs({ title: 'x' })).toBe('');
  });
});

describe('imgUrl', () => {
  it('resizes unsplash images to webp', () => {
    const out = imgUrl('https://images.unsplash.com/photo-1?auto=format&w=2000', 800);
    expect(out).toContain('w=800');
    expect(out).toContain('fm=webp');
  });
  it('leaves other hosts alone', () => {
    expect(imgUrl('https://example.com/a.jpg', 800)).toBe('https://example.com/a.jpg');
  });
});

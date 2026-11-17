import { describe, it, expect } from 'vitest';
import { nextOccurrence, formatTime, timeRange, upcoming, frequencyLabel, parseDay } from './events';

const d = (s) => parseDay(s);
const iso = (x) => x && `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

describe('nextOccurrence', () => {
  it('keeps a one time event in the future and drops it once past', () => {
    const ev = { event_date: '2026-11-20', is_recurring: false };
    expect(iso(nextOccurrence(ev, d('2026-11-10')))).toBe('2026-11-20');
    expect(iso(nextOccurrence(ev, d('2026-11-20')))).toBe('2026-11-20');
    expect(nextOccurrence(ev, d('2026-11-21'))).toBeNull();
  });
  it('finds the next first Sunday of the month', () => {
    const ev = { event_date: '2026-10-04', is_recurring: true, recurrence_type: 'monthly', recurrence_day: 'Sunday', recurrence_week: 'first' };
    expect(iso(nextOccurrence(ev, d('2026-11-10')))).toBe('2026-12-06');
    expect(iso(nextOccurrence(ev, d('2026-12-06')))).toBe('2026-12-06');
  });
  it('finds the next second Sunday', () => {
    const ev = { event_date: '2026-09-13', is_recurring: true, recurrence_type: 'monthly', recurrence_day: 'Sunday', recurrence_week: 'second' };
    expect(iso(nextOccurrence(ev, d('2026-11-10')))).toBe('2026-12-13');
  });
  it('finds the next weekly day and stops after the end date', () => {
    const ev = { event_date: '2026-09-13', is_recurring: true, recurrence_type: 'weekly', recurrence_day: 'Wednesday', recurrence_end: '2026-11-04' };
    expect(iso(nextOccurrence(ev, d('2026-10-30')))).toBe('2026-11-04');
    expect(nextOccurrence(ev, d('2026-11-05'))).toBeNull();
  });
  it('treats a date range that is running as today', () => {
    const ev = { event_date: '2026-11-15', is_recurring: true, recurrence_type: 'date_range', recurrence_end: '2026-11-23' };
    expect(iso(nextOccurrence(ev, d('2026-11-18')))).toBe('2026-11-18');
    expect(nextOccurrence(ev, d('2026-11-24'))).toBeNull();
  });
});

describe('times and labels', () => {
  it('formats times and ignores middle of the night ones', () => {
    expect(formatTime('18:30')).toBe('6:30 PM');
    expect(formatTime('09:00')).toBe('9:00 AM');
    expect(formatTime('00:15')).toBe('');
    expect(timeRange({ event_time: '18:00', end_time: '20:30' })).toBe('6:00 PM to 8:30 PM');
    expect(timeRange({ event_time: '17:00', end_time: '12:00', recurrence_type: 'date_range' })).toBe('5:00 PM');
  });
  it('writes the dash in a label out as to', () => {
    expect(frequencyLabel({ recurrence_label: 'Oct 9 \u2013 Oct 10, 2026' })).toBe('Oct 9 to Oct 10, 2026');
  });
  it('lists upcoming events soonest first', () => {
    const list = upcoming([
      { id: 'a', title: 'B', event_date: '2026-11-20' },
      { id: 'b', title: 'A', event_date: '2026-11-14' },
      { id: 'c', title: 'Old', event_date: '2026-09-01' },
    ], d('2026-11-10'));
    expect(list.map(x => x.ev.id)).toEqual(['b', 'a']);
  });
});

describe('plain', () => {
  it('writes dashes in event text as commas', async () => {
    const { plain } = await import('./events');
    expect(plain('Gathering – all welcome')).toBe('Gathering, all welcome');
    expect(plain('up—in the best way')).toBe('up, in the best way');
  });
});

describe('blurb', () => {
  it('drops the event name repeated at the start of the description', async () => {
    const { blurb } = await import('./events');
    expect(blurb({ title: 'Young Adults Gathering', summary: 'Young Adults Gathering – The young adults will meet Friday.' })).toBe('The young adults will meet Friday.');
    expect(blurb({ title: 'First Steps', summary: 'A short get-together for new people.' })).toBe('A short get-together for new people.');
  });
});

describe('event structured data', () => {
  const site = { name: 'Upper Room Fellowship', url: 'https://www.urfellowship.com', address: { street: '500 Sponseller Road', city: 'Columbiana', region: 'OH', postalCode: '44408' } };
  const day = new Date(2026, 10, 20);

  it('fills in the description, address and organizer website for an event with little information', async () => {
    const { eventJsonLd } = await import('./events');
    const j = eventJsonLd({ title: 'First Steps', event_time: '11:45' }, day, site);
    expect(j.description).toMatch(/First Steps at Upper Room Fellowship in Columbiana, Ohio/);
    expect(j.location.address.streetAddress).toBe('500 Sponseller Road');
    expect(j.organizer.url).toBe('https://www.urfellowship.com/');
    expect(j.startDate).toBe('2026-11-20T11:45:00');
    expect(j.url).toBe('https://www.urfellowship.com/events');
  });

  it('uses the church address for rooms in the building and the written place for other locations', async () => {
    const { eventJsonLd } = await import('./events');
    expect(eventJsonLd({ title: 'A', location: 'Fellowship Hall' }, day, site).location.address.addressLocality).toBe('Columbiana');
    expect(eventJsonLd({ title: 'A', location: 'URF' }, day, site).location.address.postalCode).toBe('44408');
    const away = eventJsonLd({ title: 'B', location: 'Camp Frederick, Rogers, OH', link: 'https://example.com/signup' }, day, site);
    expect(away.location).toEqual({ '@type': 'Place', name: 'Camp Frederick, Rogers, OH', address: 'Camp Frederick, Rogers, OH' });
    expect(away.url).toBe('https://example.com/signup');
  });

  it('uses the summary as the description', async () => {
    const { eventJsonLd } = await import('./events');
    expect(eventJsonLd({ title: 'C', summary: 'Join us for lunch.' }, day, site).description).toBe('Join us for lunch.');
  });
});

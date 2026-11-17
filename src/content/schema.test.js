import { describe, it, expect } from 'vitest';
import { schemaFor, faqPage, breadcrumbs } from './schema';

describe('structured data', () => {
  it('describes the Sunday service on the home and visit pages', () => {
    for (const path of ['/', '/plan-your-visit']) {
      const types = schemaFor(path).map(d => d['@type']);
      expect(types).toContain('Event');
      expect(types).toContain('BreadcrumbList');
    }
  });
  it('adds the questions and answers on the discipleship and Sozo pages', () => {
    for (const path of ['/discipleship', '/sozo']) {
      const faq = schemaFor(path).find(d => d['@type'] === 'FAQPage');
      expect(faq.mainEntity.length).toBeGreaterThan(3);
      expect(faq.mainEntity[0].acceptedAnswer.text.length).toBeGreaterThan(10);
    }
  });
  it('lists the pastors as people', () => {
    expect(schemaFor('/leadership').filter(d => d['@type'] === 'Person').length).toBeGreaterThanOrEqual(4);
  });
  it('has nothing for an unknown address', () => {
    expect(schemaFor('/nope')).toEqual([]);
  });
  it('builds a breadcrumb trail with full addresses', () => {
    const b = breadcrumbs([['Home', '/'], ['About', '/about']]);
    expect(b.itemListElement[1].item).toMatch(/^https?:\/\/.+\/about$/);
    expect(b.itemListElement[1].position).toBe(2);
  });
  it('builds FAQ data from pairs', () => {
    expect(faqPage([['Q?', 'A.']]).mainEntity[0].name).toBe('Q?');
  });
});

describe('the Sunday service data Google requires', () => {
  it('has a start date, an end date, an image, a performer and an offer', async () => {
    const { sundayService, nextSunday } = await import('./schema');
    const s = sundayService();
    expect(s.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T10:30:00$/);
    expect(s.endDate).toMatch(/T11:45:00$/);
    expect(s.image[0]).toMatch(/og-default\.png$/);
    expect(s.performer.name).toBeTruthy();
    expect(s.offers.price).toBe('0');
    expect(new Date(`${s.startDate.slice(0, 10)}T12:00:00Z`).getUTCDay()).toBe(0);
    // Wednesday gives the coming Sunday. On Sunday before noon it is today, and after noon it is next week.
    expect(nextSunday(new Date('2026-11-18T15:00:00Z'))).toBe('2026-11-22');
    expect(nextSunday(new Date('2026-11-22T14:00:00Z'))).toBe('2026-11-22');
    expect(nextSunday(new Date('2026-11-22T19:00:00Z'))).toBe('2026-11-29');
  });
});

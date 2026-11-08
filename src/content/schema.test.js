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

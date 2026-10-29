import { describe, it, expect } from 'vitest';
import { SEO, SEO_ROUTES } from './content/seo';

describe('page titles and descriptions', () => {
  it.each(Object.entries(SEO))('%s fits search results', (key, [title, description]) => {
    expect(title.length).toBeLessThan(60);
    expect(description.length).toBeLessThan(155);
    expect(title).toMatch(/Upper Room Fellowship/);
  });

  it('has no em dashes', () => {
    for (const [title, description] of Object.values(SEO)) {
      expect(title + description).not.toMatch(/[—–]/);
    }
  });

  it('gives every title a unique value', () => {
    const titles = Object.values(SEO).map(v => v[0]);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('lists a route for every indexable page', () => {
    for (const key of Object.keys(SEO_ROUTES)) expect(SEO[key]).toBeTruthy();
  });
});

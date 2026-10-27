import { describe, it, expect } from 'vitest';
import { validate, autoSlug } from './validate';

const fields = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title' },
  { name: 'video', label: 'Video', type: 'youtube' },
  { name: 'when', label: 'Date', type: 'date' },
  { name: 'link', label: 'Link', type: 'url' },
];

describe('validate', () => {
  it('flags missing required fields', () => {
    expect(validate(fields, { title: '  ' }).title).toMatch(/required/);
  });
  it('accepts a valid record', () => {
    expect(validate(fields, { title: 'Hi', slug: 'hi', video: 'https://youtu.be/dQw4w9WgXcQ', when: '2025-02-28', link: 'https://a.com' })).toEqual({});
  });
  it('rejects bad youtube, date, and url values', () => {
    const e = validate(fields, { title: 'Hi', video: 'https://vimeo.com/1', when: '2025-02-31x', link: 'javascript:alert(1)' });
    expect(Object.keys(e).sort()).toEqual(['link', 'video', 'when']);
  });
  it('rejects malformed and duplicate slugs', () => {
    expect(validate(fields, { title: 'Hi', slug: 'Bad Slug' }).slug).toBeTruthy();
    expect(validate(fields, { id: 2, title: 'Hi', slug: 'taken' }, [{ id: 1, slug: 'taken' }]).slug).toMatch(/already used/);
    expect(validate(fields, { id: 1, title: 'Hi', slug: 'taken' }, [{ id: 1, slug: 'taken' }]).slug).toBeUndefined();
  });
});

describe('autoSlug', () => {
  it('fills an empty slug from the title but keeps an existing one', () => {
    expect(autoSlug(fields, { title: 'Our Beliefs', slug: '' }).slug).toBe('our-beliefs');
    expect(autoSlug(fields, { title: 'Our Beliefs', slug: 'custom' }).slug).toBe('custom');
  });
});

describe('email fields', () => {
  const f = [{ name: 'email', label: 'Email', type: 'email' }];
  it('accepts a valid address and blank values', () => {
    expect(validate(f, { email: 'pastor@church.org' })).toEqual({});
    expect(validate(f, { email: '' })).toEqual({});
  });
  it('rejects malformed addresses', () => {
    expect(validate(f, { email: 'not-an-email' }).email).toBeTruthy();
    expect(validate(f, { email: 'a@b' }).email).toBeTruthy();
  });
});

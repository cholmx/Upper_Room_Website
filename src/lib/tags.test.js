import { describe, it, expect } from 'vitest';
import { parseTags, addTag, removeTag } from './tags';

describe('tags', () => {
  it('splits, trims and removes repeats', () => {
    expect(parseTags(' Prayer, family ,prayer,, ')).toEqual(['Prayer', 'family']);
  });
  it('adds a tag once', () => {
    expect(addTag('Prayer', 'Family')).toBe('Prayer, Family');
    expect(addTag('Prayer, Family', 'family')).toBe('Prayer, Family');
    expect(addTag('', 'Hope')).toBe('Hope');
  });
  it('removes a tag whatever its case', () => {
    expect(removeTag('Prayer, Family', 'family')).toBe('Prayer');
    expect(removeTag('', 'x')).toBe('');
  });
});

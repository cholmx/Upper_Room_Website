import { describe, it, expect } from 'vitest';
import { parseCategories, addCategory, removeCategory } from './categories';

describe('categories', () => {
  it('splits, trims and removes repeats', () => {
    expect(parseCategories(' Prayer, healing and wholeness ,prayer,, ')).toEqual(['Prayer', 'healing and wholeness']);
  });
  it('keeps one category as it is', () => {
    expect(parseCategories('Worship')).toEqual(['Worship']);
  });
  it('adds a category once', () => {
    expect(addCategory('Prayer', 'Worship')).toBe('Prayer, Worship');
    expect(addCategory('Prayer, Worship', 'worship')).toBe('Prayer, Worship');
    expect(addCategory('', 'Hope')).toBe('Hope');
  });
  it('removes a category whatever its case', () => {
    expect(removeCategory('Prayer, Worship', 'worship')).toBe('Prayer');
    expect(removeCategory('', 'x')).toBe('');
  });
});

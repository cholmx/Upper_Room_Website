import { describe, it, expect } from 'vitest';
import { renderMarkdown, plainText } from './markdown';

describe('renderMarkdown', () => {
  it('renders basic formatting', () => {
    expect(renderMarkdown('**hi**')).toContain('<strong>hi</strong>');
  });
  it('strips scripts, event handlers, and javascript links', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n[x](javascript:alert(1))');
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/javascript:/i);
  });
  it('opens external links safely', () => {
    expect(renderMarkdown('[a](https://example.com)')).toContain('rel="noopener noreferrer"');
  });
});

describe('plainText', () => {
  it('removes markup', () => {
    expect(plainText('## Title\n\nSome **bold** text')).toBe('Title Some bold text');
  });
  it('handles empty input', () => {
    expect(plainText(undefined)).toBe('');
  });
});

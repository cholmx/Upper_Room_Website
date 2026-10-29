import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import config from '../tailwind.config.js';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const colors = config.theme.extend.colors;
const hexOf = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))?.[1].toUpperCase();

// index.css repeats a few brand colors as plain hex (so a stale Tailwind config can never
// break the stylesheet). This keeps those copies equal to the Tailwind tokens.
describe('index.css brand colors match tailwind.config.js', () => {
  it.each([
    ['dark', colors.ink.DEFAULT],
    ['light', colors.cream.DEFAULT],
    ['yellow', colors.gold.DEFAULT],
    ['muted', colors.gold.bronze],
    ['black', colors.ink.deep],
  ])('--%s', (name, token) => {
    expect(hexOf(name)).toBe(token.toUpperCase());
  });

  it('has no theme() lookups that depend on the Tailwind config being loaded', () => {
    expect(css).not.toMatch(/theme\(/);
  });
});

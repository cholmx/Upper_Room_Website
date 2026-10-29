import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CHECKLIST_IDS } from './content/checklist';

function walk(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk('src').filter(f => /\.(jsx?|js)$/.test(f) && !f.endsWith('.test.js') && !f.includes('checklist.js'));
const source = files.map(f => readFileSync(f, 'utf8')).join('\n');

function usedIds() {
  const ids = new Set();
  const patterns = [
    /<Todo id="([a-z0-9-]+)"/g,
    /todo: '([a-z0-9-]+)'/g,
    /todo: \{ id: '([a-z0-9-]+)'/g,
    /PASTE\('([a-z0-9-]+)'/g,
    /\['[^'\n]+', '[^'\n]+', '(serve-[a-z]+)'\]/g,
  ];
  for (const re of patterns) for (const m of source.matchAll(re)) ids.add(m[1]);
  return ids;
}

describe('content to confirm checklist', () => {
  it('has an entry for every placeholder shown on the site', () => {
    const missing = [...usedIds()].filter(id => !CHECKLIST_IDS.includes(id));
    expect(missing).toEqual([]);
  });

  it('has no duplicate entries', () => {
    expect(new Set(CHECKLIST_IDS).size).toBe(CHECKLIST_IDS.length);
  });
});

describe('writing rules', () => {
  it('uses no em dashes or en dashes anywhere in the site code', () => {
    const bad = files.filter(f => /[—–]/.test(readFileSync(f, 'utf8')));
    expect(bad).toEqual([]);
  });

  it('never uses "click here" as link text', () => {
    expect(source).not.toMatch(/>\s*click here\s*</i);
  });
});

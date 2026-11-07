// Categories are kept as one text value separated by commas, for example "Prayer, Healing and Wholeness".

export function parseCategories(text) {
  const seen = new Set();
  const out = [];
  for (const raw of String(text || '').split(',')) {
    const item = raw.trim().replace(/\s+/g, ' ');
    const key = item.toLowerCase();
    if (item && !seen.has(key)) { seen.add(key); out.push(item); }
  }
  return out;
}

export const joinCategories = (list) => list.join(', ');

export function addCategory(text, name) {
  return joinCategories(parseCategories(`${text || ''},${name}`));
}

export function removeCategory(text, name) {
  const key = String(name || '').trim().toLowerCase();
  return joinCategories(parseCategories(text).filter(t => t.toLowerCase() !== key));
}
